import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { PrismaClient, Role } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';
import { uploadRateLimiter } from '../middleware/rateLimiter';
import { confirmImport, createImportPreview } from '../services/import-service';

// Accept only xlsx MIME types
const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];
// xlsx magic bytes (PK header — xlsx is a ZIP-based format)
const XLSX_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE_MB ?? 10) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || ext !== '.xlsx') {
      cb(new Error('Only Excel (.xlsx) files are allowed.'));
      return;
    }
    cb(null, true);
  },
});

export function createPhase2Router(prisma: PrismaClient): Router {
  const router = Router();

  // All routes in this phase require authentication
  router.use(authenticate);

  router.post(
    '/import/excel',
    requireRole(Role.ADMIN, Role.PIC),
    uploadRateLimiter,
    upload.single('file'),
    async (req, res) => {
      if (!req.file) {
        res.status(400).json({ success: false, error: { code: 'FILE_REQUIRED', message: 'An Excel file is required.', requestId: req.requestId } });
        return;
      }

      // Validate magic bytes (content signature)
      if (!req.file.buffer.subarray(0, 4).equals(XLSX_MAGIC)) {
        res.status(422).json({ success: false, error: { code: 'INVALID_FILE', message: 'The uploaded file is not a valid Excel workbook.', requestId: req.requestId } });
        return;
      }

      try {
        const result = await createImportPreview(prisma, req.file.originalname, req.file.size, req.file.buffer);
        res.status(201).json(result);
      } catch (error) {
        res.status(422).json({ success: false, error: { code: 'PARSE_ERROR', message: error instanceof Error ? error.message : 'Unable to parse workbook.', requestId: req.requestId } });
      }
    },
  );

  router.get('/import/:id', async (req, res) => {
    const job = await prisma.importJob.findUnique({ where: { id: req.params.id } });
    if (!job) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Import not found.' } }); return; }
    res.json(job);
  });

  router.post('/import/:id/validate', async (req, res) => {
    const job = await prisma.importJob.findUnique({ where: { id: req.params.id } });
    if (!job) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Import not found.' } }); return; }
    res.json({ validation: job.validationResults, summary: job.importSummary });
  });

  router.post('/import/:id/confirm', requireRole(Role.ADMIN, Role.PIC), async (req, res) => {
    try {
      const summary = await confirmImport(prisma, String(req.params.id));
      res.json({ status: 'completed', summary });
    } catch (error) {
      res.status(422).json({ success: false, error: { code: 'IMPORT_ERROR', message: error instanceof Error ? error.message : 'Unable to import configuration.', requestId: req.requestId } });
    }
  });

  router.get('/iso-areas', async (_req, res) => {
    const areas = await prisma.iSOArea.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, include: { _count: { select: { metrics: true } } } });
    res.json(areas);
  });

  router.get('/iso-areas/:id', async (req, res) => {
    const area = await prisma.iSOArea.findUnique({ where: { id: req.params.id }, include: { metrics: { include: { attributes: { include: { listOptions: true } }, formulas: { where: { isActive: true }, orderBy: { version: 'desc' }, take: 1 }, pics: { include: { division: true } } }, orderBy: { metricNumber: 'asc' } } } });
    if (!area) { res.status(404).json({ error: 'ISO area not found.' }); return; }
    res.json(area);
  });

  router.get('/metrics', async (req, res) => {
    const metrics = await prisma.metric.findMany({ where: req.query.areaId ? { isoAreaId: String(req.query.areaId) } : undefined, include: { isoArea: true, attributes: true, formulas: { where: { isActive: true }, orderBy: { version: 'desc' }, take: 1 }, pics: { include: { division: true } } }, orderBy: [{ isoAreaId: 'asc' }, { metricNumber: 'asc' }] });
    res.json(metrics);
  });

  router.get('/metrics/:id', async (req, res) => {
    const metric = await prisma.metric.findUnique({ where: { id: req.params.id }, include: { isoArea: true, attributes: { include: { listOptions: true } }, formulas: { orderBy: { version: 'desc' } }, validationRules: true, pics: { include: { division: true } } } });
    if (!metric) { res.status(404).json({ error: 'Metric not found.' }); return; }
    res.json(metric);
  });

  router.get('/pic', async (req, res) => {
    const pic = await prisma.metricPIC.findMany({ where: req.query.year ? { picYear: String(req.query.year) } : undefined, include: { metric: { include: { isoArea: true } }, division: true }, orderBy: [{ picYear: 'desc' }, { picName: 'asc' }] });
    res.json(pic);
  });

  router.get('/divisions', async (_req, res) => {
    const divisions = await prisma.division.findMany({ where: { isActive: true }, include: { _count: { select: { metricPICs: true } } }, orderBy: { code: 'asc' } });
    res.json(divisions);
  });

  return router;
}
