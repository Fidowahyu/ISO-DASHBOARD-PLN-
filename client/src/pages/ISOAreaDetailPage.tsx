import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAreaDashboard, type DashboardResponse } from '@/lib/api';
import { AREA_RECOMMENDATIONS, type AreaRecommendation } from '@/data/report-data';

export function ISOAreaDetailPage() {
  const { slug: id = '' } = useParams();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getAreaDashboard(id)
      .then(setDashboard)
      .catch(value => setError(value instanceof Error ? value.message : 'Unable to load ISO area detail.'));
  }, [id]);

  if (error) {
    return (
      <div role="alert" className="rounded-md border border-red-500/50 bg-red-950/40 p-4 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <span>Memuat detail penjelasan ISO Area...</span>
        </div>
      </div>
    );
  }

  const area = dashboard.areas[0];
  if (!area) {
    return (
      <Card className="border-slate-800 bg-slate-950">
        <CardContent className="p-8 text-center text-sm text-slate-400">
          Tidak ada data pelaporan yang tersedia untuk area ISO ini.
        </CardContent>
      </Card>
    );
  }

  // Calculate scores and catalog metadata
  const qualityScore = area.quality ?? area.completion ?? 65.0;
  const areaLevel = Number((1.0 + (Math.max(0, Math.min(100, qualityScore)) / 100) * 4.0).toFixed(1));
  const isBelow = areaLevel < 3.0;

  const rec = AREA_RECOMMENDATIONS.find(
    (r: AreaRecommendation) => r.areaNumber === area.areaNumber || r.areaName.toLowerCase().includes(area.name.toLowerCase()) || area.name.toLowerCase().includes(r.areaName.toLowerCase())
  );

  const scopeText = rec?.scope || `Fokus Pengukuran & Metrik Tata Kelola ${area.name}`;
  const descText = rec?.description || `Pengukuran pilar ${area.name} dilakukan sesuai kriteria standar internasional ISO 30414.`;
  const auditFinding = isBelow
    ? `[HIGH RISK FINDING] Tingkat kematangan area ini (Level ${areaLevel} / 5.0) masih di bawah batas minimum kelayakan audit ISO (Level 3.0). Ditemukan ${area.totalMetrics - area.statusCounts.approved} metrik yang belum terisi penuh atau perlu perbaikan data.`
    : `[COMPLIANT FINDING] Area ini telah mencapai Level ${areaLevel} / 5.0 (${qualityScore.toFixed(1)}%) dan memenuhi standar kelayakan audit ISO 30414. Total ${area.statusCounts.approved} metrik terverifikasi.`;

  const auditAction = isBelow
    ? (rec?.recommendation || `Lengkapi metrik tersisa di area ${area.name}, lakukan validasi akurasi data, dan perbaiki tata kelola pengarsipan.`)
    : `Pertahankan efektivitas tata kelola data di area ${area.name} dan tingkatkan otomatisasi integrasi HRIS.`;

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation Breadcrumb */}
      <div>
        <Link to="/iso-areas" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors">
          ← Kembali ke Katalog ISO Areas
        </Link>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/70 p-6 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-indigo-500/50 bg-indigo-500/10 text-indigo-300">
                Area #{area.areaNumber || 1}
              </Badge>
              <Badge
                variant="outline"
                className={isBelow ? 'border-amber-500/50 bg-amber-500/10 text-amber-300' : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'}
              >
                {isBelow ? 'Di Bawah Ambang Batas Minimal' : 'Memenuhi Standar Minimal ISO'}
              </Badge>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">{area.name}</h2>
            <p className="mt-1 text-xs text-slate-400">Periode Evaluasi Audit: {dashboard.period?.label || '2026 Annual'}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-center backdrop-blur">
              <span className="text-[11px] font-semibold text-slate-400">Nilai Kematangan</span>
              <div className={`text-xl font-black ${isBelow ? 'text-amber-400' : 'text-emerald-400'}`}>
                Level {areaLevel} / 5.0
              </div>
              <span className="text-[10px] text-slate-500">Skor: {qualityScore.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-slate-800 bg-slate-950">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-400">Skor Kematangan Area</p>
            <p className={`mt-1.5 text-2xl font-black ${isBelow ? 'text-amber-400' : 'text-emerald-400'}`}>
              Level {areaLevel}
            </p>
            <span className="text-[11px] text-slate-500">{qualityScore.toFixed(1)}% Kepatuhan</span>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-950">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-400">Total Metrik Audited</p>
            <p className="mt-1.5 text-2xl font-bold text-slate-100">{area.totalMetrics}</p>
            <span className="text-[11px] text-slate-500">Metrik Standar ISO 30414</span>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-950">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-400">Metrik Terverifikasi (Approved)</p>
            <p className="mt-1.5 text-2xl font-bold text-emerald-400">{area.statusCounts.approved}</p>
            <span className="text-[11px] text-slate-500">Dari {area.totalMetrics} Metrik</span>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-950">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-400">Metrik Perlu Perhatian (Issues)</p>
            <p className="mt-1.5 text-2xl font-bold text-amber-400">{area.statusCounts.attention}</p>
            <span className="text-[11px] text-slate-500">Status Draft / Missing</span>
          </CardContent>
        </Card>
      </div>

      {/* Section 1: Standard Explanation & Measurement Scope */}
      <Card className="border-slate-800 bg-slate-950 shadow-lg">
        <CardHeader className="border-b border-slate-800/80 pb-3">
          <CardTitle className="text-sm font-bold text-indigo-300">
            📖 Penjelasan Standar & Fokus Pengukuran Area
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fokus Ruang Lingkup Pengukuran:</span>
            <p className="mt-1 text-sm font-bold text-white bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              {scopeText}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Deskripsi Kerangka Standar ISO 30414:</span>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed bg-slate-900/40 rounded-lg p-3.5 border border-slate-800/60">
              {descText}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Audit Findings & Action Recommendations */}
      <Card className="border-slate-800 bg-slate-950 shadow-lg">
        <CardHeader className="border-b border-slate-800/80 pb-3">
          <CardTitle className="text-sm font-bold text-indigo-300">
            🛡️ Temuan Audit Utama & Rekomendasi Aksi Konsultan
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-5">
          {/* Finding Box */}
          <div className={`rounded-lg border p-4 ${isBelow ? 'border-amber-500/40 bg-amber-950/20' : 'border-emerald-500/40 bg-emerald-950/20'}`}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">• Temuan Audit & Evaluasi:</span>
            <p className={`mt-1.5 text-xs leading-relaxed ${isBelow ? 'text-amber-200 font-medium' : 'text-emerald-200 font-medium'}`}>
              {auditFinding}
            </p>
          </div>

          {/* Action Recommendation Box */}
          <div className="rounded-lg border border-indigo-500/40 bg-indigo-950/20 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">• Rekomendasi Aksi Strategis:</span>
            <p className="mt-1.5 text-xs text-indigo-100 leading-relaxed font-medium">
              {auditAction}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Metrics Table */}
      <Card className="border-slate-800 bg-slate-950 shadow-lg">
        <CardHeader className="border-b border-slate-800/80 pb-3">
          <CardTitle className="text-sm font-bold text-slate-200">
            📊 Detail Metrik Terakreditasi pada Area {area.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3">Nama Metrik Audited</th>
                  <th className="px-5 py-3">Status Submisi</th>
                  <th className="px-5 py-3">Hasil Kalkulasi Aktual</th>
                  <th className="px-5 py-3">Divisi PIC</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {area.metrics?.map(metric => (
                  <tr key={metric.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link className="font-semibold text-slate-200 hover:text-indigo-400 transition-colors text-xs" to={`/metrics/${metric.id}`}>
                        {metric.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant="outline"
                        className={metric.status === 'Approved' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/50 bg-amber-500/10 text-amber-300'}
                      >
                        {metric.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-bold text-indigo-300 tabular-nums">
                      {metric.result == null ? 'Belum Dikalkulasi' : metric.result.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">{metric.pic}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/data-management/input/${metric.id}`}
                        className="inline-flex items-center rounded bg-indigo-600/20 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-600/40 transition-colors"
                      >
                        Input Data
                      </Link>
                    </td>
                  </tr>
                ))}
                {!area.metrics?.length && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-500">
                      Belum ada metrik yang dikonfigurasi pada area ISO ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
