import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Database,
  FileWarning,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  Award,
  ArrowRight,
  Filter,
} from '@/components/ui/icons';
import {
  getDashboard,
  getDashboardTrends,
  getDivisions,
  getPIC,
  getReportingPeriods,
  type DashboardResponse,
  type ReportingPeriod,
} from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  Approved: '#10b981',
  Submitted: '#3b82f6',
  UnderReview: '#8b5cf6',
  Draft: '#64748b',
  NeedsRevision: '#f59e0b',
  Rejected: '#ef4444',
};

function MetricStatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorClass = 'text-blue-400 bg-blue-500/10 border-blue-500/20',
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon: typeof Database;
  trend?: string;
  colorClass?: string;
}) {
  return (
    <Card className="glass-card glass-card-hover relative overflow-hidden border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold tracking-tight tabular-nums text-foreground">{value}</p>
              {trend && (
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  {trend}
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function scoreText(val: number | null | undefined): string {
  return val == null ? 'N/A' : `${val.toFixed(1)}%`;
}

function statusBadgeVariant(status: string): 'success' | 'info' | 'warning' | 'destructive' | 'secondary' {
  if (status === 'Approved') return 'success';
  if (status === 'Submitted' || status === 'UnderReview') return 'info';
  if (status === 'Rejected' || status === 'NeedsRevision') return 'destructive';
  if (status === 'Draft') return 'secondary';
  return 'warning';
}

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [periods, setPeriods] = useState<ReportingPeriod[]>([]);
  const [divisions, setDivisions] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [pics, setPics] = useState<Array<{ id: string; picName: string }>>([]);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [trend, setTrend] = useState<Array<{ period: string; year: number; completion: number | null }>>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'areas' | 'quality' | 'issues'>('overview');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const year = Number(searchParams.get('year') ?? 2026);
  const period = searchParams.get('period') ?? 'Annual';

  useEffect(() => {
    Promise.all([getReportingPeriods(), getDivisions(), getPIC()])
      .then(([loadedPeriods, loadedDivisions, loadedPics]) => {
        setPeriods(loadedPeriods);
        setDivisions(loadedDivisions);
        setPics(loadedPics.map(pic => ({ id: pic.id, picName: pic.picName })));
      })
      .catch(() => setError('Unable to load filter options.'));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      getDashboard({
        year,
        period,
        isoAreaId: searchParams.get('isoAreaId') ?? undefined,
        divisionId: searchParams.get('divisionId') ?? undefined,
        picId: searchParams.get('picId') ?? undefined,
        status: searchParams.get('status') ?? undefined,
      }),
      getDashboardTrends({
        period,
        isoAreaId: searchParams.get('isoAreaId') ?? undefined,
      }),
    ])
      .then(([loadedDashboard, loadedTrend]) => {
        setDashboard(loadedDashboard);
        setTrend(loadedTrend);
      })
      .catch(() => setError('Failed to retrieve dashboard analytics.'))
      .finally(() => setLoading(false));
  }, [year, period, searchParams]);

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  const pieData = dashboard?.statusCounts
    ? [
        { name: 'Approved', value: dashboard.statusCounts.approved, color: STATUS_COLORS.Approved },
        { name: 'Submitted', value: dashboard.statusCounts.submitted, color: STATUS_COLORS.Submitted },
        { name: 'Under Review', value: dashboard.statusCounts.underReview, color: STATUS_COLORS.UnderReview },
        { name: 'Needs Revision', value: dashboard.statusCounts.needsRevision, color: STATUS_COLORS.NeedsRevision },
        { name: 'Draft', value: dashboard.statusCounts.draft, color: STATUS_COLORS.Draft },
      ].filter(d => d.value > 0)
    : [];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ── Header & Executive Title ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
              ISO 30414 Standard
            </Badge>
            <span className="text-xs text-muted-foreground">• Live Analytics Platform</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Human Capital Executive Dashboard
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {dashboard?.period ? `Analytics snapshot for ${dashboard.period.label}` : 'Comprehensive ISO 30414 metrics overview'}
          </p>
        </div>

        {/* Action Buttons & Quick Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/reports"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Generate ISO Report
          </Link>
          <Link
            to="/data/quality"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/80 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-all"
          >
            <Award className="h-4 w-4 text-emerald-400" />
            Quality Audit
          </Link>
        </div>
      </div>

      {/* ── Filter Toolbar ────────────────────────────────────────────── */}
      <Card className="glass-card border border-border/80 p-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5 text-blue-400" />
            Analytics Filters
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <select
              aria-label="Year"
              className="h-9 rounded-lg border border-border/80 bg-background/90 px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={String(year)}
              onChange={e => setFilter('year', e.target.value)}
            >
              {[...new Set(periods.map(item => item.year))].map(item => (
                <option key={item} value={item}>
                  Year {item}
                </option>
              ))}
            </select>

            <select
              aria-label="Period Type"
              className="h-9 rounded-lg border border-border/80 bg-background/90 px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={period}
              onChange={e => setFilter('period', e.target.value)}
            >
              <option value="Annual">Annual</option>
              <option value="SemiAnnual">Semi-Annual</option>
              <option value="Quarterly">Quarterly</option>
            </select>

            <select
              aria-label="ISO Area"
              className="h-9 rounded-lg border border-border/80 bg-background/90 px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchParams.get('isoAreaId') ?? ''}
              onChange={e => setFilter('isoAreaId', e.target.value)}
            >
              <option value="">All 12 ISO Areas</option>
              {dashboard?.areas.map(area => (
                <option key={area.id} value={area.id}>
                  Area {area.areaNumber}: {area.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Division"
              className="h-9 rounded-lg border border-border/80 bg-background/90 px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchParams.get('divisionId') ?? ''}
              onChange={e => setFilter('divisionId', e.target.value)}
            >
              <option value="">All Divisions</option>
              {divisions.map(item => (
                <option key={item.id} value={item.id}>
                  {item.code} - {item.name}
                </option>
              ))}
            </select>

            <select
              aria-label="PIC"
              className="h-9 rounded-lg border border-border/80 bg-background/90 px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchParams.get('picId') ?? ''}
              onChange={e => setFilter('picId', e.target.value)}
            >
              <option value="">All PICs</option>
              {pics.map(item => (
                <option key={item.id} value={item.id}>
                  {item.picName}
                </option>
              ))}
            </select>

            <select
              aria-label="Status"
              className="h-9 rounded-lg border border-border/80 bg-background/90 px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchParams.get('status') ?? ''}
              onChange={e => setFilter('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              {['Draft', 'Submitted', 'UnderReview', 'Approved', 'Rejected', 'NeedsRevision'].map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
          <span>{error}</span>
          <button type="button" className="inline-flex items-center gap-1.5 font-semibold text-red-300 hover:underline" onClick={() => setSearchParams(new URLSearchParams(searchParams))}>
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-card/60 border border-border/50" />
          ))}
        </div>
      )}

      {!loading && dashboard?.kpis && (
        <>
          {/* ── KPI Stat Cards Grid ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <MetricStatCard
              label="Total Metrics"
              value={String(dashboard.kpis.totalMetrics)}
              subtitle="Configured ISO Standard Metrics"
              icon={Database}
              colorClass="text-blue-400 bg-blue-500/10 border-blue-500/20"
            />

            <MetricStatCard
              label="Completed Submissions"
              value={String(dashboard.kpis.completed)}
              subtitle={dashboard.kpis.completion == null ? 'No submissions' : `${dashboard.kpis.completion}% completion rate`}
              trend={dashboard.kpis.completion ? `${dashboard.kpis.completion}%` : undefined}
              icon={CheckCircle2}
              colorClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            />

            <MetricStatCard
              label="Approved Data"
              value={String(dashboard.kpis.approved)}
              subtitle="Verified & Audit Ready"
              icon={ShieldCheck}
              colorClass="text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
            />

            <MetricStatCard
              label="Pending Review"
              value={String(dashboard.kpis.pending)}
              subtitle="Awaiting Approval Workflow"
              icon={Clock3}
              colorClass="text-purple-400 bg-purple-500/10 border-purple-500/20"
            />

            <MetricStatCard
              label="Quality Index"
              value={scoreText(dashboard.quality?.overall)}
              subtitle="Overall System Audit Score"
              icon={Award}
              colorClass="text-amber-400 bg-amber-500/10 border-amber-500/20"
            />
          </div>

          {/* ── Analytics Navigation Tabs ─────────────────────────────────── */}
          <div className="flex border-b border-border/60">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="h-4 w-4" />
              Executive Analytics
            </button>

            <button
              onClick={() => setActiveTab('areas')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === 'areas'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Database className="h-4 w-4" />
              ISO Areas Maturity ({dashboard.areas.length})
            </button>

            <button
              onClick={() => setActiveTab('quality')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === 'quality'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Data Quality Matrix
            </button>

            <button
              onClick={() => setActiveTab('issues')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === 'issues'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileWarning className="h-4 w-4" />
              Attention & Issues ({dashboard.issues?.length ?? 0})
            </button>
          </div>

          {/* ── TAB 1: OVERVIEW & CHARTS ──────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Row 1: Area Performance & Data Quality */}
              <div className="grid gap-6 xl:grid-cols-3">
                {/* ISO Area Completion Progress Bar */}
                <Card className="glass-card xl:col-span-2 border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold">ISO 30414 Area Performance</CardTitle>
                        <CardDescription className="text-xs">Completion rate by standards category</CardDescription>
                      </div>
                      <Link to="/iso-areas" className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold">
                        All Areas <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3.5">
                    {dashboard.areas.map(area => (
                      <Link
                        key={area.id}
                        to={`/iso-areas/${area.id}`}
                        className="group block rounded-lg border border-border/40 p-2.5 transition-all hover:border-blue-500/40 hover:bg-accent/40"
                      >
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="font-semibold text-foreground group-hover:text-blue-400 transition-colors">
                            {area.areaNumber}. {area.name}
                          </span>
                          <span className="font-bold tabular-nums text-foreground">
                            {scoreText(area.completionPercentage)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <Progress className="h-2 flex-1" value={area.completionPercentage ?? 0} />
                          <span className="text-[10px] text-muted-foreground w-16 text-right">
                            {area.completedMetrics}/{area.totalMetrics} metrik
                          </span>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>

                {/* Data Quality Gauge & Breakdown */}
                <Card className="glass-card border">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Data Quality Audit</CardTitle>
                    <CardDescription className="text-xs">System-wide data trust metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex flex-col items-center justify-center rounded-xl bg-blue-500/5 p-4 border border-blue-500/10">
                      <p className="text-4xl font-extrabold text-blue-400 tracking-tight">{scoreText(dashboard.quality?.overall)}</p>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overall Trust Score</p>
                    </div>

                    <div className="space-y-3">
                      {[
                        ['Completeness', dashboard.quality?.completeness, 'completeness'],
                        ['Accuracy', dashboard.quality?.accuracy, 'accuracy'],
                        ['Consistency', dashboard.quality?.consistency, 'consistency'],
                        ['Timeliness', dashboard.quality?.timeliness, 'timeliness'],
                      ].map(([label, value, key]) => (
                        <div key={String(key)} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-foreground">{label}</span>
                            <span className="text-blue-400 font-semibold">{scoreText(value as number | null)}</span>
                          </div>
                          <Progress className="h-1.5" value={(value as number | null) ?? 0} />
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg bg-card/80 p-3 text-xs text-muted-foreground border border-border/50">
                      <p className="font-semibold text-foreground mb-1">System Assessment:</p>
                      {dashboard.quality?.explanations.completeness}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Row 2: Completeness Trend & Metric Status Pie */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Trend Chart */}
                <Card className="glass-card border">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Multi-Year Completion Trend</CardTitle>
                    <CardDescription className="text-xs">Reporting coverage evolution across years</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {trend.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                            <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
                            <Area type="monotone" dataKey="completion" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCompletion)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="py-12 text-center text-xs text-muted-foreground">No historical trend data available.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Status Breakdown Donut Chart */}
                <Card className="glass-card border">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Metric Status Distribution</CardTitle>
                    <CardDescription className="text-xs">Current workflow submission state</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pieData.length > 0 ? (
                      <div className="flex flex-col sm:flex-row items-center justify-around h-64 gap-4">
                        <div className="w-48 h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2">
                          {pieData.map(item => (
                            <div key={item.name} className="flex items-center gap-2 text-xs">
                              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-muted-foreground w-28">{item.name}</span>
                              <span className="font-bold text-foreground tabular-nums">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="py-12 text-center text-xs text-muted-foreground">No status distribution available.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ── TAB 2: ISO AREAS MATURITY GRID ───────────────────────────── */}
          {activeTab === 'areas' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {dashboard.areas.map(area => {
                const pct = area.completionPercentage ?? 0;
                const isHigh = pct >= 90;
                const isMid = pct >= 60;
                return (
                  <Card key={area.id} className="glass-card glass-card-hover border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px]">
                          Area {area.areaNumber}
                        </Badge>
                        <Badge variant={isHigh ? 'success' : isMid ? 'info' : 'destructive'} className="text-[10px]">
                          {isHigh ? 'High Maturity' : isMid ? 'In Progress' : 'Needs Focus'}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm font-bold mt-2 line-clamp-1">{area.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-foreground tabular-nums">{scoreText(area.completionPercentage)}</span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {area.completedMetrics}/{area.totalMetrics} Metrik
                        </span>
                      </div>
                      <Progress className="h-2" value={pct} />

                      <div className="pt-2 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
                        <span>Status Metrik</span>
                        <span className="font-semibold text-emerald-400">{area.statusCounts.approved} Approved</span>
                      </div>

                      <Link
                        to={`/iso-areas/${area.id}`}
                        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-card/60 py-1.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all"
                      >
                        Detail Area <ArrowRight className="h-3 w-3" />
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* ── TAB 3: DATA QUALITY MATRIX ────────────────────────────────── */}
          {activeTab === 'quality' && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass-card border">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Completeness Audit</CardTitle>
                  <CardDescription className="text-xs">Required attribute filling compliance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card/80 border border-border/50">
                    <span className="text-xs text-muted-foreground">Completeness Score</span>
                    <span className="text-xl font-bold text-blue-400">{scoreText(dashboard.quality?.completeness)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{dashboard.quality?.explanations.completeness}</p>
                </CardContent>
              </Card>

              <Card className="glass-card border">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Accuracy & Validation</CardTitle>
                  <CardDescription className="text-xs">Data precision and validation rules checks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card/80 border border-border/50">
                    <span className="text-xs text-muted-foreground">Accuracy Score</span>
                    <span className="text-xl font-bold text-emerald-400">{scoreText(dashboard.quality?.accuracy)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{dashboard.quality?.explanations.accuracy}</p>
                </CardContent>
              </Card>

              <Card className="glass-card border">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Consistency Index</CardTitle>
                  <CardDescription className="text-xs">Historical period comparison integrity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card/80 border border-border/50">
                    <span className="text-xs text-muted-foreground">Consistency Score</span>
                    <span className="text-xl font-bold text-purple-400">{scoreText(dashboard.quality?.consistency)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{dashboard.quality?.explanations.consistency}</p>
                </CardContent>
              </Card>

              <Card className="glass-card border">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Timeliness Score</CardTitle>
                  <CardDescription className="text-xs">Submission timeline compliance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card/80 border border-border/50">
                    <span className="text-xs text-muted-foreground">Timeliness Score</span>
                    <span className="text-xl font-bold text-amber-400">{scoreText(dashboard.quality?.timeliness)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{dashboard.quality?.explanations.timeliness}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── TAB 4: ISSUES & RECENT ACTIVITIES ───────────────────────── */}
          {activeTab === 'issues' && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Data Issues Card */}
              <Card className="glass-card border">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Metrics Requiring Attention</CardTitle>
                  <CardDescription className="text-xs">Items flagged for revision or missing submissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dashboard.issues?.length ? (
                    dashboard.issues.map(issue => (
                      <Link
                        key={issue.metricId}
                        to={`/metrics/${issue.metricId}`}
                        className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/60 p-3 transition-colors hover:border-amber-500/40 hover:bg-accent/40"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground">{issue.metric}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {issue.area} • {issue.message}
                          </p>
                          <Badge className="mt-1.5 text-[10px]" variant={statusBadgeVariant(issue.status)}>
                            {issue.status}
                          </Badge>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="py-8 text-center text-xs text-muted-foreground">All metrics are in good standing!</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity Card */}
              <Card className="glass-card border">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Recent System Activity</CardTitle>
                  <CardDescription className="text-xs">Latest submissions and status changes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dashboard.activities?.length ? (
                    dashboard.activities.map(activity => (
                      <div key={activity.id} className="flex items-center justify-between gap-3 border-b border-border/40 pb-3 last:border-0">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-foreground">{activity.metric}</p>
                          <p className="truncate text-[11px] text-muted-foreground">{activity.area}</p>
                        </div>
                        <Badge variant={statusBadgeVariant(activity.status)} className="text-[10px]">
                          {activity.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="py-8 text-center text-xs text-muted-foreground">No recent audit log activity.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
