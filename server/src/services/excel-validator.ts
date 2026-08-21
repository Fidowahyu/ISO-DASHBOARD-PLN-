import type { ParsedConfiguration } from './excel-parser';

export type ValidationSeverity = 'valid' | 'warning' | 'error';

export interface ValidationIssue {
  severity: ValidationSeverity;
  code: string;
  message: string;
  sheet?: string;
  row?: number;
}

export interface ValidationSummary {
  validRows: number;
  warningRows: number;
  errorRows: number;
  issues: ValidationIssue[];
}

export function validateConfiguration(configuration: ParsedConfiguration): ValidationSummary {
  const issues: ValidationIssue[] = [];
  const areaNumbers = new Set<number>();
  const metricKeys = new Set<string>();
  let validRows = 0;

  for (const area of configuration.areas) {
    if (areaNumbers.has(area.areaNumber)) {
      issues.push({ severity: 'error', code: 'DUPLICATE_AREA', message: `Duplicate ISO area number ${area.areaNumber}.` });
    }
    areaNumbers.add(area.areaNumber);
    if (!area.name) issues.push({ severity: 'error', code: 'AREA_NAME_REQUIRED', message: `Area ${area.areaNumber} has no name.` });
  }

  for (const metric of configuration.metrics) {
    const key = `${metric.areaNumber}:${metric.metricNumber}`;
    if (metricKeys.has(key)) {
      issues.push({ severity: 'error', code: 'DUPLICATE_METRIC', message: `Duplicate metric ${key}.` });
      continue;
    }
    metricKeys.add(key);
    if (!areaNumbers.has(metric.areaNumber)) {
      issues.push({ severity: 'error', code: 'UNKNOWN_AREA', message: `Metric ${key} references an unknown area.` });
    } else if (!metric.name) {
      issues.push({ severity: 'error', code: 'METRIC_NAME_REQUIRED', message: `Metric ${key} has no name.` });
    } else {
      validRows += 1;
    }
    if (!metric.formula) {
      issues.push({ severity: 'warning', code: 'FORMULA_MISSING', message: `Metric ${key} has no formula.` });
    }
    if (metric.attributes.length === 0) {
      issues.push({ severity: 'warning', code: 'ATTRIBUTES_MISSING', message: `Metric ${key} has no attributes.` });
    }
    if (metric.divisions.length === 0) {
      issues.push({ severity: 'warning', code: 'DIVISION_MISSING', message: `Metric ${key} has no division PIC.` });
    }
  }

  for (const assignment of configuration.picAssignments) {
    const key = `${assignment.areaNumber}:${assignment.metricNumber}`;
    if (!metricKeys.has(key)) {
      issues.push({ severity: 'warning', code: 'PIC_WITHOUT_METRIC', message: `PIC assignment ${key} does not match an area metric.` });
    }
  }

  return {
    validRows,
    warningRows: issues.filter(issue => issue.severity === 'warning').length,
    errorRows: issues.filter(issue => issue.severity === 'error').length,
    issues,
  };
}
