import { Router } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';
import { reportRateLimiter } from '../middleware/rateLimiter';
import { buildReportSnapshot, createReport, generateReportFiles, getReport, listReports } from '../services/report-service';

function filters(req: { query: Record<string, unknown> }) {
  const year = Number(req.query.year);
  return {
    year: Number.isInteger(year) ? year : undefined,
    period: typeof req.query.period === 'string' ? req.query.period : undefined,
    isoAreaId: typeof req.query.isoAreaId === 'string' ? req.query.isoAreaId : undefined,
    divisionId: typeof req.query.divisionId === 'string' ? req.query.divisionId : undefined,
  };
}

function sendError(res: { status(c: number): { json(p: unknown): unknown } }, error: unknown, requestId?: string) {
  const value = error as Error & { status?: number };
  return res.status(value.status ?? 500).json({ error: value.message ?? 'Report generation failed.', requestId });
}

const REPORT_ROLES = [Role.ADMIN, Role.REVIEWER, Role.MANAGEMENT, Role.PIC];

export function createPhase6Router(prisma: PrismaClient): Router {
  const router = Router();

  // All report routes require authentication
  router.use(authenticate);
  router.use(requireRole(...REPORT_ROLES));

  router.get('/reports/preview', async (req, res) => {
    try {
      const selected = filters(req);
      // PIC can only preview their own division's data
      if (req.user!.role === Role.PIC) selected.divisionId = req.user!.divisionId ?? selected.divisionId;
      res.json(await buildReportSnapshot(prisma, selected));
    } catch (error) { sendError(res, error, req.requestId); }
  });

  router.post('/reports', reportRateLimiter, async (req, res) => {
    try {
      const selected = req.body as ReturnType<typeof filters>;
      if (req.user!.role === Role.PIC) selected.divisionId = req.user!.divisionId ?? selected.divisionId;
      const snapshot = await buildReportSnapshot(prisma, selected);
      res.status(201).json(await createReport(prisma, snapshot, req.user!.id));
    } catch (error) { sendError(res, error, req.requestId); }
  });

  router.get('/reports', async (req, res) => {
    try { res.json(await listReports(prisma)); } catch (error) { sendError(res, error, req.requestId); }
  });

  router.get('/reports/history', async (req, res) => {
    try { res.json(await listReports(prisma)); } catch (error) { sendError(res, error, req.requestId); }
  });

  router.get('/reports/:id', async (req, res) => {
    try {
      const report = await getReport(prisma, req.params.id);
      if (!report) { res.status(404).json({ error: 'Report not found.' }); return; }
      res.json(report);
    } catch (error) { sendError(res, error, req.requestId); }
  });

  router.get('/reports/:id/preview', async (req, res) => {
    try {
      const report = await getReport(prisma, req.params.id);
      if (!report) { res.status(404).json({ error: 'Report not found.' }); return; }
      res.json(report.reportData);
    } catch (error) { sendError(res, error, req.requestId); }
  });

  router.post('/reports/:id/generate-pdf', reportRateLimiter, async (req, res) => {
    try { res.json(await generateReportFiles(prisma, String(req.params.id), ['PDF'])); } catch (error) { sendError(res, error, req.requestId); }
  });

  router.post('/reports/:id/generate-excel', reportRateLimiter, async (req, res) => {
    try { res.json(await generateReportFiles(prisma, String(req.params.id), ['EXCEL'])); } catch (error) { sendError(res, error, req.requestId); }
  });

  router.post('/reports/:id/generate', reportRateLimiter, async (req, res) => {
    try {
      const formats: Array<'PDF' | 'EXCEL'> = req.body.format === 'PDF' ? ['PDF'] : req.body.format === 'EXCEL' ? ['EXCEL'] : ['PDF', 'EXCEL'];
      res.json(await generateReportFiles(prisma, String(req.params.id), formats));
    } catch (error) { sendError(res, error, req.requestId); }
  });

  // Secure file download — authenticated, authorized, stream file
  router.get('/reports/:id/download/:format', async (req, res) => {
    try {
      const report = await getReport(prisma, req.params.id);
      if (!report) { res.status(404).json({ error: 'Report not found.' }); return; }

      // PIC can only download their division's reports
      if (req.user!.role === Role.PIC && report.filters) {
        const reportFilters = report.filters as Record<string, unknown>;
        if (reportFilters.divisionId && reportFilters.divisionId !== req.user!.divisionId) {
          res.status(403).json({ error: 'You do not have permission to download this report.' });
          return;
        }
      }

      const format = req.params.format.toUpperCase();
      const file = report.files.find(item => item.format === format);
      if (!file) { res.status(404).json({ error: 'Report file not generated.' }); return; }

      const filename = `${report.name.replace(/[^a-z0-9]+/gi, '-')}.${format === 'PDF' ? 'pdf' : 'xlsx'}`;
      res.download(file.filePath, filename);
    } catch (error) { sendError(res, error, req.requestId); }
  });

  return router;
}
