import { Router } from 'express';
import { PrismaClient, ValueStatus } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { getAreaDashboard, getDashboardSummary, getDashboardTrends, getPICStatus } from '../services/dashboard-service';

function filters(req: { query: Record<string, unknown>; user?: { divisionId?: string | null } }) {
  const numberYear = Number(req.query.year);
  return {
    year: Number.isInteger(numberYear) && numberYear > 1900 ? numberYear : undefined,
    periodType: typeof req.query.period === 'string' ? req.query.period : undefined,
    isoAreaId: typeof req.query.isoAreaId === 'string' ? req.query.isoAreaId : undefined,
    divisionId: typeof req.query.divisionId === 'string' ? req.query.divisionId : undefined,
    picId: typeof req.query.picId === 'string' ? req.query.picId : undefined,
    status: typeof req.query.status === 'string' && Object.values(ValueStatus).includes(req.query.status as ValueStatus)
      ? req.query.status as ValueStatus
      : undefined,
  };
}

function handle(res: { status(c: number): { json(p: unknown): unknown } }, error: unknown) {
  return res.status(500).json({ error: error instanceof Error ? error.message : 'Unable to load dashboard data.' });
}

export function createPhase4Router(prisma: PrismaClient): Router {
  const router = Router();

  // All dashboard routes require authentication (all roles can view dashboard)
  router.use(authenticate);

  router.get('/dashboard/summary', async (req, res) => { try { res.json(await getDashboardSummary(prisma, filters(req))); } catch (error) { handle(res, error); } });
  router.get('/dashboard', async (req, res) => { try { res.json(await getDashboardSummary(prisma, filters(req))); } catch (error) { handle(res, error); } });
  router.get('/dashboard/iso-areas', async (req, res) => { try { res.json((await getDashboardSummary(prisma, filters(req))).areas); } catch (error) { handle(res, error); } });
  router.get('/dashboard/data-quality', async (req, res) => { try { res.json((await getDashboardSummary(prisma, filters(req))).quality); } catch (error) { handle(res, error); } });
  router.get('/dashboard/trends', async (req, res) => { try { res.json(await getDashboardTrends(prisma, filters(req))); } catch (error) { handle(res, error); } });
  router.get('/dashboard/issues', async (req, res) => { try { res.json((await getDashboardSummary(prisma, filters(req))).issues); } catch (error) { handle(res, error); } });
  router.get('/dashboard/pic-status', async (req, res) => { try { res.json(await getPICStatus(prisma, filters(req))); } catch (error) { handle(res, error); } });

  router.get('/pic/:id/dashboard', async (req, res) => {
    try {
      const f = filters(req);
      const period = await prisma.reportingPeriod.findFirst({
        where: {
          year: f.year ?? new Date().getUTCFullYear(),
          periodType: f.periodType === 'Quarterly' ? 'Quarterly' : f.periodType === 'SemiAnnual' ? 'SemiAnnual' : 'Annual',
        },
      });
      if (!period) { res.json({ assignments: [], period: null }); return; }
      const assignments = await prisma.metricPIC.findMany({
        where: { id: req.params.id },
        include: { division: true, metric: { include: { isoArea: true, metricValues: { where: { reportingPeriodId: period.id }, select: { status: true, calculatedResult: true } } } } },
      });
      res.json({ period, assignments });
    } catch (error) { handle(res, error); }
  });

  router.get('/iso-areas/:id/dashboard', async (req, res) => { try { res.json(await getAreaDashboard(prisma, req.params.id, filters(req))); } catch (error) { handle(res, error); } });

  router.get('/metrics/:id/history', async (req, res) => {
    try {
      const values = await prisma.metricValue.findMany({ where: { metricId: req.params.id }, include: { reportingPeriod: true }, orderBy: { reportingPeriod: { year: 'asc' } } });
      res.json(values.map(v => ({ period: v.reportingPeriod.label, year: v.reportingPeriod.year, periodType: v.reportingPeriod.periodType, status: v.status, result: v.calculatedResult })));
    } catch (error) { handle(res, error); }
  });

  return router;
}
