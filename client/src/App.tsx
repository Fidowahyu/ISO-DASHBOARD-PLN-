import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ISOAreaListPage } from '@/pages/ISOAreaListPage';
import { ISOAreaDetailPage } from '@/pages/ISOAreaDetailPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { ExcelImportPage } from '@/pages/ExcelImportPage';
import { ISOConfigurationPage } from '@/pages/ISOConfigurationPage';
import { PICManagementPage } from '@/pages/PICManagementPage';
import { DynamicMetricInputPage } from '@/pages/DynamicMetricInputPage';
import { SubmissionListPage } from '@/pages/SubmissionListPage';
import { MetricDetailPage } from '@/pages/MetricDetailPage';
import { SubmissionDetailPage } from '@/pages/SubmissionDetailPage';
import { PICDetailPage } from '@/pages/PICDetailPage';
import { ReviewQueuePage } from '@/pages/ReviewQueuePage';
import { ReviewSubmissionPage } from '@/pages/ReviewSubmissionPage';
import { AuditLogPage } from '@/pages/AuditLogPage';
import { AuditLogDetailPage } from '@/pages/AuditLogDetailPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { SubmissionHistoryPage } from '@/pages/SubmissionHistoryPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { ReportPreviewPage } from '@/pages/ReportPreviewPage';
import { ReportHistoryPage } from '@/pages/ReportHistoryPage';
import { UserManagementPage } from '@/pages/UserManagementPage';
import { DataQualityAnalyticsPage } from '@/pages/DataQualityAnalyticsPage';
import { SystemArchitecturePage } from '@/pages/SystemArchitecturePage';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* ─── Public routes ───────────────────────────────────────── */}
            <Route path="/login" element={<LoginPage />} />

            {/* ─── Protected routes (require authentication) ───────────── */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                {/* Dashboard & Overview */}
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* ISO Areas */}
                <Route path="/iso-areas" element={<ISOAreaListPage />} />
                <Route path="/iso-areas/:slug" element={<ISOAreaDetailPage />} />

                {/* Data Input & Submissions (ADMIN, PIC) */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PIC']} />}>
                  <Route path="/data-management/input" element={<DynamicMetricInputPage />} />
                  <Route path="/data-management/input/:metricId" element={<DynamicMetricInputPage />} />
                  <Route path="/data-management/drafts" element={<SubmissionListPage status="Draft" />} />
                  <Route path="/data-management/submissions" element={<SubmissionListPage />} />
                  <Route path="/data-management/submissions/:id" element={<SubmissionDetailPage />} />
                  <Route path="/data/input" element={<DynamicMetricInputPage />} />
                </Route>

                {/* Excel Import & System Arch (ADMIN ONLY) */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/data-management/import" element={<ExcelImportPage />} />
                  <Route path="/data/upload" element={<ExcelImportPage />} />
                  <Route path="/system/architecture" element={<SystemArchitecturePage />} />
                </Route>

                {/* Data Quality & Analytics */}
                <Route path="/data/validation" element={<DataQualityAnalyticsPage />} />
                <Route path="/data/quality" element={<DataQualityAnalyticsPage />} />

                {/* Review Workflow (ADMIN, REVIEWER) */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'REVIEWER']} />}>
                  <Route path="/review" element={<ReviewQueuePage />} />
                  <Route path="/review/:submissionId" element={<ReviewSubmissionPage />} />
                  <Route path="/review/pending" element={<ReviewQueuePage />} />
                  <Route path="/review/approved" element={<PlaceholderPage />} />
                  <Route path="/review/rejected" element={<PlaceholderPage />} />
                </Route>

                {/* Reports & History */}
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/reports/preview" element={<ReportPreviewPage />} />
                <Route path="/reports/history" element={<ReportHistoryPage />} />
                <Route path="/reports/iso" element={<ReportsPage />} />
                <Route path="/reports/excel" element={<ReportsPage />} />
                <Route path="/reports/pdf" element={<ReportsPage />} />

                {/* Administration (ADMIN ONLY) */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/administration/pic" element={<PICManagementPage />} />
                  <Route path="/administration/pic/:id" element={<PICDetailPage />} />
                  <Route path="/administration/iso-configuration" element={<ISOConfigurationPage />} />
                  <Route path="/administration/users" element={<UserManagementPage />} />
                  <Route path="/administration/audit-log" element={<AuditLogPage />} />
                  <Route path="/administration/audit-log/:id" element={<AuditLogDetailPage />} />
                  <Route path="/admin/pic" element={<PICManagementPage />} />
                  <Route path="/admin/config" element={<ISOConfigurationPage />} />
                  <Route path="/admin/users" element={<UserManagementPage />} />
                  <Route path="/admin/audit" element={<AuditLogPage />} />
                </Route>

                {/* Misc */}
                <Route path="/submissions/:id/history" element={<SubmissionHistoryPage />} />
                <Route path="/submissions/:id" element={<ReviewSubmissionPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/metrics/:id" element={<MetricDetailPage />} />

                {/* Catch-all */}
                <Route path="*" element={<PlaceholderPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
