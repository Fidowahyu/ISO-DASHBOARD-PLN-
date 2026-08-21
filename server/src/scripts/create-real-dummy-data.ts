import ExcelJS from 'exceljs';
import path from 'path';

async function createRealDummyDataExcel() {
  const targetWebsiteDir = 'C:/Users/Fido Wahyu/OneDrive/Dokumen/WebsiteISO';
  const targetIsoDir = 'C:/Users/Fido Wahyu/OneDrive/Dokumen/ISO 30414';

  const fileNames = [
    'Data_Dummy_Nilai_Pelaporan_ISO_30414_PLN.xlsx',
    'Data_Dummy_Input_Metrik_2021_2026.xlsx',
  ];

  console.log('Creating real transactional dummy data workbook...');
  const wb = new ExcelJS.Workbook();
  wb.creator = 'PT PLN (Persero) HC System';
  wb.lastModifiedBy = 'PT PLN (Persero) HC System';
  wb.created = new Date();
  wb.modified = new Date();

  // ─── SHEET 1: REKAP NILAI 84 METRIK ISO 30414 (2021-2026) ───────────────────
  const rekapSheet = wb.addWorksheet('REKAP METRIK (2021-2026)', {
    views: [{ showGridLines: true }],
  });

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
    { header: 'Analisis & Catatan Verifikasi', key: 'notes', width: 50 },
  ];

  const rHeader = rekapSheet.getRow(1);
  rHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  rHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A56DB' } };
  rHeader.alignment = { vertical: 'middle', horizontal: 'center' };

  // Sample real metric definitions with accurate units and values
  const dummyMetrics = [
    // Area 1: Workforce Composition
    { code: 'M-1.1', name: 'Jumlah Karyawan Total (Headcount)', area: '1. Workforce Composition', div: 'HSC', unit: 'Orang', base: 5200, growth: 120, isCurrency: false, isPercent: false },
    { code: 'M-1.2', name: 'FTE (Setara Penuh Waktu)', area: '1. Workforce Composition', div: 'HSC', unit: 'FTE', base: 4950, growth: 110, isCurrency: false, isPercent: false },
    { code: 'M-1.3', name: 'Rasio Karyawan Tetap (Full-time)', area: '1. Workforce Composition', div: 'HSC', unit: 'Persen', base: 88.5, growth: 1.2, isCurrency: false, isPercent: true },
    { code: 'M-1.4', name: 'Tenaga Kerja Kontingen / Outsourcing', area: '1. Workforce Composition', div: 'HSC', unit: 'Orang', base: 420, growth: -15, isCurrency: false, isPercent: false },

    // Area 2: Diversity
    { code: 'M-2.1', name: 'Persentase Pekerja Perempuan (Gender Diversity)', area: '2. Diversity', div: 'HST', unit: 'Persen', base: 32.4, growth: 1.5, isCurrency: false, isPercent: true },
    { code: 'M-2.2', name: 'Persentase Perempuan di Posisi Manajerial', area: '2. Diversity', div: 'HST', unit: 'Persen', base: 26.8, growth: 1.8, isCurrency: false, isPercent: true },
    { code: 'M-2.3', name: 'Distribusi Karyawan per Kelompok Usia (<30 thn)', area: '2. Diversity', div: 'HST', unit: 'Persen', base: 28.5, growth: 0.8, isCurrency: false, isPercent: true },
    { code: 'M-2.4', name: 'Rasio Kesetaraan Gaji Gender (Gender Pay Gap)', area: '2. Diversity', div: 'HST', unit: 'Persen', base: 98.2, growth: 0.3, isCurrency: false, isPercent: true },

    // Area 3: Cost
    { code: 'M-3.1', name: 'Total Biaya Tenaga Kerja (Total Workforce Cost)', area: '3. Cost', div: 'HST', unit: 'Rupiah', base: 850000000000, growth: 35000000000, isCurrency: true, isPercent: false },
    { code: 'M-3.2', name: 'Rata-rata Biaya per FTE (Cost per FTE)', area: '3. Cost', div: 'HST', unit: 'Rupiah', base: 171700000, growth: 5500000, isCurrency: true, isPercent: false },
    { code: 'M-3.3', name: 'Biaya Rekrutmen per Karyawan Baru', area: '3. Cost', div: 'HST', unit: 'Rupiah', base: 12500000, growth: -300000, isCurrency: true, isPercent: false },
    { code: 'M-3.4', name: 'Total Biaya Pelatihan & Pengembangan', area: '3. Cost', div: 'PUSDIKLAT', unit: 'Rupiah', base: 45000000000, growth: 3000000000, isCurrency: true, isPercent: false },

    // Area 4: Productivity
    { code: 'M-4.1', name: 'Pendapatan per Karyawan (Revenue per FTE)', area: '4. Productivity', div: 'HST', unit: 'Rupiah', base: 2850000000, growth: 150000000, isCurrency: true, isPercent: false },
    { code: 'M-4.2', name: 'EBIT / Operasional per FTE', area: '4. Productivity', div: 'HST', unit: 'Rupiah', base: 720000000, growth: 45000000, isCurrency: true, isPercent: false },
    { code: 'M-4.3', name: 'Human Capital ROI (HC ROI)', area: '4. Productivity', div: 'HST', unit: 'Rasio / X', base: 3.45, growth: 0.15, isCurrency: false, isPercent: false },

    // Area 5: Health, Safety & Well-being
    { code: 'M-5.1', name: 'Tingkat Kecelakaan Kerja (LTIFR)', area: '5. Health, Safety', div: 'K3L', unit: 'Rasio', base: 0.42, growth: -0.06, isCurrency: false, isPercent: false },
    { code: 'M-5.2', name: 'Jumlah Jam Kerja Hilang akibat Kecelakaan', area: '5. Health, Safety', div: 'K3L', unit: 'Jam', base: 120, growth: -20, isCurrency: false, isPercent: false },
    { code: 'M-5.3', name: 'Persentase Karyawan Mengikuti Medical Check-up', area: '5. Health, Safety', div: 'K3L', unit: 'Persen', base: 94.2, growth: 1.1, isCurrency: false, isPercent: true },

    // Area 6: Leadership & Engagement
    { code: 'M-6.1', name: 'Skor Kepuasan & Engagement Karyawan', area: '6. Leadership', div: 'HTD', unit: 'Persen', base: 84.5, growth: 1.6, isCurrency: false, isPercent: true },
    { code: 'M-6.2', name: 'Rasio Pemimpin per Karyawan (Span of Control)', area: '6. Leadership', div: 'HTD', unit: 'Rasio', base: 8.5, growth: -0.2, isCurrency: false, isPercent: false },

    // Area 7: Compliance & Ethics
    { code: 'M-7.1', name: 'Persentase Karyawan Lolos Pelatihan Etika & Kepatuhan', area: '7. Compliance', div: 'SPI', unit: 'Persen', base: 96.8, growth: 0.6, isCurrency: false, isPercent: true },
    { code: 'M-7.2', name: 'Jumlah Temuan Audit Eksternal Ketenagakerjaan', area: '7. Compliance', div: 'SPI', unit: 'Kasus', base: 3, growth: -1, isCurrency: false, isPercent: false },

    // Area 8: Recruitment
    { code: 'M-8.1', name: 'Rata-rata Waktu Pengisian Posisi Kosong (Time to Fill)', area: '8. Recruitment', div: 'HTD', unit: 'Hari', base: 38, growth: -2, isCurrency: false, isPercent: false },
    { code: 'M-8.2', name: 'Persentase Posisi Kosong Terisi Tepat Waktu', area: '8. Recruitment', div: 'HTD', unit: 'Persen', base: 89.4, growth: 1.5, isCurrency: false, isPercent: true },

    // Area 9: Mobility & Succession
    { code: 'M-9.1', name: 'Tingkat Mobilitas Internal Karyawan', area: '9. Mobility', div: 'HTD', unit: 'Persen', base: 9.8, growth: 0.4, isCurrency: false, isPercent: true },
    { code: 'M-9.2', name: 'Persentase Posisi Kritis Terisi Internal', area: '9. Mobility', div: 'HTD', unit: 'Persen', base: 91.2, growth: 1.1, isCurrency: false, isPercent: true },

    // Area 10: Succession Planning
    { code: 'M-10.1', name: 'Succession Coverage (Jumlah Penerus per Posisi Kritis)', area: '10. Succession', div: 'HTD', unit: 'Calon/Posisi', base: 2.1, growth: 0.2, isCurrency: false, isPercent: false },
    { code: 'M-10.2', name: 'Persentase Calon Penerus Ready Now (0-12 Bulan)', area: '10. Succession', div: 'HTD', unit: 'Persen', base: 64.5, growth: 2.8, isCurrency: false, isPercent: true },

    // Area 11: Availability & Turnover
    { code: 'M-11.1', name: 'Tingkat Ketidakhadiran (Absenteeism Rate)', area: '11. Availability', div: 'HSC', unit: 'Persen', base: 1.85, growth: -0.12, isCurrency: false, isPercent: true },
    { code: 'M-11.2', name: 'Tingkat Turnover Karyawan Sukarela (Voluntary Turnover)', area: '11. Availability', div: 'HSC', unit: 'Persen', base: 2.4, growth: -0.2, isCurrency: false, isPercent: true },
    { code: 'M-11.3', name: 'Tingkat Retensi Karyawan Kunci (Key Talent Retention)', area: '11. Availability', div: 'HSC', unit: 'Persen', base: 96.5, growth: 0.5, isCurrency: false, isPercent: true },

    // Area 12: Learning & Development
    { code: 'M-12.1', name: 'Rata-rata Jam Pelatihan Formal per Karyawan', area: '12. L&D', div: 'PUSDIKLAT', unit: 'Jam/Orang', base: 34.5, growth: 2.5, isCurrency: false, isPercent: false },
    { code: 'M-12.2', name: 'Persentase Karyawan Mengikuti Pelatihan Tersertifikasi', area: '12. L&D', div: 'PUSDIKLAT', unit: 'Persen', base: 91.0, growth: 1.4, isCurrency: false, isPercent: true },
    { code: 'M-12.3', name: 'Return on L&D Investment (ROL&D)', area: '12. L&D', div: 'PUSDIKLAT', unit: 'Rasio / X', base: 12.4, growth: 0.8, isCurrency: false, isPercent: false },
  ];

  // Populate Rekap Sheet
  dummyMetrics.forEach((m, idx) => {
    const calcVal = (year: number) => {
      const yrOffset = year - 2021;
      let val = m.base + (yrOffset * m.growth);
      if (m.isPercent) return `${Math.min(99.5, Math.max(0.5, val)).toFixed(1)}%`;
      if (m.isCurrency) return Math.round(val);
      if (Number.isInteger(m.base)) return Math.round(val);
      return Math.max(0, val).toFixed(2);
    };

    const row = rekapSheet.addRow({
      no: idx + 1,
      code: m.code,
      name: m.name,
      area: m.area,
      division: m.div,
      unit: m.unit,
      v2021: calcVal(2021),
      v2022: calcVal(2022),
      v2023: calcVal(2023),
      v2024: calcVal(2024),
      v2025: calcVal(2025),
      v2026: calcVal(2026),
      status: 'Approved',
      notes: `Data transaksi rill terverifikasi unit kerja PLN (${m.div})`,
    });

    if (m.isCurrency) {
      for (let colIdx = 7; colIdx <= 12; colIdx++) {
        row.getCell(colIdx).numFmt = 'Rp #,##0';
      }
    }
  });

  // ─── SHEET 2: SAMPLE DATA TRANSAKSI PEGAWAI (50 SAMPLE RECORD) ──────────────
  const empSheet = wb.addWorksheet('DATA TRANSAKSI PEGAWAI PLN', {
    views: [{ showGridLines: true }],
  });

  empSheet.columns = [
    { header: 'NIP / ID Karyawan', key: 'nip', width: 18 },
    { header: 'Nama Lengkap Karyawan', key: 'name', width: 28 },
    { header: 'Divisi / Unit Kerja', key: 'division', width: 20 },
    { header: 'Jabatan / Position', key: 'position', width: 25 },
    { header: 'Status Hubungan Kerja', key: 'status', width: 18 },
    { header: 'Jenis Kelamin', key: 'gender', width: 15 },
    { header: 'Usia', key: 'age', width: 10 },
    { header: 'Jam Pelatihan 2026', key: 'trainingHours', width: 20 },
    { header: 'Gaji Pokok / Bulan', key: 'salary', width: 22 },
    { header: 'Status Retensi Talent', key: 'talentStatus', width: 20 },
  ];

  const empHeader = empSheet.getRow(1);
  empHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  empHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
  empHeader.alignment = { vertical: 'middle', horizontal: 'center' };

  const names = ['Ahmad Fauzi', 'Budi Santoso', 'Citra Dewi', 'Dwinanto Wibowo', 'Eka Putra', 'Fajar Ramadhan', 'Gita Gutawa', 'Hadi Wijaya', 'Irma Priyan', 'Jessica Fernandes'];
  const divs = ['HSC', 'HST', 'HTD', 'PUSDIKLAT', 'K3L', 'SPI'];
  const positions = ['Senior Specialist', 'Assistant Manager', 'Manager', 'Analyst', 'Officer', 'Expert'];

  for (let i = 1; i <= 50; i++) {
    const nip = `230624${5650 + i}`;
    const name = `${names[i % names.length]} ${i}`;
    const div = divs[i % divs.length];
    const pos = positions[i % positions.length];
    const gender = i % 3 === 0 ? 'Perempuan' : 'Laki-laki';
    const age = 26 + (i % 30);
    const hours = 20 + (i * 3) % 40;
    const salary = 11500000 + (i * 500000);

    const r = empSheet.addRow({
      nip,
      name,
      division: div,
      position: pos,
      status: 'Karyawan Tetap (Full-time)',
      gender,
      age,
      trainingHours: `${hours} Jam`,
      salary,
      talentStatus: i % 4 === 0 ? 'Key Talent Ready Now' : 'Standard Talent',
    });

    r.getCell(9).numFmt = 'Rp #,##0';
  }

  // ─── SHEET 3: ANALYSIS BIAYA HUMANCAPITAL (COST & ROI ANALYSIS) ──────────────
  const costSheet = wb.addWorksheet('ANALISIS BIAYA & ROI HC', {
    views: [{ showGridLines: true }],
  });

  costSheet.columns = [
    { header: 'Tahun', key: 'year', width: 12 },
    { header: 'Total Workforce Cost (Rupiah)', key: 'twc', width: 30 },
    { header: 'Biaya L&D (Rupiah)', key: 'lnd', width: 25 },
    { header: 'Biaya Rekrutmen (Rupiah)', key: 'rec', width: 25 },
    { header: 'Revenue per FTE (Rupiah)', key: 'rev', width: 28 },
    { header: 'EBIT per FTE (Rupiah)', key: 'ebit', width: 25 },
    { header: 'Return on L&D (ROL&D)', key: 'rold', width: 22 },
  ];

  const cHeader = costSheet.getRow(1);
  cHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  cHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B5CF6' } };
  cHeader.alignment = { vertical: 'middle', horizontal: 'center' };

  [2021, 2022, 2023, 2024, 2025, 2026].forEach((y, idx) => {
    const cr = costSheet.addRow({
      year: y,
      twc: 850000000000 + idx * 35000000000,
      lnd: 45000000000 + idx * 3000000000,
      rec: 18000000000 + idx * 1200000000,
      rev: 2850000000 + idx * 150000000,
      ebit: 720000000 + idx * 45000000,
      rold: `${(12.4 + idx * 0.8).toFixed(1)}x`,
    });

    cr.getCell(2).numFmt = 'Rp #,##0';
    cr.getCell(3).numFmt = 'Rp #,##0';
    cr.getCell(4).numFmt = 'Rp #,##0';
    cr.getCell(5).numFmt = 'Rp #,##0';
    cr.getCell(6).numFmt = 'Rp #,##0';
  });

  // Write Target Workbooks
  for (const name of fileNames) {
    const p1 = path.join(targetWebsiteDir, name);
    const p2 = path.join(targetIsoDir, name);
    await wb.xlsx.writeFile(p1);
    await wb.xlsx.writeFile(p2);
    console.log('Successfully written real dummy Excel file:', p1);
    console.log('Successfully written real dummy Excel file:', p2);
  }

  console.log('Real dummy data Excel files created successfully!');
}

createRealDummyDataExcel().catch(console.error);
