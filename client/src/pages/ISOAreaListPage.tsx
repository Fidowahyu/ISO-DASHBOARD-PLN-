import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAreas, getDashboardSummary, type DashboardResponse, type DashboardArea } from '@/lib/api';
import { AREA_RECOMMENDATIONS, type AreaRecommendation } from '@/data/report-data';
import { DynamicIcon } from '@/components/ui/icons';
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from 'recharts';

const AREA_ICONS: Record<number, string> = {
  1: 'Users',
  2: 'Heart',
  3: 'DollarSign',
  4: 'TrendingUp',
  5: 'ShieldCheck',
  6: 'Award',
  7: 'Scale',
  8: 'UserPlus',
  9: 'ArrowUpDown',
  10: 'GitBranch',
  11: 'Calendar',
  12: 'GraduationCap',
};

export function ISOAreaListPage() {
  const [areas, setAreas] = useState<Array<{ id: string; areaNumber: number; name: string; _count: { metrics: number } }>>([]);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getAreas(), getDashboardSummary()])
      .then(([areaList, dashData]) => {
        setAreas(areaList);
        setDashboard(dashData);
      })
      .catch(value => setError(value instanceof Error ? value.message : 'Unable to load ISO areas.'));
  }, []);

  // Prepare chart dataset for all 12 areas
  const chartData = areas.map(area => {
    const dashArea = dashboard?.areas?.find((a: DashboardArea) => a.name.toLowerCase().includes(area.name.toLowerCase()) || a.areaNumber === area.areaNumber);
    const scorePct = Number((dashArea?.quality ?? dashArea?.completion ?? 65.0).toFixed(1));
    const levelVal = Number((1.0 + (Math.max(0, Math.min(100, scorePct)) / 100) * 4.0).toFixed(1));
    return {
      areaNumber: area.areaNumber,
      shortName: `Area #${area.areaNumber}`,
      name: area.name,
      score: scorePct,
      level: levelVal,
      target: 65.0,
      metricsCount: area._count.metrics,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Title & Banner Header */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 p-6 shadow-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-indigo-500/50 bg-indigo-500/10 text-indigo-300">
                Kerangka Kerja ISO 30414:2018 / 2025
              </Badge>
              <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-300">
                12 Area Akreditasi
              </Badge>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
              Katalog & Penjelasan 12 Area ISO 30414
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-400">
              Panduan terstruktur penjelasan pilar tata kelola, ruang lingkup pengukuran, indikator kinerja utama, serta tingkat kematangan modal manusia untuk setiap area standar ISO 30414.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3.5 text-right backdrop-blur">
            <span className="text-xs font-semibold text-slate-400">Target Baseline Minimal</span>
            <div className="mt-0.5 text-lg font-black text-emerald-400">Level 3.0 / 5.0</div>
            <span className="text-[11px] text-slate-500">65.0% Standard ISO Baseline</span>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-md border border-red-500/50 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Visual Spider Chart Card for All 12 Areas */}
      <Card className="border-slate-800 bg-slate-950 shadow-2xl">
        <CardHeader className="border-b border-slate-800/80 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                🕸️ Spider Web Radar Chart Kematangan 12 Area ISO 30414
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1">
                Diagram jaring laba-laba 360° perbandingan skor kematangan aktual seluruh 12 area modal manusia terhadap target minimal kelayakan audit ISO (Level 3.0 / 65.0%).
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-indigo-500/50 bg-indigo-500/10 text-indigo-300 text-[11px]">
                🟣 Skor Kematangan Aktual
              </Badge>
              <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-300 text-[11px]">
                🟢 Baseline ISO 65%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[440px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="78%" data={chartData}>
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="shortName"
                  tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 700 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  stroke="#334155"
                />
                <Radar
                  name="Skor Kematangan Area (%)"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="#6366f1"
                  fillOpacity={0.45}
                  dot={{ r: 4, fill: '#818cf8', stroke: '#4f46e5' }}
                />
                <Radar
                  name="Target Baseline Minimal ISO (65%)"
                  dataKey="target"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="#10b981"
                  fillOpacity={0.12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                  formatter={(value: any, name: any) => [
                    `${value}% (Level ${(1.0 + (value / 100) * 4.0).toFixed(1)})`,
                    name,
                  ]}
                  labelFormatter={(label: any) => {
                    const item = chartData.find(c => c.shortName === label);
                    return item ? `${item.shortName}: ${item.name}` : label;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Grid 12 ISO Areas Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {areas.map((area) => {
          const rec = AREA_RECOMMENDATIONS.find((r: AreaRecommendation) => r.areaNumber === area.areaNumber);
          const dashArea = dashboard?.areas?.find((a: DashboardArea) => a.name.toLowerCase().includes(area.name.toLowerCase()) || a.areaNumber === area.areaNumber);
          const qualityPct = dashArea?.quality ?? dashArea?.completion ?? 65.0;
          const levelVal = Number((1.0 + (Math.max(0, Math.min(100, qualityPct)) / 100) * 4.0).toFixed(1));
          const isBelow = levelVal < 3.0;

          return (
            <Link key={area.id} to={`/iso-areas/${area.id}`} className="group">
              <Card className="h-full border-slate-800/80 bg-slate-950 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10">
                <CardContent className="flex h-full flex-col justify-between p-5">
                  <div>
                    {/* Header: Area Number & Icon */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20 font-bold">
                          <DynamicIcon name={AREA_ICONS[area.areaNumber] || 'Layers'} className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                            Area #{area.areaNumber}
                          </span>
                          <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                            {area.name}
                          </h3>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={isBelow ? 'border-amber-500/40 bg-amber-950/40 text-amber-300' : 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'}
                      >
                        Level {levelVal}
                      </Badge>
                    </div>

                    {/* Measurement Scope Tag */}
                    <div className="mt-3.5">
                      <span className="text-[11px] font-semibold text-slate-400">Fokus Pengukuran:</span>
                      <p className="text-xs font-medium text-indigo-300/90 mt-0.5">
                        {rec?.scope || `Metrik & Tata Kelola ${area.name}`}
                      </p>
                    </div>

                    {/* Standard Description */}
                    <p className="mt-2.5 text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {rec?.description || `Pengukuran pilar ${area.name} sesuai kriteria standar ISO 30414.`}
                    </p>
                  </div>

                  {/* Footer Metrics & Maturity Bar */}
                  <div className="mt-5 border-t border-slate-800/80 pt-3.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{area._count.metrics} Metrik Audited</span>
                      <span className="font-semibold text-slate-200">{qualityPct.toFixed(1)}% Score</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isBelow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.max(5, Math.min(100, qualityPct))}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-indigo-400 group-hover:text-indigo-300">
                      <span>Lihat Analisis Detail Area</span>
                      <span>→</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
