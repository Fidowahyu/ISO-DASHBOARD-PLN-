// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'PIC' | 'REVIEWER' | 'MANAGEMENT';
  divisionId: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
}

export interface ReviewSubmission extends Submission {
  submittedBy?: { id: string; fullName: string; email: string } | null;
  metric: Submission['metric'] & { isoArea: { name: string }; formulaDescription?: string; formulas: Array<{ formula: string; version: number }>; attributes: Array<{ id: string; name: string; dataType: string; exampleValue?: string }> };
  reviews: Array<{ id: string; action: string; statusFrom: string; statusTo: string; comment?: string; reviewedAt: string; reviewer: { fullName: string } }>;
  reviewComments: Array<{ id: string; comment: string; createdAt: string; author: { fullName: string } }>;
  versions: Array<{ id: string; version: number; status: string; attributeValues: Record<string, unknown>; calculatedResult: number | string | null; createdAt: string; createdBy?: { fullName: string } | null }>;
}

export function getReviews(filters: { status?: string; isoAreaId?: string; divisionId?: string; periodId?: string } = {}) { const params = new URLSearchParams(); Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); }); return request<Array<{ id: string; status: string; submittedAt: string | null; metric: { name: string; isoArea: { name: string }; pics: Array<{ picName: string }> }; reportingPeriod: ReportingPeriod; submittedBy?: { fullName: string } | null }>>(`/reviews?${params.toString()}`); }
export function getReviewSummary() { return request<{ pendingReview: number; approvedThisMonth: number; revisionRequired: number; rejected: number }>('/reviews/summary'); }
export function getReviewSubmission(id: string) { return request<ReviewSubmission>(`/submissions/${id}`); }
export function reviewAction(id: string, action: 'start-review' | 'approve' | 'request-revision' | 'reject' | 'resubmit', comment?: string) { const path = action === 'start-review' ? 'start-review' : action; return request<ReviewSubmission>(`/submissions/${id}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment }) }); }
export function getReviewHistory(id: string) { return request<{ versions: ReviewSubmission['versions']; reviews: ReviewSubmission['reviews']; comments: ReviewSubmission['reviewComments'] }>(`/submissions/${id}/history`); }
export function addReviewComment(id: string, comment: string) { return request<ReviewSubmission['reviewComments'][number]>(`/submissions/${id}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment }) }); }
export function getAuditLogs() { return request<Array<{ id: string; action: string; entityType: string; entityId: string | null; description: string | null; createdAt: string; user?: { fullName: string } | null }>>('/audit-logs'); }
export function getAuditLog(id: string) { return request<Awaited<ReturnType<typeof getAuditLogs>>[number] & { oldValues: unknown; newValues: unknown }>(`/audit-logs/${id}`); }
export function getNotifications() { return request<Array<{ id: string; type: string; title: string; message: string; readAt: string | null; createdAt: string }>>('/notifications'); }
export function markNotificationRead(id: string) { return request<{ id: string; readAt: string }>(`/notifications/${id}/read`, { method: 'POST' }); }

export type ReportSnapshot = {
  period: { id: string; year: number; label: string; periodType: string };
  filters: { year?: number; period?: string; isoAreaId?: string; divisionId?: string };
  totalMetrics: number; approvedMetrics: number; completion: number | null;
  quality: { overall: number | null; completeness: number | null; accuracy: number | null; consistency: number | null; timeliness: number | null };
  areas: Array<{ id: string; name: string; totalMetrics: number; approvedMetrics: number; completion: number | null; quality: number | null }>;
  metrics: Array<{ id: string; area: string; name: string; result: number | null; dataType: string; pic: string; division: string; status: string; approvedBy: string; approvedDate: string | null; values: Record<string, unknown> }>;
};
export function getReportPreview(filters: { year?: number; period?: string; isoAreaId?: string; divisionId?: string }) { const params = new URLSearchParams(); Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, String(value)); }); return request<ReportSnapshot>(`/reports/preview?${params.toString()}`); }
export function getReportSnapshot(id: string) { return request<ReportSnapshot>(`/reports/${id}/preview`); }
export function createReport(filters: ReportSnapshot['filters']) { return request<{ id: string; version: number; name: string }>('/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filters) }); }
export function generateReport(id: string, format: 'PDF' | 'EXCEL' | 'BOTH') { return request<{ id: string; files: Array<{ format: string; checksum: string }> }>(`/reports/${id}/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ format }) }); }
export function getReports() { return request<Array<{ id: string; name: string; version: number; status: string; createdAt: string; reportingPeriod: { label: string }; files: Array<{ format: string }> }>>('/reports/history'); }

// ─── Auth functions ───────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<{ user: AuthUser }> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      payload?.error?.message ?? payload?.error ?? payload?.message ?? 'Login failed.'
    );
  }
  return payload as { user: AuthUser };
}

export async function register(data: { fullName: string; email: string; password: string; role?: string; divisionId?: string }): Promise<{ user: AuthUser }> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      payload?.error?.message ?? payload?.error ?? payload?.message ?? 'Pendaftaran gagal. Silakan coba lagi.'
    );
  }
  return payload as { user: AuthUser };
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {/* best-effort */});
}

export async function getMe(): Promise<AuthUser> {
  return request<{ user: AuthUser }>('/auth/me').then(r => r.user);
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  role: AuthUser['role'];
  divisionId: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  division?: { id: string; code: string; name: string } | null;
}

export function getUsers() { return request<{ users: UserRecord[] }>('/users').then(r => r.users); }
export function getUser(id: string) { return request<{ user: UserRecord }>(`/users/${id}`).then(r => r.user); }

export function createUser(data: { email: string; fullName: string; role: AuthUser['role']; divisionId?: string | null; password?: string }) {
  return request<{ user: UserRecord; temporaryPassword?: string }>('/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
}

export function updateUser(id: string, data: { fullName?: string; role?: AuthUser['role']; divisionId?: string | null }) {
  return request<{ user: UserRecord }>(`/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.user);
}

export function deactivateUser(id: string) { return request<{ success: boolean }>(`/users/${id}/deactivate`, { method: 'POST' }); }
export function activateUser(id: string) { return request<{ success: boolean }>(`/users/${id}/activate`, { method: 'POST' }); }
export function resetUserPassword(id: string) { return request<{ temporaryPassword: string }>(`/users/${id}/reset-password`, { method: 'POST' }); }

// ─── Core request helper ──────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

/** Callback to redirect to login on 401 — set by AuthContext */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include', // Always send HttpOnly cookie
  });

  if (response.status === 401) {
    onUnauthorized?.();
    throw new Error('Session expired. Please log in again.');
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = payload?.error?.message ?? payload?.error ?? payload?.message ?? JSON.stringify(payload) ?? 'Request failed.';
    throw new Error(msg);
  }
  return payload as T;
}

// ─── Existing API functions ───────────────────────────────────────────────────

export interface ImportPreview {
  job: { id: string; filename: string; status: string; versionNumber: number };
  preview: {
    fileSize: number;
    uploadedAt: string;
    isoAreas: number;
    metrics: number;
    attributes: number;
    pic: number;
    new: number;
    updated: number;
    unchanged: number;
    warnings: number;
    errors: number;
    sheets: string[];
    structure: { isoAreas: number; metrics: number; attributes: number; pic: number; divisions: number; formulas: number };
    validation: { validRows: number; warningRows: number; errorRows: number; issues: Array<{ severity: string; code: string; message: string }> };
  };
}

export interface ConfigurationArea {
  id: string;
  areaNumber: number;
  name: string;
  nameEn: string;
  metrics: Array<{
    id: string;
    metricNumber: number;
    name: string;
    metricType: string;
    formulaDescription?: string;
    attributes: Array<{ id: string; name: string; dataType: string; exampleValue?: string; listOptions?: Array<{ value: string }> }>;
    formulas: Array<{ formula: string; version: number }>;
    pics: Array<{ picName: string; picYear: string; division?: { code: string; name: string } }>;
  }>;
}

export function uploadExcel(file: File): Promise<ImportPreview> {
  const body = new FormData();
  body.append('file', file);
  return request<ImportPreview>('/import/excel', { method: 'POST', body });
}

export function validateImport(id: string) {
  return request<{ validation: ImportPreview['preview']['validation']; summary: ImportPreview['preview'] }>(`/import/${id}/validate`, { method: 'POST' });
}

export function confirmImport(id: string) {
  return request<{ status: string; summary: ImportPreview['preview'] }>(`/import/${id}/confirm`, { method: 'POST' });
}

export function getAreas() {
  return request<Array<Omit<ConfigurationArea, 'metrics'> & { _count: { metrics: number } }>>('/iso-areas');
}

export function getArea(id: string) {
  return request<ConfigurationArea>(`/iso-areas/${id}`);
}

export function getPIC(year?: string) {
  return request<Array<{ id: string; picName: string; picYear: string; metric: { name: string; isoArea: { name: string } }; division?: { code: string; name: string } }>>(`/pic${year ? `?year=${encodeURIComponent(year)}` : ''}`);
}

export interface ReportingPeriod {
  id: string;
  year: number;
  periodType: string;
  label: string;
  status: string;
}

export interface MetricConfiguration {
  metric: ConfigurationArea['metrics'][number] & { isoArea: { name: string }; validationRules: Array<{ ruleType: string; ruleValue?: unknown; errorMessage?: string }> };
  attributes: ConfigurationArea['metrics'][number]['attributes'];
  formula: { formula: string; version: number } | null;
  pic: Array<{ picName: string; picYear: string; division?: { code: string; name: string } }>;
}

export interface Submission {
  id: string;
  status: string;
  attributeValues: Record<string, unknown>;
  calculatedResult: number | string | null;
  formulaVersion: string | null;
  metric: { id: string; name: string };
  reportingPeriod: ReportingPeriod;
}

export function getReportingPeriods() { return request<ReportingPeriod[]>('/reporting-periods'); }
export function getMetrics(areaId?: string) { return request<Array<{ id: string; name: string; metricNumber: number; isoArea: { name: string } }>>(`/metrics${areaId ? `?areaId=${encodeURIComponent(areaId)}` : ''}`); }
export function getMetricForm(metricId: string) { return request<MetricConfiguration>(`/metrics/${metricId}/form`); }
export function createMetricSubmission(input: { metricId: string; reportingPeriodId: string; attributeValues: Record<string, unknown>; notes?: string }) { return request<Submission>('/metric-submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }); }
export function calculateMetricSubmission(id: string, attributeValues: Record<string, unknown>) { return request<Submission>(`/metric-submissions/${id}/calculate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attributeValues }) }); }
export function submitMetricSubmission(id: string) { return request<Submission>(`/metric-submissions/${id}/submit`, { method: 'POST' }); }
export function getSubmissions(metricId?: string) { return request<Submission[]>(`/metric-submissions${metricId ? `?metricId=${encodeURIComponent(metricId)}` : ''}`); }
export function getSubmission(id: string) { return request<Submission>(`/metric-submissions/${id}`); }

export interface DashboardResponse {
  period: ReportingPeriod | null;
  empty: boolean;
  message?: string;
  kpis?: { totalMetrics: number; completed: number; pending: number; approved: number; needsAttention: number; completion: number | null };
  statusCounts?: { approved: number; submitted: number; underReview: number; rejected: number; needsRevision: number; draft: number };
  areas: Array<{ id: string; areaNumber: number; name: string; nameEn: string; totalMetrics: number; completedMetrics: number; completionPercentage: number | null; statusCounts: { approved: number; pending: number; attention: number }; metrics?: Array<{ id: string; name: string; status: string; result: number | null; pic: string }> }>;
  quality?: { overall: number | null; completeness: number | null; accuracy: number | null; consistency: number | null; timeliness: number | null; explanations: Record<string, string> };
  issues?: Array<{ metricId: string; metric: string; areaId: string; area: string; status: string; message: string }>;
  activities?: Array<{ id: string; metric: string; area: string; status: string; updatedAt: string }>;
}

export function getDashboard(filters: { year?: number; period?: string; isoAreaId?: string; divisionId?: string; picId?: string; status?: string } = {}) {
  const params = new URLSearchParams(); Object.entries(filters).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); });
  return request<DashboardResponse>(`/dashboard/summary${params.size ? `?${params.toString()}` : ''}`);
}
export function getDashboardTrends(filters: { period?: string; isoAreaId?: string } = {}) { const params = new URLSearchParams(); Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); }); return request<Array<{ period: string; year: number; completion: number | null }>>(`/dashboard/trends?${params.toString()}`); }
export function getDivisions() { return request<Array<{ id: string; code: string; name: string }>>('/divisions'); }
export function getAreaDashboard(id: string, year?: number) { return request<DashboardResponse>(`/iso-areas/${id}/dashboard${year ? `?year=${year}` : ''}`); }
export function getPICDashboard(id: string, year?: number) { return request<{ period: ReportingPeriod | null; assignments: Array<{ id: string; picName: string; picYear: string; division?: { code: string }; metric: { name: string; isoArea: { name: string }; metricValues: Array<{ status: string; calculatedResult: number | string | null }> } }> }>(`/pic/${id}/dashboard${year ? `?year=${year}` : ''}`); }
