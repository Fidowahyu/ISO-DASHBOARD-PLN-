/**
 * Dashboard data service — provides KPIs and quality scores.
 * In production, these will be computed server-side from real metric values.
 */
import type { DashboardKPI, DataQualityScore } from '@/types';
import { getTotalMetrics, getTotalCompleted, getTotalPending, getOverallCompletion } from './iso-areas';

export function getDashboardKPIs(): DashboardKPI[] {
  return [
    {
      label: 'Total Metrics',
      value: getTotalMetrics(),
      icon: 'BarChart3',
      trend: 'neutral',
    },
    {
      label: 'Completed',
      value: getTotalCompleted(),
      icon: 'CheckCircle2',
      trend: 'up',
      trendValue: '+4 this week',
    },
    {
      label: 'Pending',
      value: getTotalPending(),
      icon: 'Clock',
      trend: 'down',
      trendValue: '-2 from last week',
    },
    {
      label: 'Data Quality',
      value: getOverallCompletion(),
      suffix: '%',
      icon: 'Shield',
      trend: 'up',
      trendValue: '+1.2% this month',
    },
  ];
}

export function getDataQualityScore(): DataQualityScore {
  return {
    overall: 87,
    completeness: 92,
    accuracy: 86,
    consistency: 90,
    timeliness: 81,
  };
}

export interface RecentActivity {
  id: string;
  user: string;
  action: string;
  metric: string;
  area: string;
  timestamp: string;
  type: 'update' | 'approve' | 'reject' | 'submit';
}

export function getRecentActivities(): RecentActivity[] {
  return [
    {
      id: '1',
      user: 'Sri Yuliani P.',
      action: 'Submitted metric data',
      metric: 'Rasio Konversi Pelamar',
      area: 'Recruitment',
      timestamp: '2 hours ago',
      type: 'submit',
    },
    {
      id: '2',
      user: 'Adhi Sulistyo',
      action: 'Approved metric',
      metric: 'EBIT per FTE',
      area: 'Productivity',
      timestamp: '4 hours ago',
      type: 'approve',
    },
    {
      id: '3',
      user: 'Yonna Chrisman',
      action: 'Updated data',
      metric: 'Turnover Rate',
      area: 'Workforce Mobility & Succession',
      timestamp: '5 hours ago',
      type: 'update',
    },
    {
      id: '4',
      user: 'Agung Bayu K.',
      action: 'Rejected with comments',
      metric: 'Rata-rata Jam Pelatihan',
      area: 'Learning & Development',
      timestamp: '1 day ago',
      type: 'reject',
    },
    {
      id: '5',
      user: 'Muhammad Rijaal',
      action: 'Submitted metric data',
      metric: 'Jumlah Karyawan',
      area: 'Workforce Availability',
      timestamp: '1 day ago',
      type: 'submit',
    },
  ];
}
