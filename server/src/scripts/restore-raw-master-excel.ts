import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

async function restoreRawMasterExcel() {
  const websiteDir = 'C:/Users/Fido Wahyu/OneDrive/Dokumen/WebsiteISO';
  const isoDir = 'C:/Users/Fido Wahyu/OneDrive/Dokumen/ISO 30414';
  const sourcePath = 'C:/Users/Fido Wahyu/OneDrive/Dokumen/ISO 30414/Data PIC ISO 30414 Tahun 2026 FINAL.xlsx';
  const rawFileName = 'Data PIC ISO 30414 Tahun 2026 FINAL.xlsx';

  console.log('Reading original raw template from:', sourcePath);
  const srcWb = new ExcelJS.Workbook();
  await srcWb.xlsx.readFile(sourcePath);

  const rawWb = new ExcelJS.Workbook();
  rawWb.creator = 'ISO 30414 Master System';
  rawWb.lastModifiedBy = 'ISO 30414 Master System';
  rawWb.created = new Date();
  rawWb.modified = new Date();

  // 1. Copy ISO AREA sheet cleanly (only raw columns)
  const srcIsoArea = srcWb.getWorksheet('ISO AREA');
  const newIsoArea = rawWb.addWorksheet('ISO AREA', { views: [{ showGridLines: true }] });

  newIsoArea.columns = [
    { header: 'No', key: 'no', width: 6 },
    { header: 'Area Human Capital', key: 'area', width: 30 },
    { header: 'No Metrik', key: 'metricNo', width: 12 },
    { header: 'Nama Metrik', key: 'metricName', width: 45 },
    { header: 'DIVISI PIC', key: 'division', width: 25 },
    { header: 'PIC 2024', key: 'pic2024', width: 35 },
    { header: 'PIC 2026', key: 'pic2026', width: 35 },
  ];

  if (srcIsoArea) {
    srcIsoArea.eachRow({ includeEmpty: false }, (row, rNum) => {
      const newRow = newIsoArea.getRow(rNum);
      row.eachCell({ includeEmpty: false }, (cell, cNum) => {
        if (cNum <= 7) {
          const newCell = newRow.getCell(cNum);
          newCell.value = cell.value;
          if (rNum <= 4) {
            newCell.font = { bold: true };
          }
        }
      });
      newRow.commit();
    });
  }

  // 2. Copy the 12 Area sheets cleanly (only raw columns 1 to 9)
  const areaSheets = srcWb.worksheets.filter(w => w.name !== 'ISO AREA' && !w.name.includes('REKAP') && !w.name.includes('PEGAWAI') && !w.name.includes('BIAYA'));

  for (const srcSheet of areaSheets) {
    const newSheet = rawWb.addWorksheet(srcSheet.name, { views: [{ showGridLines: true }] });

    newSheet.columns = [
      { header: 'No.', key: 'no', width: 6 },
      { header: 'Metrik', key: 'metricName', width: 45 },
      { header: 'Jenis Metrik', key: 'metricType', width: 15 },
      { header: 'Perbandingan dengan ISO 2018', key: 'isoComp', width: 25 },
      { header: 'Rumus', key: 'formula', width: 45 },
      { header: 'Atrribut', key: 'attr', width: 30 },
      { header: 'Tipe Data', key: 'dataType', width: 15 },
      { header: 'Contoh', key: 'example', width: 20 },
      { header: 'Divisi PIC', key: 'division', width: 20 },
    ];

    srcSheet.eachRow({ includeEmpty: false }, (row, rNum) => {
      const newRow = newSheet.getRow(rNum);
      row.eachCell({ includeEmpty: false }, (cell, cNum) => {
        if (cNum <= 9) {
          const newCell = newRow.getCell(cNum);
          if (cell.value && typeof cell.value === 'object' && 'formula' in cell.value) {
            newCell.value = cell.value.result ?? cell.value.formula;
          } else {
            newCell.value = cell.value;
          }

          if (rNum === 1 || (cell.value && String(cell.value).toLowerCase().includes('metrik'))) {
            newCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            newCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A56DB' } };
            newCell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        }
      });
      newRow.commit();
    });
  }

  // Save the single raw master file
  const p1 = path.join(websiteDir, rawFileName);
  const p2 = path.join(isoDir, rawFileName);

  try { await rawWb.xlsx.writeFile(p1); console.log('Successfully written raw master file:', p1); } catch (e) { console.warn('p1 locked:', p1); }
  try { await rawWb.xlsx.writeFile(p2); console.log('Successfully written raw master file:', p2); } catch (e) { console.warn('p2 locked:', p2); }

  console.log('Single raw master Excel file restored successfully!');
}

restoreRawMasterExcel().catch(console.error);
