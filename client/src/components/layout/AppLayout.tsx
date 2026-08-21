import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

/** Map path to page title/subtitle. */
function getPageMeta(pathname: string): { title: string; subtitle?: string } {
  if (pathname === '/' || pathname === '/dashboard') return { title: 'Dashboard', subtitle: 'ISO 30414 Human Capital Reporting Overview' };
  if (pathname === '/iso-areas') return { title: 'ISO Areas', subtitle: 'All 12 ISO 30414 Reporting Areas' };
  if (pathname.startsWith('/iso-areas/')) {
    const slug = pathname.split('/iso-areas/')[1]?.split('/')[0] ?? '';
    const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return { title: name, subtitle: 'ISO Area Detail' };
  }
  if (pathname.startsWith('/data/') || pathname.startsWith('/data-management/')) return { title: 'Data Management', subtitle: 'Manage ISO 30414 reporting data' };
  if (pathname.startsWith('/metrics/')) return { title: 'Metric Detail', subtitle: 'Configuration and reporting history' };
  if (pathname.startsWith('/review/')) return { title: 'Review', subtitle: 'Review and approve metric submissions' };
  if (pathname === '/review') return { title: 'Review', subtitle: 'Review and approve metric submissions' };
  if (pathname.startsWith('/submissions/')) return { title: 'Submission Detail', subtitle: 'Review workflow and audit history' };
  if (pathname.startsWith('/administration/audit-log')) return { title: 'Audit Log', subtitle: 'Immutable system activity trail' };
  if (pathname === '/notifications') return { title: 'Notifications', subtitle: 'Workflow updates' };
  if (pathname.startsWith('/reports/')) return { title: 'Reports', subtitle: 'Generate ISO 30414 reports' };
  if (pathname === '/reports') return { title: 'Reports', subtitle: 'Generate ISO 30414 reports' };
  if (pathname.startsWith('/admin/') || pathname.startsWith('/administration/')) return { title: 'Administration', subtitle: 'System configuration and management' };
  return { title: 'ISO 30414' };
}

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { title, subtitle } = getPageMeta(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={cn(
          'flex flex-1 flex-col overflow-hidden sidebar-transition',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}
      >
        <Header title={title} subtitle={subtitle} onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
