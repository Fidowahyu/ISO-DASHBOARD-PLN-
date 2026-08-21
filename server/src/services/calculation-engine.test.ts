import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateFormula } from './calculation-engine';
import { completionScore, dashboardKpis } from './dashboard-calculations';

test('evaluates arithmetic formulas safely', () => {
  assert.equal(evaluateFormula('100 / 200 * 100', {}).result, 50);
  assert.equal(evaluateFormula('(A + B) / 2', { A: 2, B: 4 }).result, 3);
});

test('supports whitelisted aggregate functions', () => {
  assert.equal(evaluateFormula('SUM(A, B)', { A: 2, B: 3 }).result, 5);
  assert.equal(evaluateFormula('AVERAGE(A, B)', { A: 2, B: 4 }).result, 3);
});

test('rejects arbitrary JavaScript and unsafe operations', () => {
  assert.throws(() => evaluateFormula('window.process()', {}));
  assert.throws(() => evaluateFormula('100 / 0', {}));
});

test('calculates dashboard KPI completion from status counts', () => {
  assert.equal(completionScore(8, 10), 80);
  assert.deepEqual(dashboardKpis({ approved: 4, submitted: 2, underReview: 1, rejected: 1, needsRevision: 1, draft: 1 }, 10), { totalMetrics: 10, completed: 7, pending: 3, approved: 4, needsAttention: 3, completion: 70 });
});
