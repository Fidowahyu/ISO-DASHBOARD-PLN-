import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Database,
  CheckSquare,
  Layers,
  FileSpreadsheet,
  FileText,
  Users,
  Shield,
  History,
  Settings,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  GitBranch,
} from '@/components/ui/icons';

export function SystemArchitecturePage() {

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 border-b border-border/50 pb-5">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
            Architecture Blueprint
          </Badge>
          <span className="text-xs text-muted-foreground">• System Architecture & Data Flow</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          ISO 30414 End-to-End System Workflow Map
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Peta alur kerja dan arsitektur sistem pengolahan data Human Capital dari entri Excel, validasi kualitas, mesin kalkulasi KPI, hingga pelaporan PDF & Excel.
        </p>
      </div>

      {/* ── Interactive Flow Diagram Container ──────────────────────────── */}
      <div className="relative space-y-12">
        {/* ROOT NODE: ISO 30414 SYSTEM */}
        <div className="flex justify-center">
          <Card className="glass-card border-blue-500/40 bg-gradient-to-r from-blue-950/60 via-card to-purple-950/40 p-5 shadow-2xl max-w-md w-full text-center relative z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-lg shadow-blue-500/20">
                <Shield className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="border-blue-500/40 text-blue-300 text-[10px]">
                CORE PLATFORM
              </Badge>
              <h2 className="text-xl font-black text-foreground">ISO 30414 SYSTEM</h2>
              <p className="text-xs text-muted-foreground">
                Human Capital Reporting & Analytics Engine (Global Enterprise Corp)
              </p>
            </div>
          </Card>
        </div>

        {/* CONNECTING LINES FROM ROOT */}
        <div className="relative hidden md:block">
          <div className="absolute left-1/2 -top-12 h-12 w-0.5 bg-gradient-to-b from-blue-500 to-border -translate-x-1/2" />
          <div className="absolute left-1/6 right-1/6 top-0 h-0.5 bg-border" />
        </div>

        {/* 3 MAIN BRANCHES: DATA MANAGEMENT | KPI INDICATORS | ADMIN & GOVERNANCE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* BRANCH 1: DATA MANAGEMENT */}
          <div className="space-y-6">
            <Card className="glass-card glass-card-hover border-blue-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px]">
                    MODULE 01
                  </Badge>
                  <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                </div>
                <CardTitle className="text-base font-bold flex items-center gap-2 mt-2">
                  <Database className="h-4 w-4 text-blue-400" />
                  DATA MANAGEMENT
                </CardTitle>
                <CardDescription className="text-xs">Ingestion & Entri Data Metrik</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs">
                <Link to="/data-management/import" className="flex items-center justify-between p-2.5 rounded-lg bg-card/60 border border-border/40 hover:border-blue-500/40 transition-colors">
                  <span className="flex items-center gap-2 font-medium">
                    <Upload className="h-3.5 w-3.5 text-blue-400" /> Excel Upload
                  </span>
                  <Badge variant="secondary" className="text-[10px]">.XLSX Ingestion</Badge>
                </Link>
                <Link to="/data-management/input" className="flex items-center justify-between p-2.5 rounded-lg bg-card/60 border border-border/40 hover:border-blue-500/40 transition-colors">
                  <span className="flex items-center gap-2 font-medium">
                    <Users className="h-3.5 w-3.5 text-emerald-400" /> Employee & Metric Data
                  </span>
                  <Badge variant="secondary" className="text-[10px]">84 Metrics</Badge>
                </Link>
                <Link to="/administration/pic" className="flex items-center justify-between p-2.5 rounded-lg bg-card/60 border border-border/40 hover:border-blue-500/40 transition-colors">
                  <span className="flex items-center gap-2 font-medium">
                    <GitBranch className="h-3.5 w-3.5 text-purple-400" /> Organization & PIC
                  </span>
                  <Badge variant="secondary" className="text-[10px]">130 PICs</Badge>
                </Link>
                <Link to="/data/validation" className="flex items-center justify-between p-2.5 rounded-lg bg-card/60 border border-border/40 hover:border-blue-500/40 transition-colors">
                  <span className="flex items-center gap-2 font-medium">
                    <CheckSquare className="h-3.5 w-3.5 text-amber-400" /> Validation Engine
                  </span>
                  <Badge variant="success" className="text-[10px]">Passed</Badge>
                </Link>
              </CardContent>
            </Card>

            {/* PIPELINE DOWN: DATA QUALITY */}
            <div className="flex justify-center">
              <div className="h-6 w-0.5 bg-blue-500/50" />
            </div>

            <Card className="glass-card glass-card-hover border-emerald-500/30 bg-emerald-950/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="success" className="text-[10px]">DATA AUDIT</Badge>
                  <span className="font-bold text-emerald-400 text-xs">92.1% Score</span>
                </div>
                <CardTitle className="text-base font-bold flex items-center gap-2 mt-1 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  DATA QUALITY
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>Verifikasi 4 pilar kualitas: Kelengkapan, Akurasi, Konsistensi, dan Ketepatan Waktu.</p>
                <Link to="/data/quality" className="inline-flex items-center gap-1 font-semibold text-emerald-400 hover:underline">
                  Buka Data Quality Matrix <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* BRANCH 2: KPI INDICATORS */}
          <div className="space-y-6">
            <Card className="glass-card glass-card-hover border-purple-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-[10px]">
                    MODULE 02
                  </Badge>
                  <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-ping" />
                </div>
                <CardTitle className="text-base font-bold flex items-center gap-2 mt-2">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  KPI INDICATORS
                </CardTitle>
                <CardDescription className="text-xs">Mesin Perhitungan & Formula Metrik</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card/60 border border-border/40">
                  <span className="flex items-center gap-2 font-medium">
                    <Settings className="h-3.5 w-3.5 text-purple-400" /> Calculation Engine
                  </span>
                  <Badge variant="secondary" className="text-[10px]">Auto Formulas</Badge>
                </div>
                <Link to="/iso-areas" className="flex items-center justify-between p-2.5 rounded-lg bg-card/60 border border-border/40 hover:border-purple-500/40 transition-colors">
                  <span className="flex items-center gap-2 font-medium">
                    <Award className="h-3.5 w-3.5 text-cyan-400" /> KPI Status Overview
                  </span>
                  <Badge variant="secondary" className="text-[10px]">12 Areas</Badge>
                </Link>
                <Link to="/dashboard" className="flex items-center justify-between p-2.5 rounded-lg bg-card/60 border border-border/40 hover:border-purple-500/40 transition-colors">
                  <span className="flex items-center gap-2 font-medium">
                    <History className="h-3.5 w-3.5 text-emerald-400" /> KPI History (2021 - 2026)
                  </span>
                  <Badge variant="success" className="text-[10px]">6 Years Data</Badge>
                </Link>
              </CardContent>
            </Card>

            {/* PIPELINE CONNECTOR TO DASHBOARD */}
            <div className="flex justify-center">
              <div className="h-6 w-0.5 bg-purple-500/50" />
            </div>

            <Card className="glass-card glass-card-hover border-blue-500/40 bg-gradient-to-br from-blue-950/30 to-purple-950/20">
              <CardHeader className="pb-2">
                <Badge variant="outline" className="border-blue-500/40 text-blue-300 text-[10px] w-fit">
                  EXECUTIVE HUB
                </Badge>
                <CardTitle className="text-base font-bold flex items-center gap-2 mt-1 text-blue-400">
                  <Layers className="h-4 w-4" />
                  EXECUTIVE DASHBOARD
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>Visualisasi analitik Workforce Diversity, Turnover, Cost/FTE, L&D, dan Mobility.</p>
                <Link to="/dashboard" className="inline-flex items-center gap-1 font-semibold text-blue-400 hover:underline">
                  Buka Dashboard Utama <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* BRANCH 3: ADMIN & GOVERNANCE */}
          <div className="space-y-6">
            <Card className="glass-card glass-card-hover border-amber-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px]">
                    MODULE 03
                  </Badge>
                  <span className="flex h-2 w-2 rounded-full bg-amber-500" />
                </div>
                <CardTitle className="text-base font-bold flex items-center gap-2 mt-2">
                  <Shield className="h-4 w-4 text-amber-400" />
                  ADMIN & GOVERNANCE
                </CardTitle>
                <CardDescription className="text-xs">Kontrol Pengguna, Peran, & Audit Log</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs">
                <Link to="/administration/users" className="flex items-center justify-between p-2.5 rounded-lg bg-card/60 border border-border/40 hover:border-amber-500/40 transition-colors">
                  <span className="flex items-center gap-2 font-medium">
                    <Users className="h-3.5 w-3.5 text-amber-400" /> User Management
                  </span>
                  <Badge variant="secondary" className="text-[10px]">RBAC Active</Badge>
                </Link>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card/60 border border-border/40">
                  <span className="flex items-center gap-2 font-medium">
                    <Shield className="h-3.5 w-3.5 text-emerald-400" /> System Roles (ADMIN, PIC, REVIEWER)
                  </span>
                  <Badge variant="secondary" className="text-[10px]">4 Roles</Badge>
                </div>
                <Link to="/administration/audit-log" className="flex items-center justify-between p-2.5 rounded-lg bg-card/60 border border-border/40 hover:border-amber-500/40 transition-colors">
                  <span className="flex items-center gap-2 font-medium">
                    <History className="h-3.5 w-3.5 text-cyan-400" /> Audit Log & System History
                  </span>
                  <Badge variant="secondary" className="text-[10px]">Logging</Badge>
                </Link>
                <Link to="/administration/pic" className="flex items-center justify-between p-2.5 rounded-lg bg-card/60 border border-border/40 hover:border-amber-500/40 transition-colors">
                  <span className="flex items-center gap-2 font-medium">
                    <GitBranch className="h-3.5 w-3.5 text-purple-400" /> Organization Structure
                  </span>
                  <Badge variant="secondary" className="text-[10px]">Enterprise Structure</Badge>
                </Link>
              </CardContent>
            </Card>

            {/* PIPELINE DOWN TO REPORTING */}
            <div className="flex justify-center">
              <div className="h-6 w-0.5 bg-amber-500/50" />
            </div>

            <Card className="glass-card glass-card-hover border-cyan-500/30 bg-cyan-950/10">
              <CardHeader className="pb-2">
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-300 text-[10px] w-fit">
                  OUTPUT ENGINE
                </Badge>
                <CardTitle className="text-base font-bold flex items-center gap-2 mt-1 text-cyan-400">
                  <FileSpreadsheet className="h-4 w-4" />
                  REPORTING SYSTEM
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-3">
                <p>Ekspor laporan ISO 30414 dalam format resmi PDF & Excel ExcelJS.</p>
                <div className="flex gap-2">
                  <Link to="/reports" className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600/30 border border-cyan-500/40 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all">
                    <FileText className="h-3.5 w-3.5" /> PDF Export
                  </Link>
                  <Link to="/reports" className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600/30 border border-emerald-500/40 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all">
                    <FileSpreadsheet className="h-3.5 w-3.5" /> Excel Export
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
