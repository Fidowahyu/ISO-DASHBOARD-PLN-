import { Router } from 'express';
import { PrismaClient, Role, ValueStatus } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';
import { addComment, getComments, getHistory, getReviewQueue, getReviewSubmission, getReviewSummary, performReviewAction } from '../services/review-service';

function context(req: { header(n: string): string | undefined }) {
  return { ipAddress: req.header('x-forwarded-for') ?? undefined, userAgent: req.header('user-agent') ?? undefined };
}

function sendError(res: { status(c: number): { json(p: unknown): unknown } }, error: unknown, requestId?: string) {
  const value = error as Error & { status?: number };
  return res.status(value.status ?? 422).json({ error: value.message ?? 'Workflow action failed.', requestId });
}

export function createPhase5Router(prisma: PrismaClient): Router {
  const router = Router();

  // All phase 5 routes require authentication
  router.use(authenticate);

  // ─── Review queue: ADMIN and REVIEWER ───
  router.get('/reviews', requireRole(Role.ADMIN, Role.REVIEWER), async (req, res) => {
    try {
      res.json(await getReviewQueue(prisma, req.user!, {
        status: typeof req.query.status === 'string' ? req.query.status as ValueStatus : undefined,
        isoAreaId: typeof req.query.isoAreaId === 'string' ? req.query.isoAreaId : undefined,
        divisionId: typeof req.query.divisionId === 'string' ? req.query.divisionId : undefined,
        picId: typeof req.query.picId === 'string' ? req.query.picId : undefined,
        periodId: typeof req.query.periodId === 'string' ? req.query.periodId : undefined,
      }));
    } catch (error) { sendError(res, error, req.requestId); }
  });

  router.get('/reviews/summary', requireRole(Role.ADMIN, Role.REVIEWER), async (req, res) => {
    try { res.json(await getReviewSummary(prisma, req.user!)); } catch (error) { sendError(res, error, req.requestId); }
  });

  router.get('/submissions/:id', async (req, res) => {
    try { res.json(await getReviewSubmission(prisma, String(req.params.id), req.user!)); } catch (error) { sendError(res, error, req.requestId); }
  });

  // Review actions: ADMIN and REVIEWER only
  router.post('/submissions/:id/start-review', requireRole(Role.ADMIN, Role.REVIEWER), async (req, res) => {
    try { res.json(await performReviewAction(prisma, String(req.params.id), 'start-review', req.user!, undefined, context(req))); } catch (error) { sendError(res, error, req.requestId); }
  });

  router.post('/submissions/:id/approve', requireRole(Role.ADMIN, Role.REVIEWER), async (req, res) => {
    try { res.json(await performReviewAction(prisma, String(req.params.id), 'approve', req.user!, req.body.comment, context(req))); } catch (error) { sendError(res, error, req.requestId); }
  });

  router.post('/submissions/:id/request-revision', requireRole(Role.ADMIN, Role.REVIEWER), async (req, res) => {
    try { res.json(await performReviewAction(prisma, String(req.params.id), 'request-revision', req.user!, req.body.comment, context(req))); } catch (error) { sendError(res, error, req.requestId); }
  });

  router.post('/submissions/:id/reject', requireRole(Role.ADMIN, Role.REVIEWER), async (req, res) => {
    try { res.json(await performReviewAction(prisma, String(req.params.id), 'reject', req.user!, req.body.comment, context(req))); } catch (error) { sendError(res, error, req.requestId); }
  });

  router.post('/submissions/:id/resubmit', requireRole(Role.ADMIN, Role.PIC), async (req, res) => {
    try { res.json(await performReviewAction(prisma, String(req.params.id), 'resubmit', req.user!, undefined, context(req))); } catch (error) { sendError(res, error, req.requestId); }
  });

  router.get('/submissions/:id/comments', async (req, res) => {
    try { res.json(await getComments(prisma, String(req.params.id), req.user!)); } catch (error) { sendError(res, error, req.requestId); }
  });

  router.post('/submissions/:id/comments', async (req, res) => {
    try { res.status(201).json(await addComment(prisma, String(req.params.id), req.user!, req.body.comment, context(req))); } catch (error) { sendError(res, error, req.requestId); }
  });

  router.get('/submissions/:id/history', async (req, res) => {
    try { res.json(await getHistory(prisma, String(req.params.id), req.user!)); } catch (error) { sendError(res, error, req.requestId); }
  });

  // ─── Audit logs: ADMIN only ───
  router.get('/audit-logs', requireRole(Role.ADMIN), async (req, res) => {
    try {
      const logs = await prisma.auditLog.findMany({
        where: typeof req.query.action === 'string' ? { action: req.query.action } : undefined,
        include: { user: { select: { fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 200,
      });
      res.json(logs);
    } catch (error) { sendError(res, error, req.requestId); }
  });

  router.get('/audit-logs/:id', requireRole(Role.ADMIN), async (req, res) => {
    try {
      const log = await prisma.auditLog.findUnique({ where: { id: String(req.params.id) }, include: { user: { select: { fullName: true, email: true } } } });
      if (!log) { res.status(404).json({ error: 'Audit event was not found.' }); return; }
      res.json(log);
    } catch (error) { sendError(res, error, req.requestId); }
  });

  // ─── Notifications ───
  router.get('/notifications', async (req, res) => {
    try {
      res.json(await prisma.notification.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' }, take: 50 }));
    } catch (error) { sendError(res, error, req.requestId); }
  });

  router.post('/notifications/:id/read', async (req, res) => {
    try {
      const notification = await prisma.notification.updateMany({
        where: { id: String(req.params.id), userId: req.user!.id }, // Ensure user owns this notification
        data: { readAt: new Date() },
      });
      if (!notification.count) { res.status(404).json({ error: 'Notification was not found.' }); return; }
      res.json({ id: req.params.id, readAt: new Date() });
    } catch (error) { sendError(res, error, req.requestId); }
  });

  return router;
}
