import { Prisma, PrismaClient, ReviewAction, ValueStatus } from '@prisma/client';
import { evaluateFormula } from './calculation-engine';
import { coerceFormulaValues, validateAttributeValues, type AttributeValues } from './submission-validator';

const CONFIG_INCLUDE = {
  isoArea: true,
  attributes: { include: { listOptions: true }, orderBy: { sortOrder: 'asc' as const } },
  formulas: { where: { isActive: true }, orderBy: { version: 'desc' as const }, take: 1 },
  validationRules: true,
  pics: { include: { division: true } },
};

export interface SubmissionInput {
  metricId: string;
  reportingPeriodId: string;
  attributeValues: AttributeValues;
  notes?: string;
}

function publicError(message: string, status = 422) {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}

async function getMetricConfiguration(prisma: PrismaClient, metricId: string) {
  const metric = await prisma.metric.findUnique({ where: { id: metricId }, include: CONFIG_INCLUDE });
  if (!metric || metric.status !== 'Active') throw publicError('Metric configuration was not found.', 404);
  return metric;
}

async function getOpenPeriod(prisma: PrismaClient, periodId: string) {
  const period = await prisma.reportingPeriod.findUnique({ where: { id: periodId } });
  if (!period) throw publicError('Reporting period was not found.', 404);
  if (period.status !== 'Open') throw publicError('This reporting period is not open for editing.');
  return period;
}

function calculate(metric: Awaited<ReturnType<typeof getMetricConfiguration>>, attributeValues: AttributeValues) {
  const errors = validateAttributeValues(metric.attributes, attributeValues, metric.validationRules);
  if (errors.length) throw publicError(JSON.stringify({ message: 'Validation failed.', errors }));
  const formula = metric.formulas[0];
  if (!formula) return { result: null, formulaVersion: null };
  try {
    const evaluation = evaluateFormula(formula.formula, coerceFormulaValues(metric.attributes, attributeValues));
    return { result: evaluation.result, formulaVersion: String(formula.version) };
  } catch {
    throw publicError('Unable to calculate this metric. Please check the required input values.');
  }
}

async function assertPermission(metric: Awaited<ReturnType<typeof getMetricConfiguration>>, userId: string | undefined, role: string) {
  if (role === 'ADMIN') return;
  if (!userId) throw publicError('Authentication is required.', 401);
  const allowed = metric.pics.some(pic => pic.userId === userId);
  if (!allowed) throw publicError('You do not have permission to edit this metric.', 403);
}

async function createSubmissionVersion(tx: Prisma.TransactionClient, submission: { id: string; status: ValueStatus; attributeValues: Prisma.JsonValue; calculatedResult: Prisma.Decimal | null; formulaVersion: string | null }, userId?: string) {
  const latest = await tx.submissionVersion.aggregate({ where: { metricValueId: submission.id }, _max: { version: true } });
  return tx.submissionVersion.create({ data: { metricValueId: submission.id, version: (latest._max.version ?? 0) + 1, status: submission.status, attributeValues: submission.attributeValues as never, calculatedResult: submission.calculatedResult ?? undefined, formulaVersion: submission.formulaVersion, createdById: userId } });
}

export async function getMetricForm(prisma: PrismaClient, metricId: string) {
  const metric = await getMetricConfiguration(prisma, metricId);
  return { metric, attributes: metric.attributes, formula: metric.formulas[0] ?? null, validationRules: metric.validationRules, responsibleDivision: metric.pics.map(pic => pic.division), pic: metric.pics };
}

export async function listPeriods(prisma: PrismaClient) {
  return prisma.reportingPeriod.findMany({ orderBy: [{ year: 'desc' }, { startDate: 'desc' }] });
}

export async function createDraft(prisma: PrismaClient, input: SubmissionInput, userId: string | undefined, role: string) {
  const metric = await getMetricConfiguration(prisma, input.metricId);
  await assertPermission(metric, userId, role);
  await getOpenPeriod(prisma, input.reportingPeriodId);
  const existing = await prisma.metricValue.findUnique({ where: { metricId_reportingPeriodId: { metricId: input.metricId, reportingPeriodId: input.reportingPeriodId } } });
  if (existing && existing.status !== ValueStatus.Draft && existing.status !== ValueStatus.NeedsRevision) throw publicError('This submission cannot be edited in its current status.');
  if (existing && role !== 'ADMIN' && existing.submittedById !== userId) throw publicError('You do not have permission to edit this submission.', 403);
  const calculation = calculate(metric, input.attributeValues);
  const data = {
    attributeValues: input.attributeValues as Prisma.InputJsonObject,
    calculatedResult: calculation.result,
    formulaVersion: calculation.formulaVersion,
    notes: input.notes,
    submittedById: userId,
    status: ValueStatus.Draft,
  };
  return prisma.$transaction(async tx => {
    const saved = await tx.metricValue.upsert({ where: { metricId_reportingPeriodId: { metricId: input.metricId, reportingPeriodId: input.reportingPeriodId } }, update: data, create: { ...data, metricId: input.metricId, reportingPeriodId: input.reportingPeriodId }, include: { metric: { include: CONFIG_INCLUDE }, reportingPeriod: true } });
    await createSubmissionVersion(tx, saved, userId);
    await tx.auditLog.create({ data: { userId, entityType: 'MetricValue', entityId: saved.id, action: existing ? 'UPDATE_SUBMISSION' : 'CREATE_SUBMISSION', oldValues: existing ? { status: existing.status, attributeValues: existing.attributeValues } as never : undefined, newValues: { status: saved.status, attributeValues: saved.attributeValues } as never, description: `${existing ? 'Updated' : 'Created'} draft for ${metric.name}.` } });
    return saved;
  });
}

export async function getSubmission(prisma: PrismaClient, id: string, userId: string | undefined, role: string) {
  const submission = await prisma.metricValue.findUnique({ where: { id }, include: { metric: { include: CONFIG_INCLUDE }, reportingPeriod: true, reviews: { orderBy: { reviewedAt: 'desc' } } } });
  if (!submission) throw publicError('Submission was not found.', 404);
  await assertPermission(submission.metric, userId, role);
  return submission;
}

export async function listSubmissions(prisma: PrismaClient, userId: string | undefined, role: string, metricId?: string) {
  const where: Prisma.MetricValueWhereInput = metricId ? { metricId } : {};
  if (role !== 'ADMIN') where.submittedById = userId;
  return prisma.metricValue.findMany({ where, include: { metric: { include: { isoArea: true } }, reportingPeriod: true }, orderBy: { updatedAt: 'desc' } });
}

export async function calculateSubmission(prisma: PrismaClient, id: string, userId: string | undefined, role: string, attributeValues?: AttributeValues) {
  const submission = await getSubmission(prisma, id, userId, role);
  if (submission.status !== ValueStatus.Draft && submission.status !== ValueStatus.NeedsRevision) throw publicError('Only drafts or revision-required submissions can be recalculated.');
  const values = attributeValues ?? submission.attributeValues as AttributeValues;
  const calculation = calculate(submission.metric, values);
  return prisma.$transaction(async tx => {
    const changed = await tx.metricValue.updateMany({ where: { id, status: submission.status }, data: { attributeValues: values as Prisma.InputJsonObject, calculatedResult: calculation.result, formulaVersion: calculation.formulaVersion } });
    if (changed.count !== 1) throw publicError('Submission status changed. Refresh and try again.', 409);
    const saved = await tx.metricValue.findUniqueOrThrow({ where: { id }, include: { metric: true, reportingPeriod: true } });
    await createSubmissionVersion(tx, saved, userId);
    await tx.auditLog.create({ data: { userId, entityType: 'MetricValue', entityId: id, action: 'UPDATE_SUBMISSION', oldValues: { status: submission.status, attributeValues: submission.attributeValues } as never, newValues: { status: saved.status, attributeValues: saved.attributeValues } as never, description: `Updated ${submission.metric.name}.` } });
    return saved;
  });
}

export async function submitSubmission(prisma: PrismaClient, id: string, userId: string | undefined, role: string) {
  const submission = await getSubmission(prisma, id, userId, role);
  if (submission.status !== ValueStatus.Draft && submission.status !== ValueStatus.NeedsRevision) throw publicError('This submission cannot be submitted from its current status.');
  const calculation = calculate(submission.metric, submission.attributeValues as AttributeValues);
  if (submission.reportingPeriod.status !== 'Open') throw publicError('This reporting period is not open for submission.');
  return prisma.$transaction(async tx => {
    const changed = await tx.metricValue.updateMany({ where: { id, status: submission.status }, data: { status: ValueStatus.Submitted, submittedAt: new Date(), calculatedResult: calculation.result, formulaVersion: calculation.formulaVersion } });
    if (changed.count !== 1) throw publicError('Submission status changed. Refresh and try again.', 409);
    const saved = await tx.metricValue.findUniqueOrThrow({ where: { id }, include: { metric: true, reportingPeriod: true } });
    await createSubmissionVersion(tx, saved, userId);
    if (userId) await tx.review.create({ data: { metricValueId: id, reviewerId: userId, action: ReviewAction.Submit, statusFrom: submission.status, statusTo: ValueStatus.Submitted } });
    await tx.auditLog.create({ data: { userId, entityType: 'MetricValue', entityId: id, action: 'SUBMIT_SUBMISSION', oldValues: { status: submission.status } as never, newValues: { status: ValueStatus.Submitted } as never, description: `Submitted ${submission.metric.name} for review.` } });
    return saved;
  });
}

export { publicError };
