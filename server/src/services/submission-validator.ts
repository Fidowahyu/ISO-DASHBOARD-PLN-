import type { DataType } from '@prisma/client';

export interface ValidationAttribute {
  id: string;
  name: string;
  dataType: DataType;
  validationRules: unknown;
  listOptions: Array<{ value: string }>;
}

export interface ValidationRule {
  ruleType: string;
  ruleValue: unknown;
  errorMessage?: string | null;
}

export interface AttributeValidationError {
  attributeId: string;
  message: string;
}

export type AttributeValues = Record<string, unknown>;

function asRules(attribute: ValidationAttribute): Record<string, unknown> {
  return attribute.validationRules && typeof attribute.validationRules === 'object' && !Array.isArray(attribute.validationRules)
    ? attribute.validationRules as Record<string, unknown>
    : {};
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

function numberValue(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

export function validateAttributeValues(attributes: ValidationAttribute[], values: AttributeValues, metricRules: ValidationRule[] = []) {
  const errors: AttributeValidationError[] = [];
  const allowedIds = new Set(attributes.map(attribute => attribute.id));
  for (const attributeId of Object.keys(values)) {
    if (!allowedIds.has(attributeId)) errors.push({ attributeId, message: 'This attribute does not belong to the selected metric.' });
  }

  for (const attribute of attributes) {
    const value = values[attribute.id];
    const rules = asRules(attribute);
    const required = rules.required === true || rules.required === 'true';
    if (required && isEmpty(value)) errors.push({ attributeId: attribute.id, message: `${attribute.name} is required.` });
    if (isEmpty(value)) continue;

    const numeric = numberValue(value);
    if (['Number', 'Integer', 'Decimal', 'Currency', 'Percentage', 'Year'].includes(attribute.dataType) && numeric === undefined) {
      errors.push({ attributeId: attribute.id, message: `${attribute.name} must be a valid number.` });
      continue;
    }
    if (attribute.dataType === 'Integer' && numeric !== undefined && !Number.isInteger(numeric)) errors.push({ attributeId: attribute.id, message: `${attribute.name} must be an integer.` });
    if (attribute.dataType === 'Percentage' && numeric !== undefined && (numeric < 0 || numeric > 100)) errors.push({ attributeId: attribute.id, message: `${attribute.name} must be between 0 and 100.` });
    if (attribute.dataType === 'Date' && Number.isNaN(Date.parse(String(value)))) errors.push({ attributeId: attribute.id, message: `${attribute.name} must be a valid date.` });
    if (attribute.dataType === 'Boolean' && typeof value !== 'boolean' && !['true', 'false'].includes(String(value).toLowerCase())) errors.push({ attributeId: attribute.id, message: `${attribute.name} must be boolean.` });
    if (['List', 'MultiSelect'].includes(attribute.dataType)) {
      const selected = Array.isArray(value) ? value.map(String) : [String(value)];
      const allowed = new Set(attribute.listOptions.map(option => option.value));
      if (selected.some(item => !allowed.has(item))) errors.push({ attributeId: attribute.id, message: `${attribute.name} contains a value outside the configured options.` });
    }
    for (const [rule, ruleValue] of Object.entries(rules)) {
      if (rule === 'min' && numeric !== undefined && numeric < Number(ruleValue)) errors.push({ attributeId: attribute.id, message: `${attribute.name} must be at least ${ruleValue}.` });
      if (rule === 'max' && numeric !== undefined && numeric > Number(ruleValue)) errors.push({ attributeId: attribute.id, message: `${attribute.name} must be at most ${ruleValue}.` });
      if (rule === 'minLength' && String(value).length < Number(ruleValue)) errors.push({ attributeId: attribute.id, message: `${attribute.name} is too short.` });
      if (rule === 'maxLength' && String(value).length > Number(ruleValue)) errors.push({ attributeId: attribute.id, message: `${attribute.name} is too long.` });
      if (rule === 'pattern' && !(new RegExp(String(ruleValue))).test(String(value))) errors.push({ attributeId: attribute.id, message: `${attribute.name} has an invalid format.` });
    }
  }

  for (const rule of metricRules) {
    const ruleValue = rule.ruleValue && typeof rule.ruleValue === 'object' ? rule.ruleValue as Record<string, unknown> : {};
    if (rule.ruleType === 'attributeComparison') {
      const left = numberValue(values[String(ruleValue.leftAttributeId)]);
      const right = numberValue(values[String(ruleValue.rightAttributeId)]);
      if (left !== undefined && right !== undefined && ruleValue.operator === 'lte' && left > right) errors.push({ attributeId: String(ruleValue.leftAttributeId), message: rule.errorMessage ?? 'The value cannot exceed the comparison value.' });
    }
  }
  return errors;
}

export function coerceFormulaValues(attributes: Array<Pick<ValidationAttribute, 'id' | 'name'>>, values: AttributeValues): Record<string, number> {
  const result: Record<string, number> = {};
  for (const attribute of attributes) {
    const numeric = numberValue(values[attribute.id]);
    if (numeric !== undefined) {
      result[attribute.id] = numeric;
      result[attribute.name] = numeric;
      result[attribute.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')] = numeric;
    }
  }
  return result;
}

export function dataTypeLabel(dataType: DataType): string {
  return dataType === 'List' ? 'Select' : dataType === 'MultiSelect' ? 'Multi-select' : dataType;
}
