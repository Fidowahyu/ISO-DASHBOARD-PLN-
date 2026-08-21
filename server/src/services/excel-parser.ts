import ExcelJS from 'exceljs';

export type ParsedDataType = 'Text' | 'Number' | 'Integer' | 'Decimal' | 'Percentage' | 'Currency' | 'Date' | 'Boolean' | 'Select' | 'Multi-select';

export interface ParsedAttribute {
  name: string;
  dataType: ParsedDataType;
  exampleValue: string;
  allowedValues: string[];
}

export interface ParsedMetric {
  areaNumber: number;
  metricNumber: number;
  name: string;
  metricType: string;
  isoComparison: string;
  formula: string;
  attributes: ParsedAttribute[];
  divisions: string[];
  actualResult?: number | null;
  yearlyResults?: Record<number, number>;
}

export interface ParsedArea {
  areaNumber: number;
  name: string;
  nameEn: string;
}

export interface ParsedPIC {
  areaNumber: number;
  metricNumber: number;
  division: string;
  pic2024: string[];
  pic2026: string[];
}

export interface ParsedConfiguration {
  areas: ParsedArea[];
  metrics: ParsedMetric[];
  picAssignments: ParsedPIC[];
  sheets: string[];
}

export function normalizeText(value: unknown): string {
  return String(value ?? '').replace(/\r/g, '').trim();
}

function splitPeople(value: unknown): string[] {
  return normalizeText(value)
    .split('\n')
    .map(value => value.replace(/\s+\(koordinator\)/i, '').trim())
    .filter(Boolean);
}

export function mapDataType(value: unknown): ParsedDataType {
  const normalized = normalizeText(value).toLowerCase().replace(/[\s_-]+/g, '');
  if (normalized.includes('multi')) return 'Multi-select';
  if (normalized.includes('percent') || normalized.includes('persen')) return 'Percentage';
  if (normalized.includes('currency') || normalized.includes('rupiah') || normalized.includes('uang')) return 'Currency';
  if (normalized.includes('date') || normalized.includes('tanggal')) return 'Date';
  if (normalized.includes('boolean') || normalized.includes('ya/tidak')) return 'Boolean';
  if (normalized.includes('integer') || normalized.includes('bilanganbulat')) return 'Integer';
  if (normalized.includes('decimal') || normalized.includes('desimal')) return 'Decimal';
  if (normalized.includes('number') || normalized.includes('angka')) return 'Number';
  if (normalized.includes('list') || normalized.includes('pilihan')) return 'Select';
  return 'Text';
}

function parseNumericCell(value: string | null | undefined): number | null {
  if (!value) return null;
  const cleaned = String(value).replace(/%/g, '').replace(/rp\.?/gi, '').replace(/\s+/g, '').replace(/,/g, '.');
  const num = parseFloat(cleaned);
  return !isNaN(num) && isFinite(num) ? num : null;
}

function findNumericValueInRow(row: string[]): number | null {
  // Scan cells from index 2 onwards to find any numeric result or score
  for (let i = 2; i < row.length; i++) {
    const val = row[i];
    if (!val) continue;
    const lower = val.trim().toLowerCase();
    if (/^(required|recommended|n\/a|text|number|integer|decimal|percentage|select|multi-select|list|active|draft|approved)$/i.test(lower)) {
      continue;
    }
    const parsed = parseNumericCell(val);
    if (parsed != null && !isNaN(parsed) && parsed >= 0 && parsed <= 10000) {
      return parsed > 100 ? Number((parsed % 100).toFixed(1)) : Number(parsed.toFixed(1));
    }
  }
  return null;
}

function getRows(sheet: ExcelJS.Worksheet): string[][] {
  return sheet.getSheetValues().slice(1).filter(Array.isArray).map(row => {
    const values = Array.isArray(row) ? row.slice(1) : [];
    return values.map(value => normalizeText(value));
  });
}

function findHeaderRow(rows: string[][]): number {
  return rows.findIndex(row => 
    row.some(cell => /metrik|metric/i.test(cell.toLowerCase())) && 
    row.some(cell => /tipe|type|rumus|formula|attribut|attribute|no/i.test(cell.toLowerCase()))
  );
}

function findSectionEnd(rows: string[][], start: number): number {
  const end = rows.findIndex((row, index) => index > start && row.some(cell => /panduan belajar|referensi:/i.test(cell)));
  return end === -1 ? rows.length : end;
}

function parseAreaSheet(sheet: ExcelJS.Worksheet, areaNumber: number): ParsedMetric[] {
  const rows = getRows(sheet);
  const headerRow = findHeaderRow(rows);
  if (headerRow < 0) return [];
  const end = findSectionEnd(rows, headerRow);
  const metrics: ParsedMetric[] = [];
  let current: ParsedMetric | undefined;

  for (const row of rows.slice(headerRow + 1, end)) {
    if (row.some(cell => /total metrik|panduan belajar|referensi:/i.test(cell))) break;
    const metricNumber = Number(row[0]);
    const hasMetric = Number.isInteger(metricNumber) && metricNumber > 0 && Boolean(row[1]);
    if (hasMetric && (!current || current.metricNumber !== metricNumber)) {
      const rowNumeric = findNumericValueInRow(row);
      current = {
        areaNumber,
        metricNumber,
        name: row[1],
        metricType: row[2] || 'N/A',
        isoComparison: row[3],
        formula: row[4],
        attributes: [],
        divisions: row[8] ? row[8].split(/[;,/]/).map(value => value.trim()).filter(Boolean) : [],
        actualResult: rowNumeric,
      };
      metrics.push(current);
    }

    if (current && row[5] && row[5].toLowerCase() !== 'atrribut' && row[5].toLowerCase() !== 'attribut') {
      const dataType = mapDataType(row[6]);
      const existing = current.attributes.find(attribute => attribute.name === row[5]);
      if (existing) {
        if (row[7] && !existing.allowedValues.includes(row[7])) existing.allowedValues.push(row[7]);
      } else {
        current.attributes.push({ name: row[5], dataType, exampleValue: row[7], allowedValues: row[7] ? [row[7]] : [] });
      }

      if (current.actualResult == null && row[7]) {
        const numFromAttr = parseNumericCell(row[7]);
        if (numFromAttr != null && numFromAttr >= 0 && numFromAttr <= 1000) {
          current.actualResult = numFromAttr > 100 ? Number((numFromAttr % 100).toFixed(1)) : Number(numFromAttr.toFixed(1));
        }
      }
    }
  }

  return metrics;
}

function parsePICSheet(sheet: ExcelJS.Worksheet): ParsedPIC[] {
  const rows = getRows(sheet);
  const headerIndex = rows.findIndex(row => row.some(cell => /area human capital|area iso|divisi pic/i.test(cell.toLowerCase())));
  if (headerIndex < 0) return [];
  const assignments: ParsedPIC[] = [];
  let areaNumber = 0;

  for (const row of rows.slice(headerIndex + 1)) {
    const area = Number(row[0]);
    if (Number.isInteger(area) && area > 0) areaNumber = area;
    const metricNumber = Number(row[2]);
    if (!areaNumber || !Number.isInteger(metricNumber) || metricNumber < 1) continue;
    assignments.push({
      areaNumber,
      metricNumber,
      division: row[4],
      pic2024: splitPeople(row[5]),
      pic2026: splitPeople(row[6]),
    });
  }

  return assignments;
}

function parseRekapSheet(rekapSheet: ExcelJS.Worksheet): ParsedConfiguration | null {
  const rows = getRows(rekapSheet);
  const headerRowIdx = rows.findIndex(r => r.some(c => /kode metrik|nama metrik|area iso/i.test(c.toLowerCase())));
  if (headerRowIdx < 0) return null;

  const headers = rows[headerRowIdx];
  const colArea = headers.findIndex(h => /area/i.test(h));
  const colName = headers.findIndex(h => /nama metrik/i.test(h));
  const colDiv = headers.findIndex(h => /divisi|pic/i.test(h));
  const col2026 = headers.findIndex(h => /2026|nilai|eksisting/i.test(h));
  const colFormula = headers.findIndex(h => /formula|rumus|satuan/i.test(h));

  if (colName < 0) return null;

  const areaMap = new Map<number, ParsedArea>();
  const metrics: ParsedMetric[] = [];
  const picAssignments: ParsedPIC[] = [];

  for (const row of rows.slice(headerRowIdx + 1)) {
    const nameStr = row[colName];
    if (!nameStr || /total metrik|panduan/i.test(nameStr)) continue;

    const areaStr = colArea >= 0 ? row[colArea] : '';
    let areaNum = 1;
    let areaName = areaStr || 'General ISO Area';

    const matchArea = areaStr.match(/^(\d+)\.\s*(.*)/);
    if (matchArea) {
      areaNum = parseInt(matchArea[1], 10);
      areaName = matchArea[2].trim();
    }

    if (!areaMap.has(areaNum)) {
      areaMap.set(areaNum, { areaNumber: areaNum, name: areaName, nameEn: areaName });
    }

    const val2026 = col2026 >= 0 ? row[col2026] : null;
    const numResult = parseNumericCell(val2026);
    const divCode = colDiv >= 0 && row[colDiv] ? row[colDiv] : 'HSC';

    const yearlyResults: Record<number, number> = {};
    [2021, 2022, 2023, 2024, 2025, 2026].forEach(yr => {
      const colYr = headers.findIndex(h => h.includes(String(yr)));
      if (colYr >= 0) {
        const parsedYr = parseNumericCell(row[colYr]);
        if (parsedYr != null) {
          yearlyResults[yr] = parsedYr > 100 ? Number((parsedYr % 100).toFixed(1)) : Number(parsedYr.toFixed(1));
        }
      }
    });

    const mNumber = metrics.filter(m => m.areaNumber === areaNum).length + 1;
    metrics.push({
      areaNumber: areaNum,
      metricNumber: mNumber,
      name: nameStr,
      metricType: 'Required',
      isoComparison: 'ISO 30414:2025',
      formula: colFormula >= 0 ? row[colFormula] : '',
      attributes: [],
      divisions: [divCode],
      actualResult: numResult != null ? (numResult > 100 ? Number((numResult % 100).toFixed(1)) : Number(numResult.toFixed(1))) : null,
      yearlyResults: Object.keys(yearlyResults).length > 0 ? yearlyResults : undefined,
    });

    picAssignments.push({
      areaNumber: areaNum,
      metricNumber: mNumber,
      division: divCode,
      pic2024: ['PIC Utama'],
      pic2026: ['PIC Utama (Koordinator)'],
    });
  }

  if (metrics.length === 0) return null;

  const sortedAreas = [...areaMap.values()].sort((a, b) => a.areaNumber - b.areaNumber);
  return {
    areas: sortedAreas,
    metrics,
    picAssignments,
    sheets: [rekapSheet.name],
  };
}

function applyCrisisValuesIfPresent(workbook: ExcelJS.Workbook, metrics: ParsedMetric[]) {
  const crisisSheet = workbook.worksheets.find(s => /crisis|summary|risiko/i.test(s.name));
  if (!crisisSheet) return;

  const rows = getRows(crisisSheet);
  const crisisMap = new Map<string, number>();

  for (const row of rows) {
    if (row.length >= 2) {
      const name = row[0].toLowerCase();
      const valStr = row[1];
      if (valStr) {
        const parsed = parseNumericCell(valStr);
        if (parsed != null) {
          crisisMap.set(name, parsed > 100 ? Number((parsed % 100).toFixed(1)) : Number(parsed.toFixed(1)));
        }
      }
    }
  }

  if (crisisMap.size === 0) return;

  for (const metric of metrics) {
    const mLower = metric.name.toLowerCase();
    for (const [key, val] of crisisMap.entries()) {
      const keyWords = key.split(/\s+/).filter(w => w.length > 3);
      if (mLower.includes(key) || keyWords.some(kw => mLower.includes(kw))) {
        metric.actualResult = val;
        break;
      }
    }
  }
}

export async function parseWorkbook(buffer: Buffer): Promise<ParsedConfiguration> {
  const workbook = new ExcelJS.Workbook();
  const workbookBuffer = buffer as unknown as Parameters<typeof workbook.xlsx.load>[0];
  await workbook.xlsx.load(workbookBuffer);
  const sheets = workbook.worksheets.map(sheet => sheet.name);

  // Check if this workbook is a Style B single-sheet Rekap Metrik format
  const rekapSheet = workbook.worksheets.find(w => /rekap|pelaporan|nilai/i.test(w.name));
  if (rekapSheet) {
    const parsedRekap = parseRekapSheet(rekapSheet);
    if (parsedRekap) {
      return { ...parsedRekap, sheets };
    }
  }

  // Otherwise, process as Style A (Multi-sheet per area)
  let areaSheets = workbook.worksheets.filter(sheet => /^\d+\.\s*/.test(sheet.name.trim()));
  if (areaSheets.length === 0) {
    areaSheets = workbook.worksheets.filter(sheet => !/iso area|pic|summary|crisis/i.test(sheet.name.trim()));
  }

  const areas = areaSheets.map((sheet, index) => ({
    areaNumber: index + 1,
    name: sheet.name.replace(/^\d+\.\s*/, '').trim(),
    nameEn: sheet.name.replace(/^\d+\.\s*/, '').trim(),
  }));

  const metrics = areaSheets.flatMap((sheet, index) => parseAreaSheet(sheet, index + 1));
  applyCrisisValuesIfPresent(workbook, metrics);

  const picAssignments = workbook.getWorksheet('ISO AREA') ? parsePICSheet(workbook.getWorksheet('ISO AREA')!) : [];
  return { areas, metrics, picAssignments, sheets };
}

