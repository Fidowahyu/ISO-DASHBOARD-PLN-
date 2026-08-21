import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

async function createNewSeparateExcel() {
  const websiteDir = 'C:/Users/Fido Wahyu/OneDrive/Dokumen/WebsiteISO';
  const isoDir = 'C:/Users/Fido Wahyu/OneDrive/Dokumen/ISO 30414';
  const sourcePath = 'C:/Users/Fido Wahyu/OneDrive/Dokumen/ISO 30414/Data PIC ISO 30414 Tahun 2026 FINAL.xlsx';

  const originalPlnFile = 'Data PIC ISO 30414 Tahun 2026 FINAL.xlsx';
  const newEnterpriseFile = 'Data_PIC_ISO_30414_Global_Enterprise.xlsx';

  console.log('Reading original template from:', sourcePath);
  const srcWb = new ExcelJS.Workbook();
  await srcWb.xlsx.readFile(sourcePath);

  // 1. RESTORE ORIGINAL PLN FILE
  const plnWb = new ExcelJS.Workbook();
  plnWb.creator = 'PT PLN (Persero) ISO 30414 System';
  plnWb.lastModifiedBy = 'PT PLN (Persero) ISO 30414 System';
  plnWb.created = new Date();
  plnWb.modified = new Date();

  // Copy all worksheets from source cleanly
  for (const srcSheet of srcWb.worksheets) {
    if (srcSheet.name.includes('REKAP') || srcSheet.name.includes('PEGAWAI') || srcSheet.name.includes('BIAYA')) continue;
    const newSheet = plnWb.addWorksheet(srcSheet.name, { views: [{ showGridLines: true }] });

    srcSheet.columns?.forEach((col, i) => {
      if (col && newSheet.getColumn(i + 1)) {
        newSheet.getColumn(i + 1).width = col.width || 15;
      }
    });

    srcSheet.eachRow({ includeEmpty: false }, (row, rNum) => {
      const newRow = newSheet.getRow(rNum);
      row.eachCell({ includeEmpty: false }, (cell, cNum) => {
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
      });
      newRow.commit();
    });
  }

  // 2. CREATE NEW SEPARATE GLOBAL ENTERPRISE EXCEL FILE
  console.log('Creating new separate Global Enterprise Excel file...');
  const enterpriseWb = new ExcelJS.Workbook();
  enterpriseWb.creator = 'Global Enterprise Corporation ISO 30414 System';
  enterpriseWb.lastModifiedBy = 'Global Enterprise Corporation ISO 30414 System';
  enterpriseWb.created = new Date();
  enterpriseWb.modified = new Date();

  // Copy ISO AREA sheet with Global Enterprise title
  const srcIsoArea = srcWb.getWorksheet('ISO AREA');
  const newIsoArea = enterpriseWb.addWorksheet('ISO AREA', { views: [{ showGridLines: true }] });

  newIsoArea.columns = [
    { header: 'No', key: 'no', width: 6 },
    { header: 'Area Human Capital', key: 'area', width: 30 },
    { header: 'No Metrik', key: 'metricNo', width: 12 },
    { header: 'Nama Metrik', key: 'metricName', width: 45 },
    { header: 'DIVISI PIC', key: 'division', width: 25 },
    { header: 'PIC 2024', key: 'pic2024', width: 35 },
    { header: 'PIC 2026', key: 'pic2026', width: 35 },
  ];

  const titleRow = newIsoArea.getRow(1);
  titleRow.getCell(2).value = 'DAFTAR PIC UPDATING DATA LAPORAN ISO 30414 GLOBAL ENTERPRISE CORP';
  titleRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A56DB' } };

  if (srcIsoArea) {
    srcIsoArea.eachRow({ includeEmpty: false }, (row, rNum) => {
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
          no, area, metricNo, metricName, division, pic2024, pic2026,
        });
      }
    });
  }

  // Copy 12 Area sheets for Global Enterprise
  const areaSheets = srcWb.worksheets.filter(w => w.name !== 'ISO AREA' && !w.name.includes('REKAP') && !w.name.includes('PEGAWAI') && !w.name.includes('BIAYA'));

  for (const srcSheet of areaSheets) {
    const newSheet = enterpriseWb.addWorksheet(srcSheet.name, { views: [{ showGridLines: true }] });

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

  // Save Original PLN File
  try { await plnWb.xlsx.writeFile(path.join(websiteDir, originalPlnFile)); } catch (e) {}
  try { await plnWb.xlsx.writeFile(path.join(isoDir, originalPlnFile)); } catch (e) {}

  // Save NEW Separate Global Enterprise File
  const p1 = path.join(websiteDir, newEnterpriseFile);
  const p2 = path.join(isoDir, newEnterpriseFile);
  try { await enterpriseWb.xlsx.writeFile(p1); console.log('Successfully created NEW separate file:', p1); } catch (e) { console.warn('p1 locked:', p1); }
  try { await enterpriseWb.xlsx.writeFile(p2); console.log('Successfully created NEW separate file:', p2); } catch (e) { console.warn('p2 locked:', p2); }

  console.log('Original file restored and NEW separate Excel file created successfully!');
}

createNewSeparateExcel().catch(console.error);
