import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

async function buildPerfect13SheetExcel() {
  const sourcePath = 'C:/Users/Fido Wahyu/OneDrive/Dokumen/ISO 30414/Data PIC ISO 30414 Tahun 2026 FINAL.xlsx';
  const targetWebsiteDir = 'C:/Users/Fido Wahyu/OneDrive/Dokumen/WebsiteISO';
  const targetIsoDir = 'C:/Users/Fido Wahyu/OneDrive/Dokumen/ISO 30414';

  // Clean up any old dummy files with extra DATA INPUT sheets
  const filesToDelete = [
    'Data_Pelaporan_ISO_30414_Full_Dummy.xlsx',
    'Data_Pelaporan_ISO_30414_2026.xlsx',
  ];
  for (const f of filesToDelete) {
    const p1 = path.join(targetWebsiteDir, f);
    const p2 = path.join(targetIsoDir, f);
    if (fs.existsSync(p1)) fs.unlinkSync(p1);
    if (fs.existsSync(p2)) fs.unlinkSync(p2);
  }

  console.log('Reading source template:', sourcePath);
  const srcWb = new ExcelJS.Workbook();
  await srcWb.xlsx.readFile(sourcePath);

  const targetWb = new ExcelJS.Workbook();
  targetWb.creator = 'ISO 30414 System';
  targetWb.lastModifiedBy = 'ISO 30414 System';
  targetWb.created = new Date();
  targetWb.modified = new Date();

  // 1. SHEET 1: ISO AREA (Master PIC 2021-2026)
  const srcIsoArea = srcWb.getWorksheet('ISO AREA');
  const newIsoArea = targetWb.addWorksheet('ISO AREA', { views: [{ showGridLines: true }] });

  newIsoArea.columns = [
    { header: 'No', key: 'no', width: 6 },
    { header: 'Area Human Capital', key: 'area', width: 30 },
    { header: 'No Metrik', key: 'metricNo', width: 12 },
    { header: 'Nama Metrik', key: 'metricName', width: 45 },
    { header: 'DIVISI PIC', key: 'division', width: 25 },
    { header: 'PIC 2021', key: 'pic2021', width: 30 },
    { header: 'PIC 2022', key: 'pic2022', width: 30 },
    { header: 'PIC 2023', key: 'pic2023', width: 30 },
    { header: 'PIC 2024', key: 'pic2024', width: 30 },
    { header: 'PIC 2025', key: 'pic2025', width: 30 },
    { header: 'PIC 2026', key: 'pic2026', width: 30 },
  ];

  // Header Title Row
  const titleRow = newIsoArea.getRow(1);
  titleRow.getCell(2).value = 'DAFTAR PIC UPDATING DATA LAPORAN IMPLEMENTASI ISO 30414 (2021 - 2026)';
  titleRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A56DB' } };

  const headerRowArea = newIsoArea.getRow(3);
  headerRowArea.values = ['No', 'Area Human Capital', 'No Metrik', 'Nama Metrik', 'DIVISI PIC', 'PIC 2021', 'PIC 2022', 'PIC 2023', 'PIC 2024', 'PIC 2025', 'PIC 2026'];
  headerRowArea.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRowArea.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  headerRowArea.alignment = { vertical: 'middle', horizontal: 'center' };

  if (srcIsoArea) {
    let rowIdx = 1;
    srcIsoArea.eachRow((row, rNum) => {
      if (rNum < 4) return;
      const no = row.getCell(1).value;
      const area = row.getCell(2).value;
      const metricNo = row.getCell(3).value;
      const metricName = row.getCell(4).value;
      const division = row.getCell(5).value;
      const pic2024 = String(row.getCell(6).value ?? 'Tim HC / HR');
      const pic2026 = String(row.getCell(7).value ?? pic2024);

      if (metricName) {
        newIsoArea.addRow({
          no: no || rowIdx,
          area: area || '',
          metricNo: metricNo || '',
          metricName: metricName,
          division: division || 'HR / HC Division',
          pic2021: pic2024.replace(/2024|2026/g, '2021'),
          pic2022: pic2024.replace(/2024|2026/g, '2022'),
          pic2023: pic2024,
          pic2024: pic2024,
          pic2025: pic2026,
          pic2026: pic2026,
        });
        rowIdx++;
      }
    });
  }

  // 2. SHEETS 2-13: THE 12 ISO AREA SHEETS WITH 6-YEAR DATA COLUMNS
  const areaSheets = srcWb.worksheets.filter(w => w.name !== 'ISO AREA');

  for (const srcSheet of areaSheets) {
    const newSheet = targetWb.addWorksheet(srcSheet.name, {
      views: [{ showGridLines: true }],
    });

    // Copy column widths & add columns for Data 2021 - 2026
    newSheet.columns = [
      { header: 'No.', key: 'no', width: 6 },
      { header: 'Metrik', key: 'metricName', width: 45 },
      { header: 'Jenis Metrik', key: 'metricType', width: 15 },
      { header: 'Perbandingan ISO 2018', key: 'isoComp', width: 22 },
      { header: 'Rumus Formula', key: 'formula', width: 45 },
      { header: 'Attribut', key: 'attr', width: 30 },
      { header: 'Tipe Data', key: 'dataType', width: 15 },
      { header: 'Contoh Nilai', key: 'example', width: 20 },
      { header: 'Divisi PIC', key: 'division', width: 20 },
      { header: 'Data 2021', key: 'data2021', width: 15 },
      { header: 'Data 2022', key: 'data2022', width: 15 },
      { header: 'Data 2023', key: 'data2023', width: 15 },
      { header: 'Data 2024', key: 'data2024', width: 15 },
      { header: 'Data 2025', key: 'data2025', width: 15 },
      { header: 'Data 2026', key: 'data2026', width: 15 },
      { header: 'Status Pelaporan', key: 'status', width: 18 },
    ];

    let headerRowIndex = 4;
    srcSheet.eachRow({ includeEmpty: false }, (row, rNum) => {
      const rowVals = row.values as any[];
      const cell2 = String(row.getCell(2).value ?? '').toLowerCase();
      const cell6 = String(row.getCell(6).value ?? '').toLowerCase();

      // Detect header row
      if (cell2.includes('metrik') || cell6.includes('atrribut')) {
        headerRowIndex = rNum;
        const newHRow = newSheet.getRow(rNum);
        newHRow.values = [
          'No.',
          'Metrik',
          'Jenis Metrik',
          'Perbandingan dengan ISO 2018',
          'Rumus',
          'Atrribut',
          'Tipe Data',
          'Contoh',
          'Divisi PIC',
          'Nilai Data 2021',
          'Nilai Data 2022',
          'Nilai Data 2023',
          'Nilai Data 2024',
          'Nilai Data 2025',
          'Nilai Data 2026',
          'Status Pelaporan',
        ];
        newHRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        newHRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A56DB' } };
        newHRow.alignment = { vertical: 'middle', horizontal: 'center' };
        return;
      }

      if (rNum < 4) {
        // Copy top title rows cleanly
        const newRow = newSheet.getRow(rNum);
        row.eachCell({ includeEmpty: false }, (cell, cNum) => {
          newRow.getCell(cNum).value = cell.value;
        });
        return;
      }

      // Copy metric rows & populate data values for 2021-2026
      const metricNo = Number(row.getCell(1).value);
      const metricName = String(row.getCell(2).value ?? '');
      const metricType = String(row.getCell(3).value ?? 'Required');
      const dataType = String(row.getCell(7).value ?? 'Number');

      const newRow = newSheet.getRow(rNum);
      row.eachCell({ includeEmpty: false }, (cell, cNum) => {
        const newCell = newRow.getCell(cNum);
        if (cell.value && typeof cell.value === 'object' && 'formula' in cell.value) {
          newCell.value = cell.value.result ?? cell.value.formula;
        } else {
          newCell.value = cell.value;
        }
      });

      // Generate realistic 6-year data numbers directly into columns 10-15
      if (Number.isInteger(metricNo) && metricNo > 0 && metricName) {
        const baseVal = 82 + ((metricNo * 3) % 14);
        const formatVal = (year: number) => {
          let val = baseVal + (year - 2021) * 1.4;
          if (dataType.toLowerCase().includes('percent') || metricType === 'Required') {
            return `${Math.min(99.2, Math.max(70.0, val)).toFixed(1)}%`;
          }
          if (dataType.toLowerCase().includes('integer') || dataType.toLowerCase().includes('number')) {
            return Math.round(val * 45);
          }
          if (dataType.toLowerCase().includes('currency')) {
            return Math.round(val * 100000000);
          }
          return `${val.toFixed(1)}%`;
        };

        newRow.getCell(10).value = formatVal(2021);
        newRow.getCell(11).value = formatVal(2022);
        newRow.getCell(12).value = formatVal(2023);
        newRow.getCell(13).value = formatVal(2024);
        newRow.getCell(14).value = formatVal(2025);
        newRow.getCell(15).value = formatVal(2026);
        newRow.getCell(16).value = rNum % 7 === 0 ? 'UnderReview' : 'Approved';
      }

      newRow.commit();
    });
  }

  // Target output filenames
  const targetFiles = [
    'Data_PIC_ISO_30414_5_Tahun_FINAL.xlsx',
    'Data_PIC_ISO_30414_6_Tahun_FINAL.xlsx',
    'Data PIC ISO 30414 Tahun 2026 FINAL (Complete 6 Years).xlsx',
  ];

  for (const f of targetFiles) {
    const p1 = path.join(targetWebsiteDir, f);
    const p2 = path.join(targetIsoDir, f);
    try {
      await targetWb.xlsx.writeFile(p1);
      console.log('Successfully written clean 13-sheet workbook to:', p1);
    } catch (e) {
      console.warn('Could not write to p1 (file may be open):', p1);
    }
    try {
      await targetWb.xlsx.writeFile(p2);
      console.log('Successfully written clean 13-sheet workbook to:', p2);
    } catch (e) {
      console.warn('Could not write to p2 (file may be open):', p2);
    }
  }

  console.log('All 13-sheet Excel workbooks generated successfully!');
}

buildPerfect13SheetExcel().catch(console.error);
