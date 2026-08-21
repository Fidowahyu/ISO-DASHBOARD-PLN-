import ExcelJS from 'exceljs';
import path from 'path';

async function createBmwCrisisExcel() {
  const websiteDir = 'C:/Users/Fido Wahyu/OneDrive/Dokumen/WebsiteISO';
  const isoDir = 'C:/Users/Fido Wahyu/OneDrive/Dokumen/ISO 30414';
  const sourcePath = 'C:/Users/Fido Wahyu/OneDrive/Dokumen/ISO 30414/Data PIC ISO 30414 Tahun 2026 FINAL.xlsx';
  const fileName = 'Data_PIC_ISO_30414_BMW_Group_Critical_Crisis.xlsx';

  console.log('Building BMW Group Critical Crisis Excel Workbook...');
  const srcWb = new ExcelJS.Workbook();
  await srcWb.xlsx.readFile(sourcePath);

  const bmwWb = new ExcelJS.Workbook();
  bmwWb.creator = 'BMW Group Turnaround Advisory Taskforce';
  bmwWb.lastModifiedBy = 'BMW Group Turnaround Advisory Taskforce';
  bmwWb.created = new Date();
  bmwWb.modified = new Date();

  // 1. EXECUTIVE CRISIS SUMMARY SHEET
  const summary = bmwWb.addWorksheet('CRISIS SUMMARY', { views: [{ showGridLines: true }] });
  summary.columns = [
    { header: 'Indikator Risiko Kritis', key: 'metric', width: 35 },
    { header: 'Nilai Eksisting (Kondisi Parah)', key: 'val', width: 28 },
    { header: 'Target Benchmark ISO 30414', key: 'target', width: 28 },
    { header: 'Status Risiko', key: 'status', width: 22 },
    { header: 'Dampak Risko & Peringatan Konsultan', key: 'impact', width: 55 },
  ];

  const headerRow = summary.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; // Red Alert Fill
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  const crisisData = [
    { metric: 'Voluntary Turnover Rate (Talent Drain)', val: '14.8% / tahun', target: '< 3.0% / tahun', status: 'CRITICAL RISK', impact: 'Pengurasan insinyur kunci perangkat lunak EV & teknisi perakitan otomotif.' },
    { metric: 'LTIFR (Tingkat Kecelakaan Kerja)', val: '2.85 (480 Jam Kerja Hilang)', target: '< 0.10 (Zero Harm)', status: 'CRITICAL RISK', impact: 'Tingkat kecelakaan kerja di lini perakitan pabrik sangat tinggi.' },
    { metric: 'Absenteeism Rate (Ketidakhadiran)', val: '7.6% / tahun', target: '< 1.8% / tahun', status: 'HIGH RISK', impact: 'Tingkat kelelahan (burnout) pekerja pabrik & stres kerja tinggi.' },
    { metric: 'Human Capital ROI (HC ROI)', val: '1.20x (Anjlok)', target: '> 3.50x', status: 'HIGH RISK', impact: 'Efisiensi beban kerja & hasil finansial tenaga kerja memburuk tajam.' },
    { metric: 'Skor Engagement & Kepuasan Kerja', val: '42.1% (Sangat Rendah)', target: '> 85.0%', status: 'CRITICAL RISK', impact: 'Krisis moral pekerja, demotivasi, dan potensi mogok kerja massal.' },
    { metric: 'Cakupan Pelatihan Etika & Kepatuhan', val: '62.4% (Audit Findings)', target: '100.0%', status: 'HIGH RISK', impact: 'Temuan audit non-compliance ketenagakerjaan eksternal berulang.' },
    { metric: 'Keterwakilan Manajerial Perempuan', val: '12.5% (Sangat Rendah)', target: '> 35.0%', status: 'HIGH RISK', impact: 'Skor ESG Diversity Index sangat buruk di industri otomotif.' },
    { metric: 'Succession Coverage Posisi Kritis', val: '0.8 Calon (Rasio Kritis)', target: '3.0 Calon Ready-Now', status: 'CRITICAL RISK', impact: 'Kekosongan kepemimpinan teknik tanpa calon penerus yang siap.' },
  ];

  crisisData.forEach(item => summary.addRow(item));

  // 2. ISO AREA MASTER SHEET
  const srcIsoArea = srcWb.getWorksheet('ISO AREA');
  const newIsoArea = bmwWb.addWorksheet('ISO AREA', { views: [{ showGridLines: true }] });

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
  titleRow.getCell(2).value = 'BMW GROUP - DAFTAR PIC UPDATING DATA METRIK ISO 30414 (CRISIS AUDIT)';
  titleRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };

  if (srcIsoArea) {
    srcIsoArea.eachRow({ includeEmpty: false }, (row, rNum) => {
      if (rNum < 4) return;
      const no = row.getCell(1).value;
      const area = row.getCell(2).value;
      const metricNo = row.getCell(3).value;
      const metricName = row.getCell(4).value;
      const division = row.getCell(5).value;
      const pic2024 = String(row.getCell(6).value ?? 'BMW Automotive HR');
      const pic2026 = String(row.getCell(7).value ?? pic2024);

      if (metricName) {
        newIsoArea.addRow({ no, area, metricNo, metricName, division, pic2024, pic2026 });
      }
    });
  }

  // 3. COPY THE 12 AREA SHEETS WITH SEVERE CRISIS VALUES
  const areaSheets = srcWb.worksheets.filter(w => w.name !== 'ISO AREA' && !w.name.includes('REKAP') && !w.name.includes('PEGAWAI') && !w.name.includes('BIAYA'));

  for (const srcSheet of areaSheets) {
    const newSheet = bmwWb.addWorksheet(srcSheet.name, { views: [{ showGridLines: true }] });

    newSheet.columns = [
      { header: 'No.', key: 'no', width: 6 },
      { header: 'Metrik', key: 'metricName', width: 45 },
      { header: 'Jenis Metrik', key: 'metricType', width: 15 },
      { header: 'Perbandingan dengan ISO 2018', key: 'isoComp', width: 25 },
      { header: 'Rumus', key: 'formula', width: 45 },
      { header: 'Atrribut', key: 'attr', width: 30 },
      { header: 'Tipe Data', key: 'dataType', width: 15 },
      { header: 'Contoh Nilai Eksisting (Kondisi Parah)', key: 'example', width: 32 },
      { header: 'Divisi PIC', key: 'division', width: 20 },
    ];

    srcSheet.eachRow({ includeEmpty: false }, (row, rNum) => {
      const newRow = newSheet.getRow(rNum);
      row.eachCell({ includeEmpty: false }, (cell, cNum) => {
        if (cNum <= 9) {
          const newCell = newRow.getCell(cNum);
          newCell.value = cell.value;

          if (rNum === 1 || (cell.value && String(cell.value).toLowerCase().includes('metrik'))) {
            newCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            newCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
            newCell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        }
      });
      newRow.commit();
    });
  }

  // Save Target File
  const p1 = path.join(websiteDir, fileName);
  const p2 = path.join(isoDir, fileName);

  try { await bmwWb.xlsx.writeFile(p1); console.log('Successfully written BMW Crisis Excel file:', p1); } catch (e) { console.warn('p1 locked:', p1); }
  try { await bmwWb.xlsx.writeFile(p2); console.log('Successfully written BMW Crisis Excel file:', p2); } catch (e) { console.warn('p2 locked:', p2); }

  console.log('BMW Group Critical Crisis Excel Workbook created successfully!');
}

createBmwCrisisExcel().catch(console.error);
