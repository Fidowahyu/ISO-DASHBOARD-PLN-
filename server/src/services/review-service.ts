import { Prisma, PrismaClient, ReviewAction, ValueStatus } from '@prisma/client';
import { evaluateFormula } from './calculation-engine';
import { coerceFormulaValues, validateAttributeValues, type AttributeValues } from './submission-validator';
import { canReview, canViewAllSubmissions, transitionStatus, type ReviewTransition } from './review-state-machine';

const SUBMISSION_INCLUDE = {
  metric: { include: { isoArea: true, attributes: { include: { listOptions: true } }, formulas: { where: { isActive: true }, orderBy: { version: 'desc' as const }, take: 1 }, validationRules: true, pics: { include: { division: true } } } },
  reportingPeriod: true,
  submittedBy: { select: { id: true, fullName: true, email: true } },
  reviews: { include: { reviewer: { select: { id: true, fullName: true } } }, orderBy: { reviewedAt: 'asc' as const } },
  reviewComments: { include: { author: { select: { id: true, fullName: true } } }, orderBy: { createdAt: 'asc' as const } },
  versions: { include: { createdBy: { select: { id: true, fullName: true } } }, orderBy: { version: 'asc' as const } },
};

type Actor = { id: string; role: string; fullName?: string };
type RequestContext = { ipAddress?: string; userAgent?: string };

function error(message: string, status = 422) { return Object.assign(new Error(message), { status }); }
function ensureReviewer(actor: Actor) { if (!canReview(actor.role)) throw error('Only reviewers or administrators can perform this action.', 403); }
function jsonValue(value: unknown) { return value as Prisma.InputJsonValue; }

async function getSubmission(prisma: PrismaClient, id: string) {
  const submission = await prisma.metricValue.findUnique({ where: { id }, include: SUBMISSION_INCLUDE });
  if (!submission) throw error('Submission was not found.', 404);
  return submission;
}

function assertVisible(submission: Awaited<ReturnType<typeof getSubmission>>, actor: Actor) {
  if (canViewAllSubmissions(actor.role)) return;
  if (actor.role === 'PIC' && submission.submittedById === actor.id) return;
  throw error('You do not have permission to view this submission.', 403);
}

function validateForApproval(submission: Awaited<ReturnType<typeof getSubmission>>) {
  const values = submission.attributeValues as AttributeValues;
  const validationErrors = validateAttributeValues(submission.metric.attributes, values, submission.metric.validationRules);
  if (validationErrors.length) throw error('Cannot approve submission. Required validation has not passed.');
  const formula = submission.metric.formulas[0];
  if (formula) {
    try {
      const result = evaluateFormula(formula.formula, coerceFormulaValues(submission.metric.attributes, values)).result;
      if (submission.calculatedResult == null || Number(submission.calculatedResult) !== result) throw error('Cannot approve submission. Calculation is not current.');
    } catch (cause) { if (cause instanceof Error && cause.message.startsWith('Cannot approve')) throw cause; throw error('Cannot approve submission. Calculation has not passed.'); }
  }
}

async function createVersion(tx: Prisma.TransactionClient, submission: { id: string; status: ValueStatus; attributeValues: Prisma.JsonValue; calculatedResult: Prisma.Decimal | null; formulaVersion: string | null }, actorId?: string) {
  const latest = await tx.submissionVersion.aggregate({ where: { metricValueId: submission.id }, _max: { version: true } });
  return tx.submissionVersion.create({ data: { metricValueId: submission.id, version: (latest._max.version ?? 0) + 1, status: submission.status, attributeValues: jsonValue(submission.attributeValues), calculatedResult: submission.calculatedResult ?? undefined, formulaVersion: submission.formulaVersion, createdById: actorId } });
}

async function audit(tx: Prisma.TransactionClient, actor: Actor, action: string, entityId: string, oldValue: unknown, newValue: unknown, context: RequestContext, description: string) {
  await tx.auditLog.create({ data: { userId: actor.id, entityType: 'MetricValue', entityId, action, oldValues: oldValue as never, newValues: newValue as never, ipAddress: context.ipAddress, userAgent: context.userAgent, description } });
}

async function notify(tx: Prisma.TransactionClient, userId: string | null, type: string, title: string, message: string) {
  if (!userId) return;
  await tx.notification.create({ data: { userId, type, title, message } });
}

export async function getReviewQueue(prisma: PrismaClient, actor: Actor, filters: { status?: ValueStatus; isoAreaId?: string; divisionId?: string; picId?: string; periodId?: string }) {
  ensureReviewer(actor);
  return prisma.metricValue.findMany({ where: { status: filters.status ?? ValueStatus.UnderReview, ...(filters.isoAreaId ? { metric: { isoAreaId: filters.isoAreaId } } : {}), ...(filters.divisionId || filters.picId ? { metric: { pics: { some: { ...(filters.divisionId ? { divisionId: filters.divisionId } : {}), ...(filters.picId ? { id: filters.picId } : {}) } } } } : {}), ...(filters.periodId ? { reportingPeriodId: filters.periodId } : {}) }, include: { metric: { include: { isoArea: true, pics: { include: { division: true } } } }, reportingPeriod: true, submittedBy: { select: { fullName: true } } }, orderBy: { submittedAt: 'asc' } });
}

export async function getReviewSummary(prisma: PrismaClient, actor: Actor) {
  ensureReviewer(actor);
  const [pendingReview, revisionRequired, rejected, approvedThisMonth] = await Promise.all([
    prisma.metricValue.count({ where: { status: ValueStatus.UnderReview } }),
    prisma.metricValue.count({ where: { status: ValueStatus.NeedsRevision } }),
    prisma.metricValue.count({ where: { status: ValueStatus.Rejected } }),
    prisma.metricValue.count({ where: { status: ValueStatus.Approved, updatedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
  ]);
  return { pendingReview, revisionRequired, rejected, approvedThisMonth };
}

export async function getReviewSubmission(prisma: PrismaClient, id: string, actor: Actor) { const submission = await getSubmission(prisma, id); assertVisible(submission, actor); return submission; }

export async function performReviewAction(prisma: PrismaClient, id: string, action: ReviewTransition, actor: Actor, comment: string | undefined, context: RequestContext) {
  if (action !== 'resubmit') ensureReviewer(actor);
  const before = await getSubmission(prisma, id);
  if (action === 'resubmit') { if (actor.role !== 'ADMIN' && before.submittedById !== actor.id) throw error('Only the submitting PIC can resubmit this data.', 403); }
  else if (before.submittedById === actor.id) throw error('You cannot review your own submission.', 403);
  if ((action === 'request-revision' || action === 'reject') && !comment?.trim()) throw error('A comment is required for this decision.');
  if (action === 'approve') validateForApproval(before);
  const next = transitionStatus(action, before.status);
  return prisma.$transaction(async tx => {
    const changed = await tx.metricValue.updateMany({ where: { id, status: before.status }, data: { status: next, ...(action === 'resubmit' ? { submittedAt: new Date() } : {}) } });
    if (changed.count !== 1) throw error('Submission status changed. Refresh and try again.', 409);
    const updated = await tx.metricValue.findUniqueOrThrow({ where: { id } });
    await createVersion(tx, updated, actor.id);
    if (action !== 'resubmit') await tx.review.create({ data: { metricValueId: id, reviewerId: actor.id, action: action === 'start-review' ? ReviewAction.StartReview : action === 'approve' ? ReviewAction.Approve : action === 'reject' ? ReviewAction.Reject : ReviewAction.RequestRevision, statusFrom: before.status, statusTo: next, comment } });
    if (comment?.trim()) await tx.reviewComment.create({ data: { metricValueId: id, authorId: actor.id, comment: comment.trim() } });
    const auditAction = action === 'start-review' ? 'START_REVIEW' : action === 'approve' ? 'APPROVE_SUBMISSION' : action === 'reject' ? 'REJECT_SUBMISSION' : action === 'request-revision' ? 'REQUEST_REVISION' : 'RESUBMIT_SUBMISSION';
    await audit(tx, actor, auditAction, id, { status: before.status }, { status: next }, context, `${auditAction} for ${before.metric.name}.`);
    if (action === 'approve') await notify(tx, before.submittedById, 'SUBMISSION_APPROVED', 'Submission approved', `${before.metric.name} was approved.`);
    if (action === 'reject') await notify(tx, before.submittedById, 'SUBMISSION_REJECTED', 'Submission rejected', `${before.metric.name} was rejected.`);
    if (action === 'request-revision') await notify(tx, before.submittedById, 'REVISION_REQUESTED', 'Revision requested', `${before.metric.name} requires revision.`);
    return tx.metricValue.findUniqueOrThrow({ where: { id }, include: SUBMISSION_INCLUDE });
  });
}

export async function addComment(prisma: PrismaClient, id: string, actor: Actor, comment: string, context: RequestContext) {
  if (!comment?.trim()) throw error('Comment is required.');
  const submission = await getSubmission(prisma, id); assertVisible(submission, actor);
  return prisma.$transaction(async tx => { const created = await tx.reviewComment.create({ data: { metricValueId: id, authorId: actor.id, comment: comment.trim() }, include: { author: { select: { fullName: true } } } }); await audit(tx, actor, 'ADD_REVIEW_COMMENT', id, null, { comment: comment.trim() }, context, `Comment added to ${submission.metric.name}.`); return created; });
}

export async function getComments(prisma: PrismaClient, id: string, actor: Actor) { const submission = await getSubmission(prisma, id); assertVisible(submission, actor); return prisma.reviewComment.findMany({ where: { metricValueId: id }, include: { author: { select: { fullName: true } } }, orderBy: { createdAt: 'asc' } }); }
export async function getHistory(prisma: PrismaClient, id: string, actor: Actor) { const submission = await getSubmission(prisma, id); assertVisible(submission, actor); return { versions: submission.versions, reviews: submission.reviews, comments: submission.reviewComments }; }
