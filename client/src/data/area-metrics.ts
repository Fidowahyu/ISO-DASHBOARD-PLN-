/**
 * Area-specific metric data — derived from the Excel analysis.
 * Each area's metrics are structured from the actual Excel content.
 * In production this will come from the database API.
 */

export interface AreaMetric {
  id: string;
  number: number;
  name: string;
  type: 'Required' | 'Recommended' | 'N/A';
  status: 'Approved' | 'Pending Review' | 'Draft' | 'Rejected' | 'Submitted';
  pic: string;
  formula: string;
  lastUpdated: string;
}

const AREA_METRICS: Record<string, AreaMetric[]> = {
  'area-01': [
    { id: 'm-01-01', number: 1, name: 'Jumlah Karyawan', type: 'Required', status: 'Approved', pic: 'HSC', formula: 'Karyawan Full-time + Part-time + Sementara/Musiman', lastUpdated: '15 Aug 2026' },
    { id: 'm-01-02', number: 2, name: 'Karyawan Setara Penuh Waktu (FTE)', type: 'Required', status: 'Approved', pic: 'HST', formula: '(Total Jam Kerja Full-time + Part-time) ÷ Jam Kerja Standar Full-time', lastUpdated: '15 Aug 2026' },
    { id: 'm-01-03', number: 3, name: 'Karyawan Full-time', type: 'Recommended', status: 'Approved', pic: 'HSC', formula: 'Jumlah Karyawan Full-time', lastUpdated: '14 Aug 2026' },
    { id: 'm-01-04', number: 4, name: 'Karyawan Part-time', type: 'Recommended', status: 'Approved', pic: 'HSC', formula: 'Jumlah Karyawan Part-time', lastUpdated: '14 Aug 2026' },
    { id: 'm-01-05', number: 5, name: 'Tenaga Kerja Kontingen', type: 'Recommended', status: 'Approved', pic: 'HST', formula: 'Kontraktor Independen + Tenaga Kerja Sementara', lastUpdated: '13 Aug 2026' },
    { id: 'm-01-06', number: 6, name: 'Total Setara Penuh Waktu (TFTE)', type: 'Recommended', status: 'Pending Review', pic: 'HST', formula: 'Total FTE Karyawan + Total FTE Tenaga Kerja Kontingen', lastUpdated: '12 Aug 2026' },
    { id: 'm-01-07', number: 7, name: 'Ketidakhadiran', type: 'N/A', status: 'Draft', pic: '—', formula: 'Dipindahkan ke Area Health Safety', lastUpdated: '—' },
  ],
  'area-02': [
    { id: 'm-02-01', number: 1, name: 'Keberagaman Seluruh Tenaga Kerja', type: 'Required', status: 'Approved', pic: 'HSC', formula: 'Distribusi berdasarkan gender, usia, disabilitas, dan kewarganegaraan', lastUpdated: '14 Aug 2026' },
    { id: 'm-02-02', number: 2, name: 'Keberagaman Berdasarkan Usia', type: 'Recommended', status: 'Approved', pic: 'HSC', formula: 'Distribusi per kelompok usia', lastUpdated: '14 Aug 2026' },
    { id: 'm-02-03', number: 3, name: 'Keberagaman Berdasarkan Gender', type: 'Recommended', status: 'Approved', pic: 'HSC', formula: 'Persentase per gender', lastUpdated: '14 Aug 2026' },
    { id: 'm-02-04', number: 4, name: 'Keberagaman Berdasarkan Disabilitas', type: 'Recommended', status: 'Pending Review', pic: 'HSC', formula: 'Jumlah karyawan disabilitas ÷ Total karyawan', lastUpdated: '13 Aug 2026' },
    { id: 'm-02-05', number: 5, name: 'Keberagaman Tim Kepemimpinan', type: 'Recommended', status: 'Approved', pic: 'HSC', formula: 'Distribusi keberagaman pada level kepemimpinan', lastUpdated: '12 Aug 2026' },
  ],
  'area-03': [
    { id: 'm-03-01', number: 1, name: 'Total Biaya Pembelajaran dan Pengembangan', type: 'Required', status: 'Approved', pic: 'HTD', formula: 'Jumlah seluruh biaya langsung L&D', lastUpdated: '15 Aug 2026' },
    { id: 'm-03-02', number: 2, name: 'Total Biaya Tenaga Kerja', type: 'Required', status: 'Approved', pic: 'HST', formula: 'Gaji + Tunjangan + Pajak + Asuransi', lastUpdated: '14 Aug 2026' },
    { id: 'm-03-03', number: 3, name: 'Total Biaya Karyawan', type: 'Recommended', status: 'Approved', pic: 'HST', formula: 'Biaya TK Internal + Overhead Karyawan', lastUpdated: '14 Aug 2026' },
    { id: 'm-03-04', number: 4, name: 'Total Biaya Tenaga Kerja Eksternal', type: 'Recommended', status: 'Approved', pic: 'HST + HSC', formula: 'Biaya Kontraktor + Agency + Outsourcing', lastUpdated: '13 Aug 2026' },
    { id: 'm-03-05', number: 5, name: 'Total Biaya Rekrutmen', type: 'Recommended', status: 'Pending Review', pic: 'HTD', formula: 'Total seluruh biaya rekrutmen', lastUpdated: '12 Aug 2026' },
    { id: 'm-03-06', number: 6, name: 'Biaya Per Perekrutan', type: 'Recommended', status: 'Approved', pic: 'HTD', formula: 'Total Biaya Rekrutmen ÷ Total New Hires', lastUpdated: '12 Aug 2026' },
    { id: 'm-03-07', number: 7, name: 'Biaya Turnover Tenaga Kerja', type: 'Recommended', status: 'Approved', pic: 'HTD + HSC', formula: 'Biaya Pemisahan + Biaya Penggantian + Biaya Pelatihan', lastUpdated: '11 Aug 2026' },
  ],
  'area-04': [
    { id: 'm-04-01', number: 1, name: 'Perputaran Keuangan per FTE', type: 'Required', status: 'Approved', pic: 'HST', formula: 'Revenue ÷ Total FTE', lastUpdated: '15 Aug 2026' },
    { id: 'm-04-02', number: 2, name: 'EBIT per FTE', type: 'Required', status: 'Approved', pic: 'HST', formula: 'EBIT ÷ Total FTE', lastUpdated: '14 Aug 2026' },
    { id: 'm-04-03', number: 3, name: 'ROI Human Capital (HCROI)', type: 'Required', status: 'Pending Review', pic: 'HST', formula: '(Revenue - OpEx + Total Labor Cost) ÷ Total Labor Cost', lastUpdated: '13 Aug 2026' },
    { id: 'm-04-04', number: 4, name: 'Total Biaya TK per Total Biaya Operasional', type: 'Recommended', status: 'Draft', pic: 'HST', formula: 'Total Biaya TK ÷ Total OpEx × 100%', lastUpdated: '10 Aug 2026' },
  ],
  'area-05': [
    { id: 'm-05-01', number: 1, name: 'Jumlah dan Tingkat Kecelakaan Kerja', type: 'Required', status: 'Approved', pic: 'K3L', formula: 'Total Kecelakaan ÷ Total Jam Kerja × 1.000.000', lastUpdated: '15 Aug 2026' },
    { id: 'm-05-02', number: 2, name: 'Jumlah dan Tingkat Kematian Saat Bekerja', type: 'Required', status: 'Approved', pic: 'K3L', formula: 'Total Kematian ÷ Total Jam Kerja × 1.000.000', lastUpdated: '15 Aug 2026' },
    { id: 'm-05-03', number: 3, name: 'Waktu Kerja yang Hilang Akibat Cedera/Penyakit', type: 'Recommended', status: 'Approved', pic: 'K3L', formula: 'Total Hari Hilang ÷ Total Hari Kerja × 100%', lastUpdated: '14 Aug 2026' },
    { id: 'm-05-04', number: 4, name: 'Ketidakhadiran yang Tidak Terencana', type: 'Recommended', status: 'Approved', pic: 'K3L', formula: 'Total Hari Absen ÷ (Total Hari Kerja × Jumlah Karyawan) × 100%', lastUpdated: '14 Aug 2026' },
    { id: 'm-05-05', number: 5, name: 'Persentase TK Ikut Pelatihan Well-being', type: 'Recommended', status: 'Approved', pic: 'PUSDIKLAT', formula: 'TK Ikut Pelatihan ÷ Total TK × 100%', lastUpdated: '13 Aug 2026' },
  ],
  'area-06': [
    { id: 'm-06-01', number: 1, name: 'Keterlibatan Karyawan', type: 'Recommended', status: 'Approved', pic: 'HST', formula: 'Skor survei engagement', lastUpdated: '14 Aug 2026' },
    { id: 'm-06-02', number: 2, name: 'Rata-Rata Masa Kerja', type: 'Recommended', status: 'Approved', pic: 'HSC', formula: 'Total Masa Kerja ÷ Total Karyawan', lastUpdated: '14 Aug 2026' },
    { id: 'm-06-03', number: 3, name: 'Tingkat Keluarnya Karyawan Tahun Pertama (TML)', type: 'Recommended', status: 'Approved', pic: 'HSC', formula: 'Karyawan Keluar di Tahun 1 ÷ Total New Hire × 100%', lastUpdated: '13 Aug 2026' },
    { id: 'm-06-04', number: 4, name: 'Skor Net Promoter Karyawan (eNPS)', type: 'Recommended', status: 'Pending Review', pic: 'HST', formula: '% Promoter - % Detractor', lastUpdated: '12 Aug 2026' },
    { id: 'm-06-05', number: 5, name: 'Kepercayaan Terhadap Kepemimpinan', type: 'Recommended', status: 'Approved', pic: 'HST', formula: 'Skor survei kepercayaan kepemimpinan', lastUpdated: '12 Aug 2026' },
    { id: 'm-06-06', number: 6, name: 'Rentang Kendali', type: 'Recommended', status: 'Approved', pic: 'HST', formula: 'Total Karyawan ÷ Total Pemimpin', lastUpdated: '11 Aug 2026' },
  ],
};

/** Fallback: generate placeholder metrics for areas not yet mapped */
function generatePlaceholderMetrics(areaId: string, count: number): AreaMetric[] {
  const statuses: AreaMetric['status'][] = ['Approved', 'Pending Review', 'Draft', 'Submitted'];
  return Array.from({ length: count }, (_, i) => ({
    id: `${areaId}-m-${i + 1}`,
    number: i + 1,
    name: `Metric ${i + 1}`,
    type: i < Math.ceil(count / 3) ? 'Required' as const : 'Recommended' as const,
    status: statuses[i % statuses.length],
    pic: '—',
    formula: '',
    lastUpdated: '—',
  }));
}

export function getAreaMetrics(areaId: string): AreaMetric[] {
  if (AREA_METRICS[areaId]) {
    return AREA_METRICS[areaId];
  }
  // Fallback for areas not yet populated with real data
  const areaNumber = parseInt(areaId.split('-')[1], 10);
  const areaCounts: Record<number, number> = {
    7: 11, 8: 5, 9: 9, 10: 9, 11: 7, 12: 8,
  };
  return generatePlaceholderMetrics(areaId, areaCounts[areaNumber] ?? 5);
}
