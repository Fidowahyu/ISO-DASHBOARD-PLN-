/**
 * Navigation configuration — defines the sidebar structure.
 * `roles` = which roles can see this item. Undefined = all roles.
 */
import type { NavSection } from '@/types';

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
      { label: 'System Architecture', href: '/system/architecture', icon: 'GitBranch' },
    ],
  },
  {
    title: 'ISO Areas',
    items: [
      { label: 'All Areas', href: '/iso-areas', icon: 'Layers' },
      { label: 'Workforce Composition', href: '/iso-areas/workforce-composition', icon: 'Users' },
      { label: 'Diversity', href: '/iso-areas/diversity', icon: 'Heart' },
      { label: 'Cost', href: '/iso-areas/cost', icon: 'DollarSign' },
      { label: 'Productivity', href: '/iso-areas/productivity', icon: 'TrendingUp' },
      { label: 'Health, Safety & Well-being', href: '/iso-areas/health-safety-wellbeing', icon: 'ShieldCheck' },
      { label: 'Leadership & Engagement', href: '/iso-areas/leadership-culture-engagement', icon: 'Award' },
      { label: 'Compliance & Ethics', href: '/iso-areas/compliance-ethics-workforce', icon: 'Scale' },
      { label: 'Recruitment', href: '/iso-areas/recruitment', icon: 'UserPlus' },
      { label: 'Workforce Mobility', href: '/iso-areas/workforce-mobility-succession', icon: 'ArrowUpDown' },
      { label: 'Succession Planning', href: '/iso-areas/succession-planning', icon: 'GitBranch' },
      { label: 'Workforce Availability', href: '/iso-areas/workforce-availability', icon: 'Calendar' },
      { label: 'Learning & Development', href: '/iso-areas/learning-development', icon: 'GraduationCap' },
    ],
  },
  {
    title: 'Data Management',
    roles: ['ADMIN', 'PIC'],
    items: [
      { label: 'Data Input', href: '/data-management/input', icon: 'PenSquare', roles: ['ADMIN', 'PIC'] },
      { label: 'Drafts', href: '/data-management/drafts', icon: 'FileText', roles: ['ADMIN', 'PIC'] },
      { label: 'Submissions', href: '/data-management/submissions', icon: 'CheckCircle', roles: ['ADMIN', 'PIC'] },
      { label: 'Import Configuration', href: '/data-management/import', icon: 'Upload', roles: ['ADMIN', 'PIC'] },
      { label: 'Data Validation', href: '/data/validation', icon: 'CheckSquare', roles: ['ADMIN', 'PIC'] },
      { label: 'Data Quality', href: '/data/quality', icon: 'BarChart', roles: ['ADMIN', 'PIC'] },
    ],
  },
  {
    title: 'Review',
    roles: ['ADMIN', 'REVIEWER'],
    items: [
      { label: 'Review Queue', href: '/review', icon: 'Clock', roles: ['ADMIN', 'REVIEWER'] },
      { label: 'Approved', href: '/review/approved', icon: 'CheckCircle', roles: ['ADMIN', 'REVIEWER'] },
      { label: 'Rejected', href: '/review/rejected', icon: 'XCircle', roles: ['ADMIN', 'REVIEWER'] },
    ],
  },
  {
    title: 'Reports',
    items: [
      { label: 'Reports', href: '/reports', icon: 'FileText' },
      { label: 'Report History', href: '/reports/history', icon: 'History' },
    ],
  },
  {
    title: 'Administration',
    roles: ['ADMIN'],
    items: [
      { label: 'Users', href: '/administration/users', icon: 'Users', roles: ['ADMIN'] },
      { label: 'PIC Management', href: '/administration/pic', icon: 'UserCog', roles: ['ADMIN'] },
      { label: 'ISO Configuration', href: '/administration/iso-configuration', icon: 'Settings', roles: ['ADMIN'] },
      { label: 'Audit Log', href: '/administration/audit-log', icon: 'History', roles: ['ADMIN'] },
    ],
  },
];

/**
 * Divisions data — from Excel analysis.
 */
export const DIVISIONS = [
  { code: 'HSC', name: 'Human Capital Services' },
  { code: 'HST', name: 'Human Capital Strategy' },
  { code: 'HTD', name: 'Human Talent Development' },
  { code: 'PUSDIKLAT', name: 'Pusat Pendidikan dan Pelatihan' },
  { code: 'K3L', name: 'Keselamatan Kesehatan Kerja & Lingkungan' },
  { code: 'SPI/PKP', name: 'Satuan Pengawasan Internal' },
] as const;
