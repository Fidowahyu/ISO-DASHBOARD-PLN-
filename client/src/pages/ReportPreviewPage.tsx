import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Award,
  Users,
  Clock,
  CheckSquare,
  AlertCircle,
  BarChart3,
  HelpCircle,
  BookOpen,
  Target,
  Zap,
  TrendingUp,
  Info,
  ChevronRight,
} from '@/components/ui/icons';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
} from 'recharts';
import { getReportPreview, getReportSnapshot, createReport, generateReport, type ReportSnapshot } from '@/lib/api';
import { MATURITY_LEVEL_CRITERIA, AREA_RECOMMENDATIONS } from '@/data/report-data';

export function ReportPreviewPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<ReportSnapshot | null>(null);
  const [, setReportId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busyFormat, setBusyFormat] = useState<'PDF' | 'EXCEL' | null>(null);
  const [activeTab, setActiveTab] = useState<'spider' | 'area-conclusions' | 'criteria' | 'area-descriptions' | 'roadmap' | 'metrics'>('spider');

  useEffect(() => {
    const reportIdParam = params.get('id');
    const load = reportIdParam
      ? getReportSnapshot(reportIdParam)
      : getReportPreview({
          year: Number(params.get('year') ?? 2026),
          period: params.get('period') ?? 'Annual',
          isoAreaId: params.get('isoAreaId') ?? undefined,
          divisionId: params.get('divisionId') ?? undefined,
        });

    load.then(setSnapshot).catch(value => setError(value instanceof Error ? value.message : 'Tidak ada data untuk laporan ini.'));
  }, [params]);

  async function generate(format: 'PDF' | 'EXCEL' | 'BOTH') {
    if (!snapshot) return;
    setBusyFormat(format === 'BOTH' ? 'PDF' : format);
    try {
      const created = await createReport(snapshot.filters);
      setReportId(created.id);
      await generateReport(created.id, format);
      setMessage(`Laporan ISO 30414 (${format}) berhasil dibuat dari data Excel terbaru! Silakan unduh melalui Riwayat Laporan.`);
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Gagal membuat file laporan.');
    } finally {
      setBusyFormat(null);
    }
  }

  if (error && !snapshot) {
    return (
      <Card className="glass-card border-slate-800">
        <CardContent className="p-12 text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-100">Data Laporan Tidak Tersedia</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">{error}</p>
          <Button variant="outline" className="mt-2 border-slate-700 text-slate-300 hover:bg-slate-800 text-xs" onClick={() => navigate('/reports')}>
            <ArrowRight className="mr-2 h-4 w-4" /> Kembali ke Daftar Laporan
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!snapshot) {
    return (
      <div className="flex items-center justify-center p-16 text-slate-400 gap-3 text-sm">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        Memuat Laporan Penilaian ISO 30414...
      </div>
    );
  }

  // ─── DYNAMIC AUDIT DATA CALCULATION FROM IMPORTED SNAPSHOT ─────────
  const periodLabel = snapshot.period?.label ?? '2026 Annual';
  const areas = Array.isArray(snapshot.areas) ? snapshot.areas : [];
  const metrics = Array.isArray(snapshot.metrics) ? snapshot.metrics : [];
  const totalMetricsCount = snapshot.totalMetrics ?? metrics.length ?? 0;
  const approvedMetricsCount = snapshot.approvedMetrics ?? 0;

  const completionPct = snapshot.completion != null
    ? Number(snapshot.completion)
    : (totalMetricsCount > 0 ? Math.round((approvedMetricsCount / totalMetricsCount) * 100) : 52.4);

  const overallScore = snapshot.quality?.overall != null
    ? Number(snapshot.quality.overall)
    : completionPct;

  const overallLevel = Number((1.0 + (Math.max(0, Math.min(100, overallScore)) / 100) * 4.0).toFixed(1));
  const minTargetLevel = 3.0;
  const gapLevel = Number((overallLevel - minTargetLevel).toFixed(1));

  const overallGrade = overallScore >= 90 ? 'Grade A'
    : overallScore >= 75 ? 'Grade B'
    : overallScore >= 60 ? 'Grade C'
    : overallScore >= 40 ? 'Grade D'
    : 'Grade F';

  const overallGradeText = overallScore >= 90 ? 'Unggul (World Class)'
    : overallScore >= 75 ? 'Tinggi (Terintegrasi)'
    : overallScore >= 60 ? 'Memenuhi Standar Minimal'
    : overallScore >= 40 ? 'Terbatas (Di Bawah Standar)'
    : 'Kritis (High Risk Audit)';

  // Spider / Radar Chart Data mapped dynamically from snapshot.areas
  const radarChartData = areas.map((area, idx) => {
    const areaScore = area.quality != null ? Number(area.quality) : (area.completion != null ? Number(area.completion) : 50.0);
    const areaLevel = Number((1.0 + (Math.max(0, Math.min(100, areaScore)) / 100) * 4.0).toFixed(1));
    const areaNameStr = area.name ?? `Area ${idx + 1}`;
    const meta = AREA_RECOMMENDATIONS.find(r => r.areaName.toLowerCase().includes(areaNameStr.toLowerCase()) || r.areaNumber === idx + 1);

    return {
      areaName: meta?.shortName || areaNameStr.split(' ')[0] || `Area ${idx + 1}`,
      fullName: areaNameStr,
      aktual: areaLevel,
      targetMinimal: 3.0,
      scorePct: Number(areaScore.toFixed(1)),
      approvedMetrics: area.approvedMetrics ?? 0,
      totalMetrics: area.totalMetrics ?? 0,
      risk: areaLevel < 2.0 ? 'CRITICAL RISK' : areaLevel < 3.0 ? 'HIGH RISK' : areaLevel < 4.0 ? 'MEDIUM RISK' : 'COMPLIANT',
    };
  });

  // Dynamic Area Conclusions & Recommendations mapped from snapshot.areas
  const dynamicAreaConclusions = areas.map((area, idx) => {
    const areaScore = area.quality != null ? Number(area.quality) : (area.completion != null ? Number(area.completion) : 50.0);
    const areaLevel = Number((1.0 + (Math.max(0, Math.min(100, areaScore)) / 100) * 4.0).toFixed(1));
    const isBelow = areaLevel < 3.0;
    const areaNameStr = area.name ?? `Area ${idx + 1}`;
    const meta = AREA_RECOMMENDATIONS.find(r => r.areaName.toLowerCase().includes(areaNameStr.toLowerCase()) || r.areaNumber === idx + 1);

    const approved = area.approvedMetrics ?? 0;
    const total = area.totalMetrics ?? 0;

    return {
      no: idx + 1,
      name: areaNameStr,
      scope: meta?.scope || `Metrik & Tata Kelola ${areaNameStr}`,
      description: meta?.description || `Pengukuran pilar ${areaNameStr}.`,
      level: areaLevel,
      scorePct: Number(areaScore.toFixed(1)),
      approvedCount: approved,
      totalCount: total,
      risk: areaLevel < 2.0 ? 'CRITICAL RISK' : areaLevel < 3.0 ? 'HIGH RISK' : areaLevel < 4.0 ? 'MEDIUM RISK' : 'COMPLIANT',
      finding: isBelow
        ? `[HIGH RISK FINDING] Ditemukan ketidaklengkapan data pada ${total - approved} metrik di area ini dengan skor kematangan Level ${areaLevel} (${areaScore.toFixed(1)}%).`
        : `[COMPLIANT FINDING] Area ini telah terisi ${approved} dari ${total} metrik dengan tingkat kematangan Level ${areaLevel} (${areaScore.toFixed(1)}%).`,
      conclusion: isBelow
        ? `Area ${areaNameStr} mencapai tingkat kematangan Level ${areaLevel} (${areaScore.toFixed(1)}%), berada di bawah Batas Minimum Standarisasi ISO (Level 3.0). Terisi ${approved} dari ${total} metrik.`
        : `Area ${areaNameStr} telah mencapai tingkat kematangan Level ${areaLevel} (${areaScore.toFixed(1)}%), memenuhi standar kelayakan audit ISO 30414 (${approved}/${total} metrik terisi).`,
      recommendation: isBelow
        ? `Lengkapi pengisian ${Math.max(0, total - approved)} metrik yang tersisa di Area ${areaNameStr}, lakukan validasi akurasi formula, dan perbaiki tata kelola pengumpulan data.`
        : `Pertahankan efektivitas tata kelola data di Area ${areaNameStr} dan tingkatkan otomatisasi integrasi data.`,
      impact: isBelow
        ? `Meningkatkan skor kematangan Area ${areaNameStr} menuju ambang batas kelayakan audit ISO 30414 (Level 3.0).`
        : `Menjaga konsistensi kepatuhan audit ISO 30414 secara berkelanjutan.`,
      timeline: isBelow ? 'Bulan 1 - 3' : 'Rutin / Berkelanjutan',
    };
  });

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 pb-20 max-w-7xl mx-auto">
      {/* Executive Page Breadcrumb & Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Laporan</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-slate-200 font-medium">Audit ISO 30414</span>
            <Badge variant="outline" className="ml-2 border-blue-500/30 text-blue-400 bg-blue-500/10 text-[10px] font-semibold px-2 py-0.5">
              Audited Dataset • {periodLabel}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
            Laporan Penilaian Audit ISO 30414
          </h1>
          <p className="text-xs text-slate-400">
            Hasil pengukuran kematangan tata kelola Human Capital berdasarkan data Excel yang ter-import ({approvedMetricsCount} dari {totalMetricsCount} metrik terproses).
          </p>
        </div>

        {/* Action Button Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            disabled={busyFormat === 'PDF'}
            onClick={() => generate('PDF')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 h-9 shadow-md shadow-blue-600/20 rounded-lg transition-all"
          >
            <FileText className="mr-2 h-4 w-4" />
            {busyFormat === 'PDF' ? 'Memproses PDF...' : 'Unduh Laporan PDF'}
          </Button>
          <Button
            disabled={busyFormat === 'EXCEL'}
            onClick={() => generate('EXCEL')}
            variant="outline"
            className="border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 text-xs font-medium px-4 h-9 rounded-lg"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-400" />
            {busyFormat === 'EXCEL' ? 'Memproses Excel...' : 'Unduh Excel Audit'}
          </Button>
        </div>
      </div>

      {message && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-xs text-emerald-300 shadow-sm print:hidden">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            {message}
          </span>
          <Button size="sm" variant="outline" onClick={() => navigate('/reports/history')} className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40 text-[11px]">
            Lihat Riwayat Laporan <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      )}

      {/* EXECUTIVE SCORE OVERVIEW CARDS (4-GRID) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Score & Grade Overall */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-sm rounded-xl">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Hasil Penilaian Overall</span>
              <Award className={`h-4 w-4 ${overallScore >= 60 ? 'text-emerald-400' : overallScore >= 40 ? 'text-amber-400' : 'text-red-400'}`} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold tracking-tight text-slate-100">Level {overallLevel}</span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
              <Badge variant={overallScore >= 60 ? 'secondary' : 'destructive'} className="text-[10px] font-bold px-1.5 py-0">
                {overallGrade}
              </Badge>
              <span className="text-slate-300 font-medium">{overallGradeText}</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Standar Minimal ISO Target */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-sm rounded-xl">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Standar Minimal ISO</span>
              <Target className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold tracking-tight text-emerald-400">Level 3.0</span>
              <span className="text-xs text-slate-400">(65.0%)</span>
            </div>
            <div className="pt-1 border-t border-slate-800/60 text-[11px] text-slate-400 font-medium">
              Standardized Baseline Target
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Defisit Gap */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-sm rounded-xl">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Defisit Performa (Gap)</span>
              <TrendingUp className={`h-4 w-4 ${gapLevel >= 0 ? 'text-emerald-400' : 'text-amber-400'}`} />
            </div>
            <div className={`text-3xl font-extrabold tracking-tight ${gapLevel >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {gapLevel >= 0 ? `+${gapLevel}` : gapLevel} Level
            </div>
            <div className="pt-1 border-t border-slate-800/60 text-[11px] text-slate-400 font-medium">
              {gapLevel >= 0 ? 'Memenuhi ambang batas kelayakan' : 'Di bawah ambang batas minimal ISO'}
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Keterisian Data Metrik */}
        <Card className="bg-slate-900/70 border-slate-800/80 shadow-sm rounded-xl">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Keterisian Metrik Data</span>
              <CheckSquare className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-blue-400">{completionPct}%</div>
            <div className="pt-1 border-t border-slate-800/60 text-[11px] text-slate-400 font-medium">
              {approvedMetricsCount} dari {totalMetricsCount} Metrik Terproses Data
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Senior Executive Notice Banner */}
      <div className="rounded-xl border border-l-4 border-l-blue-500 border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-300 flex items-start gap-3 shadow-sm">
        <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-200 text-xs tracking-wide">
            RINGKASAN HASIL AUDIT DOKUMEN ISO 30414 ({periodLabel.toUpperCase()})
          </p>
          <p className="leading-relaxed text-slate-400">
            Hasil evaluasi tata kelola SDM menunjukkan tingkat kematangan di <strong>Level {overallLevel} / 5.0 ({overallScore.toFixed(1)}%)</strong> dengan kualifikasi <strong>{overallGrade} ({overallGradeText})</strong>. Total <strong>{approvedMetricsCount} dari {totalMetricsCount} metrik</strong> telah dianalisis. Gunakan tab navigasi di bawah untuk meninjau grafik radar per area, kesimpulan audit, dan rekomendasi aksi strategis.
          </p>
        </div>
      </div>

      {/* SEGMENTED TAB NAVIGATION BAR */}
      <div className="p-1 rounded-xl bg-slate-900/90 border border-slate-800 flex gap-1 overflow-x-auto print:hidden shadow-sm">
        <button
          onClick={() => setActiveTab('spider')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'spider' ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5 text-blue-400" /> Spider Chart & Performa Area
        </button>

        <button
          onClick={() => setActiveTab('area-conclusions')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'area-conclusions' ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Zap className="h-3.5 w-3.5 text-amber-400" /> Kesimpulan & Rekomendasi per Area
        </button>

        <button
          onClick={() => setActiveTab('criteria')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'criteria' ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5 text-emerald-400" /> Kriteria Skala Level (1 - 5)
        </button>

        <button
          onClick={() => setActiveTab('area-descriptions')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'area-descriptions' ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5 text-purple-400" /> Katalog 12 Area ISO
        </button>

        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'roadmap' ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Clock className="h-3.5 w-3.5 text-indigo-400" /> Roadmap Peningkatan
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'metrics' ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Users className="h-3.5 w-3.5 text-slate-400" /> Detail Metrik Audited ({metrics.length})
        </button>
      </div>

      {/* ─── TAB 1: SPIDER / RADAR CHART & AREA PERFORMANCE ─────────────── */}
      {activeTab === 'spider' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Radar Chart Container */}
          <Card className="bg-slate-900/60 border-slate-800 lg:col-span-7 rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px] font-semibold">
                  Standard Baseline: Level 3.0 (65.0%)
                </Badge>
                <span className="text-[11px] text-slate-400 font-medium">Radar Chart 12 Aksis</span>
              </div>
              <CardTitle className="text-base font-bold text-slate-100 mt-1">
                Spider Chart: Skor Performa per Area vs Target Minimal
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Membandingkan Nilai Kematangan Aktual per Area (Area Biru) terhadap Batas Minimum Standarisasi ISO 30414 (Garis Hijau Putus-putus Level 3.0).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[370px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="areaName" tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: '600' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Radar
                      name="Hasil Penilaian Aktual (Score)"
                      dataKey="aktual"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Batas Minimum ISO Target (Level 3.0)"
                      dataKey="targetMinimal"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.08}
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.[0]) return null;
                        const data = payload[0].payload as (typeof radarChartData)[0];
                        return (
                          <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-lg space-y-1 text-xs">
                            <p className="font-bold text-slate-100">{data.fullName}</p>
                            <div className="flex items-center justify-between gap-4 text-blue-400 font-medium">
                              <span>Nilai Aktual:</span>
                              <span>Level {data.aktual} / 5.0 ({data.scorePct}%)</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-emerald-400 font-medium">
                              <span>Target Minimal:</span>
                              <span>Level {data.targetMinimal} / 5.0 (65.0%)</span>
                            </div>
                            <div className="pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                              Metrik Terisi: {data.approvedMetrics} / {data.totalMetrics} ({data.risk})
                            </div>
                          </div>
                        );
                      }}
                    />
                    <RechartsLegend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Area Score Breakdown List */}
          <Card className="bg-slate-900/60 border-slate-800 lg:col-span-5 rounded-xl shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-100">
                Skor Kematangan & Progress Area
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Rincian nilai level kematangan aktual dan gap terhadap ambang batas minimal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[370px] overflow-y-auto pr-1">
              {radarChartData.map((area, idx) => {
                const isBelowMin = area.aktual < area.targetMinimal;
                return (
                  <div key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">
                        {idx + 1}. {area.fullName}
                      </span>
                      <Badge
                        variant={area.risk === 'CRITICAL RISK' || area.risk === 'HIGH RISK' ? 'destructive' : 'secondary'}
                        className="text-[10px] font-bold px-1.5 py-0"
                      >
                        {area.risk}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Nilai: <strong className="text-blue-400">Level {area.aktual}</strong> ({area.scorePct}%)</span>
                      <span className="text-emerald-400 font-medium">Target: Level 3.0</span>
                    </div>
                    {/* Visual Progress Bar Gauge */}
                    <div className="w-full h-1.5 rounded-full bg-slate-800 relative overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isBelowMin ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${(area.aktual / 5) * 100}%` }}
                      />
                      <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 left-[60%]" title="Target Minimal (60%)" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── TAB 2: KESIMPULAN & REKOMENDASI PER AREA (12 AREA) ──────────── */}
      {activeTab === 'area-conclusions' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-100">Kesimpulan Audit & Rekomendasi Per Area ({dynamicAreaConclusions.length} Area ISO)</h2>
            <p className="text-xs text-slate-400">
              Analisis temuan audit dan langkah rekomendasi aksi strategis yang dikelompokkan secara terstruktur per area ISO 30414.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dynamicAreaConclusions.map(area => (
              <Card key={area.no} className="bg-slate-900/60 border-slate-800 rounded-xl shadow-sm flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-slate-700 text-slate-300 text-[10px] font-semibold">
                      Area ISO #{area.no}
                    </Badge>
                    <Badge
                      variant={area.risk === 'CRITICAL RISK' || area.risk === 'HIGH RISK' ? 'destructive' : 'secondary'}
                      className="text-[10px] font-bold uppercase"
                    >
                      {area.risk}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-slate-100 mt-2">
                    {area.no}. {area.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Scope: {area.scope}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs pt-1">
                  {/* Score Pill */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                    <span className="text-blue-400 font-semibold text-[11px]">Skor Level: {area.level} / 5.0 ({area.scorePct}%)</span>
                    <span className="text-emerald-400 font-medium text-[11px]">Target Minimal: Level 3.0</span>
                  </div>

                  {/* Temuan Audit Box */}
                  <div className="space-y-1">
                    <span className="font-semibold text-amber-400 block text-[11px]">Temuan Audit (Audit Finding):</span>
                    <p className="text-slate-300 leading-relaxed bg-amber-950/20 p-2.5 rounded-lg border border-amber-500/20">
                      {area.finding}
                    </p>
                  </div>

                  {/* Kesimpulan Audit Box */}
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-300 block text-[11px]">Kesimpulan Penilaian Audit:</span>
                    <p className="text-slate-400 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                      {area.conclusion}
                    </p>
                  </div>

                  {/* Rekomendasi Box */}
                  <div className="space-y-1">
                    <span className="font-semibold text-emerald-400 block text-[11px]">Rekomendasi Aksi Strategis:</span>
                    <p className="text-slate-300 leading-relaxed bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20">
                      {area.recommendation}
                    </p>
                  </div>

                  {/* Impact & Timeline */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                    <span className="text-slate-400">Dampak: <strong className="text-slate-200">{area.impact}</strong></span>
                    <span className="font-semibold text-blue-400 shrink-0 ml-2">{area.timeline}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: KRITERIA SKALA LEVEL 1-5 ─────────────────────────────── */}
      {activeTab === 'criteria' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-100">Standardisasi Skala Kematangan Tata Kelola ISO 30414 (Level 1 - 5)</h2>
              <p className="text-xs text-slate-400">
                Penjelasan masing-masing tingkat pencapaian penilaian audit dari Level 1 (Reaktif) hingga Level 5 (Optimized Global Class).
              </p>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-medium text-xs w-fit">
              Minimum Standard Target: Level 3.0
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MATURITY_LEVEL_CRITERIA.map(crit => (
              <Card
                key={crit.level}
                className={`bg-slate-900/60 border rounded-xl relative flex flex-col justify-between transition-all ${
                  crit.isMinimumStandard
                    ? 'border-emerald-500/60 bg-emerald-950/20 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500/40'
                    : 'border-slate-800'
                }`}
              >
                {crit.isMinimumStandard && (
                  <div className="absolute -top-3 left-4 bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Target className="h-3 w-3" /> BATAS MINIMUM STANDARISASI
                  </div>
                )}
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-slate-100">Level {crit.level}.0</span>
                    <Badge variant="outline" className={`text-xs font-semibold ${crit.colorClass}`}>
                      {crit.badge} ({crit.rangePct})
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-200 mt-2">{crit.title}</CardTitle>
                  <p className={`text-[11px] font-medium mt-0.5 ${crit.isMinimumStandard ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {crit.statusText}
                  </p>
                </CardHeader>
                <CardContent className="text-xs text-slate-400 leading-relaxed pt-2">
                  <p className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300">
                    {crit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: KATALOG 12 AREA ISO 30414 ───────────────────────────── */}
      {activeTab === 'area-descriptions' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-100">Katalog Penjelasan 12 Area Standar ISO 30414</h2>
            <p className="text-xs text-slate-400">
              Penjelasan kerangka kerja, definisi pilar standar, dan fokus ruang lingkup pengukuran masing-masing area.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dynamicAreaConclusions.map(area => (
              <Card key={area.no} className="bg-slate-900/60 border-slate-800 rounded-xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px] font-semibold">
                      ISO AREA 0{area.no}
                    </Badge>
                    <span className="text-[11px] text-slate-400 font-medium">{area.totalCount} Metrik</span>
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-100 mt-2">
                    {area.no}. {area.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <p className="text-slate-400 leading-relaxed">
                    {area.description}
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-blue-400 font-medium">
                    Fokus Pengukuran: {area.scope}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 5: ROADMAP PENINGKATAN TATA KELOLA ───────────────────────── */}
      {activeTab === 'roadmap' && (
        <Card className="bg-slate-900/60 border-slate-800 rounded-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-100">Roadmap Peningkatan & Pemenuhan Standar ISO 30414</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Tahapan eksekusi peningkatan kualitas data dan pemenuhan ambang batas minimum (Level 3.0) dalam 3 fase strategis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white text-[10px] font-bold">FASE 01</Badge>
                  <h3 className="font-bold text-slate-100 text-sm">Fase 1: Keterisian & Akselerasi Data Quality (Bulan 1 - 3)</h3>
                </div>
                <p className="text-xs text-slate-400">Fokus pada penyelesaian pengisian data untuk {totalMetricsCount - approvedMetricsCount} metrik yang tersisa dan penegakan validasi formula.</p>
              </div>
              <Badge variant="secondary" className="w-fit text-xs px-3 py-1 font-semibold">IN PROGRESS</Badge>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 text-white text-[10px] font-bold">FASE 02</Badge>
                  <h3 className="font-bold text-slate-100 text-sm">Fase 2: Pemenuhan Batas Minimum ISO Baseline (Bulan 4 - 8)</h3>
                </div>
                <p className="text-xs text-slate-400">Meningkatkan tingkat kematangan area yang masih di bawah Level 3.0 menuju ambang batas kelayakan audit internasional.</p>
              </div>
              <Badge variant="secondary" className="w-fit text-xs px-3 py-1 font-semibold">PLANNED</Badge>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-600 text-white text-[10px] font-bold">FASE 03</Badge>
                  <h3 className="font-bold text-slate-100 text-sm">Fase 3: Sertifikasi & Continuous Improvement (Bulan 9 - 12)</h3>
                </div>
                <p className="text-xs text-slate-400">Audit sertifikasi ulang ISO 30414 dan otomatisasi integrasi data master karyawan terkelola.</p>
              </div>
              <Badge variant="secondary" className="w-fit text-xs px-3 py-1 font-semibold">PLANNED</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── TAB 6: DETAIL METRIK AUDITED (IMPORTED METRICS) ──────────────── */}
      {activeTab === 'metrics' && (
        <Card className="bg-slate-900/60 border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <CardHeader className="border-b border-slate-800 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-100">
                Detail Hasil Pengukuran Metrik ISO 30414 ({metrics.length} Metrik)
              </CardTitle>
              <Badge variant="outline" className="text-xs border-slate-700 text-slate-300">{periodLabel}</Badge>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Rincian hasil kalkulasi data metrik yang di-import dari Excel untuk periode pelaporan saat ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[800px] text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 uppercase tracking-wider text-slate-400 font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">ISO Area</th>
                  <th className="px-4 py-3">Nama Metrik</th>
                  <th className="px-4 py-3">Hasil Measurement</th>
                  <th className="px-4 py-3">PIC Responsibel</th>
                  <th className="px-4 py-3">Divisi</th>
                  <th className="px-4 py-3">Status Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {metrics.map(metric => (
                  <tr key={metric.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-medium">{metric.area}</td>
                    <td className="px-4 py-3 font-semibold text-slate-200">{metric.name}</td>
                    <td className="px-4 py-3 font-bold tabular-nums text-blue-400">
                      {metric.result != null ? `${metric.result.toFixed(1)}%` : 'Belum Terisi'}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{metric.pic}</td>
                    <td className="px-4 py-3"><Badge variant="secondary" className="text-[10px] font-medium">{metric.division}</Badge></td>
                    <td className="px-4 py-3">
                      <Badge variant={metric.status === 'Approved' ? 'secondary' : 'outline'} className="text-[10px] font-medium">
                        {metric.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
