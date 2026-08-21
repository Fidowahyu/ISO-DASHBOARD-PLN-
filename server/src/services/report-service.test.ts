import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { generateExcel, generatePdf, type ReportSnapshot } from './report-service';

const snapshot: ReportSnapshot = {
  period: { id: 'period-1', year: 2026, label: '2026 Annual', periodType: 'Annual' },
  filters: { year: 2026, period: 'Annual' },
  totalMetrics: 2,
  approvedMetrics: 2,
  completion: 100,
  quality: { overall: null, completeness: null, accuracy: null, consistency: null, timeliness: null },
  areas: [{ id: 'area-1', name: 'Diversity', totalMetrics: 2, approvedMetrics: 2, completion: 100, quality: null }],
  metrics: [{ id: 'metric-1', area: 'Diversity', name: 'Approved Metric', result: 39.79, dataType: 'Percentage', pic: 'PIC', division: 'HSC', status: 'Approved', approvedBy: 'Reviewer', approvedDate: null, values: {} }],
  approvals: [{ metric: 'Approved Metric', pic: 'PIC', submittedDate: null, reviewer: 'Reviewer', reviewDate: null, status: 'Approved', comment: '' }],
};

test('generates non-empty PDF and Excel files from an approved snapshot', async () => {
  const [pdf, excel] = await Promise.all([generatePdf(snapshot), generateExcel(snapshot)]);
  assert.ok(pdf.buffer.length > 0);
  assert.ok(excel.buffer.length > 0);
  assert.equal(pdf.checksum.length, 64);
  assert.equal(excel.checksum.length, 64);
  await fs.unlink(pdf.filePath);
  await fs.unlink(excel.filePath);
});
