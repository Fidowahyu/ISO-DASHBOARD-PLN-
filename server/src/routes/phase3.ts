import { Router } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';
import { calculateSubmission, createDraft, getMetricForm, getSubmission, listPeriods, listSubmissions, submitSubmission } from '../services/submission-service';

function sendError(res: Response | { status(c: number): { json(p: unknown): unknown } }, error: unknown, requestId?: string) {
  const value = error as Error & { status?: number };
  let message: unknown = value instanceof Error ? value.message : 'Something went wrong while saving your data.';
  try { message = JSON.parse(String(message)); } catch { /* keep user-safe message */ }
  const status = value.status ?? 422;
  return (res as { status(c: number): { json(p: unknown): unknown } }).status(status).json(
    typeof message === 'object' ? message : { success: false, error: { code: 'REQUEST_ERROR', message, requestId } },
  );
}

export function createPhase3Router(prisma: PrismaClient): Router {
  const router = Router();

  // All routes require authentication
  router.use(authenticate);

  router.get('/reporting-periods', async (_req, res) => {
    try { res.json(await listPeriods(prisma)); } catch (error) { sendError(res, error); }
  });

  router.get('/metrics/:id/configuration', async (req, res) => {
    try { res.json(await getMetricForm(prisma, req.params.id)); } catch (error) { sendError(res, error, req.requestId); }
  });

  router.get('/metrics/:id/form', async (req, res) => {
    try { res.json(await getMetricForm(prisma, req.params.id)); } catch (error) { sendError(res, error, req.requestId); }
  });

  // Submit data: ADMIN and PIC only
  router.post('/metric-submissions', requireRole(Role.ADMIN, Role.PIC), async (req, res) => {
    try { res.status(201).json(await createDraft(prisma, req.body, req.user!.id, req.user!.role)); } catch (error) { sendError(res, error, req.requestId); }
  });

  router.get('/metric-submissions', async (req, res) => {
    try {
      const metricId = typeof req.query.metricId === 'string' ? req.query.metricId : undefined;
      res.json(await listSubmissions(prisma, req.user!.id, req.user!.role, metricId));
    } catch (error) { sendError(res, error, req.requestId); }
  });

  router.get('/metric-submissions/:id', async (req, res) => {
    try { res.json(await getSubmission(prisma, req.params.id, req.user!.id, req.user!.role)); } catch (error) { sendError(res, error, req.requestId); }
  });

  router.put('/metric-submissions/:id', requireRole(Role.ADMIN, Role.PIC), async (req, res) => {
    try { res.json(await calculateSubmission(prisma, String(req.params.id), req.user!.id, req.user!.role, req.body.attributeValues)); } catch (error) { sendError(res, error, req.requestId); }
  });

  router.post('/metric-submissions/:id/calculate', requireRole(Role.ADMIN, Role.PIC), async (req, res) => {
    try { res.json(await calculateSubmission(prisma, String(req.params.id), req.user!.id, req.user!.role, req.body.attributeValues)); } catch (error) { sendError(res, error, req.requestId); }
  });

  router.post('/metric-submissions/:id/draft', requireRole(Role.ADMIN, Role.PIC), async (req, res) => {
    try { res.json(await calculateSubmission(prisma, String(req.params.id), req.user!.id, req.user!.role, req.body.attributeValues)); } catch (error) { sendError(res, error, req.requestId); }
  });

  router.post('/metric-submissions/:id/submit', requireRole(Role.ADMIN, Role.PIC), async (req, res) => {
    try { res.json(await submitSubmission(prisma, String(req.params.id), req.user!.id, req.user!.role)); } catch (error) { sendError(res, error, req.requestId); }
  });

  return router;
}
