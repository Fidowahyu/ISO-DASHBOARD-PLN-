import assert from 'node:assert/strict';
import test from 'node:test';
import { validateAttributeValues } from './submission-validator';

const attributes = [
  { id: 'total', name: 'Total Employees', dataType: 'Number' as const, validationRules: { required: true }, listOptions: [] },
  { id: 'female', name: 'Female Employees', dataType: 'Number' as const, validationRules: { required: true }, listOptions: [] },
  { id: 'percentage', name: 'Percentage', dataType: 'Percentage' as const, validationRules: {}, listOptions: [] },
];

test('rejects missing required values and invalid percentages', () => {
  const errors = validateAttributeValues(attributes, { total: '', female: 10, percentage: 105 });
  assert.ok(errors.some(error => error.attributeId === 'total'));
  assert.ok(errors.some(error => error.attributeId === 'percentage'));
});

test('rejects configured cross-attribute violations', () => {
  const errors = validateAttributeValues(attributes, { total: 20_000, female: 22_000, percentage: 50 }, [{ ruleType: 'attributeComparison', ruleValue: { leftAttributeId: 'female', rightAttributeId: 'total', operator: 'lte' }, errorMessage: 'Female cannot exceed Total.' }]);
  assert.ok(errors.some(error => error.message === 'Female cannot exceed Total.'));
});

test('accepts valid configured values', () => {
  const errors = validateAttributeValues(attributes, { total: 20_000, female: 8_230, percentage: 41.15 });
  assert.deepEqual(errors, []);
});
