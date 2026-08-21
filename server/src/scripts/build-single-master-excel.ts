import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

async function buildSingleMasterExcel() {
  const websiteDir = 'C:/Users/Fido Wahyu/OneDrive/Dokumen/WebsiteISO';
  const isoDir = 'C:/Users/Fido Wahyu/OneDrive/Dokumen/ISO 30414';
  const sourcePath = 'C:/Users/Fido Wahyu/OneDrive/Dokumen/ISO 30414/Data PIC ISO 30414 Tahun 2026 FINAL.xlsx';
  const masterFileName = 'Data PIC ISO 30414 Tahun 2026 FINAL.xlsx';

  // 1. Clean up temporary / duplicate xlsx files
  const tempFiles = [
    'Data_PIC_ISO_30414_5_Tahun_FINAL.xlsx',
    'Data_PIC_ISO_30414_6_Tahun_FINAL.xlsx',
    'Data PIC ISO 30414 Tahun 2026 FINAL (Complete 5 Years).xlsx',
    'Data PIC ISO 30414 Tahun 2026 FINAL (Complete 6 Years).xlsx',
    'Data_Pelaporan_ISO_30414_Full_Dummy.xlsx',
    'Data_Pelaporan_ISO_30414_2026.xlsx',
    'Data_Dummy_Nilai_Pelaporan_ISO_30414_PLN.xlsx',
    'Data_Dummy_Input_Metrik_2021_2026.xlsx',
  ];

  for (const f of tempFiles) {
    const p1 = path.join(websiteDir, f);
    const p2 = path.join(isoDir, f);
    try { if (fs.existsSync(p1)) fs.unlinkSync(p1); } catch (e) {}
    try { if (fs.existsSync(p2)) fs.unlinkSync(p2); } catch (e) {}
  }

  console.log('Reading source template:', sourcePath);
  const srcWb = new ExcelJS.Workbook();
  await srcWb.xlsx.readFile(sourcePath);

  const masterWb = new ExcelJS.Workbook();
  masterWb.creator = 'PT PLN (Persero) ISO 30414 Master System';
  masterWb.lastModifiedBy = 'PT PLN (Persero) ISO 30414 Master System';
  masterWb.created = new Date();
  masterWb.modified = new Date();

  // ─── SHEET 1: ISO AREA (Master PIC 2021-2026) ──────────────────────────────
  const srcIsoArea = srcWb.getWorksheet('ISO AREA');
  const newIsoArea = masterWb.addWorksheet('ISO AREA', { views: [{ showGridLines: true }] });

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

  // ─── SHEETS 2-13: THE 12 ISO AREA KPI SHEETS WITH INLINE 6-YEAR DATA ───────
  const areaSheets = srcWb.worksheets.filter(w => w.name !== 'ISO AREA');

  for (const srcSheet of areaSheets) {
    const newSheet = masterWb.addWorksheet(srcSheet.name, { views: [{ showGridLines: true }] });

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
      { header: 'Nilai Data 2021', key: 'data2021', width: 15 },
      { header: 'Nilai Data 2022', key: 'data2022', width: 15 },
      { header: 'Nilai Data 2023', key: 'data2023', width: 15 },
      { header: 'Nilai Data 2024', key: 'data2024', width: 15 },
      { header: 'Nilai Data 2025', key: 'data2025', width: 15 },
      { header: 'Nilai Data 2026', key: 'data2026', width: 15 },
      { header: 'Status Pelaporan', key: 'status', width: 18 },
    ];

    srcSheet.eachRow({ includeEmpty: false }, (row, rNum) => {
      const cell2 = String(row.getCell(2).value ?? '').toLowerCase();
      const cell6 = String(row.getCell(6).value ?? '').toLowerCase();

      if (cell2.includes('metrik') || cell6.includes('atrribut')) {
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
        const newRow = newSheet.getRow(rNum);
        row.eachCell({ includeEmpty: false }, (cell, cNum) => {
          newRow.getCell(cNum).value = cell.value;
        });
        return;
      }

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

  // ─── SHEET 14: REKAP METRIK (2021-2026) ────────────────────────────────────
  const rekapSheet = masterWb.addWorksheet('REKAP METRIK (2021-2026)', { views: [{ showGridLines: true }] });
  rekapSheet.columns = [
    { header: 'No', key: 'no', width: 6 },
    { header: 'Kode Metrik', key: 'code', width: 14 },
    { header: 'Nama Metrik ISO 30414', key: 'name', width: 45 },
    { header: 'Area ISO 30414', key: 'area', width: 32 },
    { header: 'Divisi PIC', key: 'division', width: 15 },
    { header: 'Satuan', key: 'unit', width: 15 },
    { header: 'Nilai 2021', key: 'v2021', width: 18 },
    { header: 'Nilai 2022', key: 'v2022', width: 18 },
    { header: 'Nilai 2023', key: 'v2023', width: 18 },
    { header: 'Nilai 2024', key: 'v2024', width: 18 },
    { header: 'Nilai 2025', key: 'v2025', width: 18 },
    { header: 'Nilai 2026', key: 'v2026', width: 18 },
    { header: 'Status Pelaporan', key: 'status', width: 18 },
  ];

  const rHeader = rekapSheet.getRow(1);
  rHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  rHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
  rHeader.alignment = { vertical: 'middle', horizontal: 'center' };

  const dummyMetrics = [
    { code: 'M-1.1', name: 'Jumlah Karyawan Total (Headcount)', area: '1. Workforce Composition', div: 'HSC', unit: 'Orang', base: 5200, growth: 120 },
    { code: 'M-1.2', name: 'FTE (Setara Penuh Waktu)', area: '1. Workforce Composition', div: 'HSC', unit: 'FTE', base: 4950, growth: 110 },
    { code: 'M-2.1', name: 'Persentase Pekerja Perempuan', area: '2. Diversity', div: 'HST', unit: 'Persen', base: 32.4, growth: 1.5 },
    { code: 'M-3.1', name: 'Total Biaya Tenaga Kerja', area: '3. Cost', div: 'HST', unit: 'Rupiah', base: 850000000000, growth: 35000000000 },
    { code: 'M-4.1', name: 'Pendapatan per Karyawan (Revenue/FTE)', area: '4. Productivity', div: 'HST', unit: 'Rupiah', base: 2850000000, growth: 150000000 },
    { code: 'M-12.1', name: 'Rata-rata Jam Pelatihan Formal', area: '12. Learning & Development', div: 'PUSDIKLAT', unit: 'Jam/Orang', base: 34.5, growth: 2.5 },
  ];

  dummyMetrics.forEach((m, idx) => {
    const calcVal = (year: number) => (m.base + (year - 2021) * m.growth).toLocaleString();
    rekapSheet.addRow({
      no: idx + 1, code: m.code, name: m.name, area: m.area, division: m.div, unit: m.unit,
      v2021: calcVal(2021), v2022: calcVal(2022), v2023: calcVal(2023), v2024: calcVal(2024), v2025: calcVal(2025), v2026: calcVal(2026),
      status: 'Approved',
    });
  });

  // ─── SHEET 15: DATA TRANSAKSI PEGAWAI PLN ──────────────────────────────────
  const empSheet = masterWb.addWorksheet('DATA TRANSAKSI PEGAWAI PLN', { views: [{ showGridLines: true }] });
  empSheet.columns = [
    { header: 'NIP Pegawai', key: 'nip', width: 18 },
    { header: 'Nama Lengkap Karyawan', key: 'name', width: 28 },
    { header: 'Divisi Unit Kerja', key: 'division', width: 20 },
    { header: 'Status Hubungan Kerja', key: 'status', width: 20 },
    { header: 'Gaji Pokok / Bulan', key: 'salary', width: 22 },
  ];

  const empHeader = empSheet.getRow(1);
  empHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  empHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B5CF6' } };

  ['Ahmad Fauzi', 'Budi Santoso', 'Citra Dewi', 'Dwinanto Wibowo', 'Eka Putra'].forEach((name, i) => {
    const r = empSheet.addRow({
      nip: `230624${5651 + i}`, name, division: 'HSC / HTD', status: 'Karyawan Tetap', salary: 12500000 + i * 1500000,
    });
    r.getCell(5).numFmt = 'Rp #,##0';
  });

  // Save the Single Master File
  const p1 = path.join(websiteDir, masterFileName);
  const p2 = path.join(isoDir, masterFileName);

  try { await masterWb.xlsx.writeFile(p1); console.log('Successfully saved single master file:', p1); } catch (e) { console.warn('Could not write p1:', p1); }
  try { await masterWb.xlsx.writeFile(p2); console.log('Successfully saved single master file:', p2); } catch (e) { console.warn('Could not write p2:', p2); }

  console.log('Single master Excel file created successfully!');
}

buildSingleMasterExcel().catch(console.error);
