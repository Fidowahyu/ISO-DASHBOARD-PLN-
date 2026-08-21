/* ─── ISO Area Types ─── */
export interface ISOArea {
  id: string;
  areaNumber: number;
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  totalMetrics: number;
  completedMetrics: number;
  pendingMetrics: number;
  approvedMetrics: number;
  rejectedMetrics: number;
  completionPercentage: number;
  isActive: boolean;
}

/* ─── Metric Types ─── */
export type MetricType = 'Required' | 'Recommended' | 'N/A';
export type ISOComparison = 'Sudah ada' | 'Baru' | 'N/A';
export type DataType = 'Text' | 'Number' | 'List' | 'Date' | 'Year' | 'Percentage';
export type MetricStatus = 'Draft' | 'Submitted' | 'UnderReview' | 'Approved' | 'Rejected' | 'NeedsRevision';

export interface MetricAttribute {
  id: string;
  name: string;
  dataType: DataType;
  exampleValue: string;
  isPrimary: boolean;
  listOptions?: string[];
  sortOrder: number;
}

export interface Metric {
  id: string;
  isoAreaId: string;
  metricNumber: number;
  name: string;
  metricType: MetricType;
  isoComparison: ISOComparison;
  formulaDescription: string;
  status: 'Active' | 'Inactive' | 'Moved';
  movedToNote?: string;
  attributes: MetricAttribute[];
  pic?: MetricPIC;
  sortOrder: number;
}

/* ─── PIC Types ─── */
export interface Division {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface MetricPIC {
  id: string;
  divisionCode: string;
  divisionName: string;
  picName: string;
  picYear: string;
  isCoordinator: boolean;
}

/* ─── Dashboard Types ─── */
export interface DashboardKPI {
  label: string;
  value: number;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: string;
}

export interface DataQualityScore {
  overall: number;
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
}

/* ─── User & Auth Types ─── */
export type UserRole = 'ADMIN' | 'PIC' | 'REVIEWER' | 'MANAGEMENT';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  division?: string;
  isActive: boolean;
}

/* ─── Navigation Types ─── */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  children?: NavItem[];
  badge?: number;
  roles?: UserRole[];  // if set, only these roles can see this item
}

export interface NavSection {
  title: string;
  items: NavItem[];
  roles?: UserRole[];  // if set, only these roles can see this section
}

/* ─── Review Types ─── */
export interface Review {
  id: string;
  metricValueId: string;
  reviewerId: string;
  reviewerName: string;
  action: 'Submit' | 'Approve' | 'Reject' | 'RequestRevision';
  statusFrom: MetricStatus;
  statusTo: MetricStatus;
  comment: string;
  reviewedAt: string;
}

/* ─── Reporting Period ─── */
export interface ReportingPeriod {
  id: string;
  year: number;
  periodType: 'Annual' | 'Semi-Annual' | 'Quarterly';
  label: string;
  status: 'Open' | 'Closed' | 'Locked';
}
