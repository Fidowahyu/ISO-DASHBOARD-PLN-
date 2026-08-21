/**
 * ISO 30414 Area configuration — derived from Excel analysis.
 * This serves as the single source of truth for area definitions.
 * In production, this will be loaded from the database via API.
 */
import type { ISOArea } from '@/types';

export const ISO_AREAS: ISOArea[] = [
  {
    id: 'area-01',
    areaNumber: 1,
    name: 'Workforce Composition',
    nameEn: 'Workforce Composition',
    slug: 'workforce-composition',
    description: 'Komposisi tenaga kerja: jumlah, jenis, dan komposisi karyawan termasuk FTE dan tenaga kerja kontingen.',
    totalMetrics: 7,
    completedMetrics: 6,
    pendingMetrics: 1,
    approvedMetrics: 5,
    rejectedMetrics: 0,
    completionPercentage: 95,
    isActive: true,
  },
  {
    id: 'area-02',
    areaNumber: 2,
    name: 'Diversity',
    nameEn: 'Diversity',
    slug: 'diversity',
    description: 'Keberagaman tenaga kerja berdasarkan gender, usia, disabilitas, dan latar belakang.',
    totalMetrics: 5,
    completedMetrics: 4,
    pendingMetrics: 1,
    approvedMetrics: 3,
    rejectedMetrics: 0,
    completionPercentage: 82,
    isActive: true,
  },
  {
    id: 'area-03',
    areaNumber: 3,
    name: 'Cost',
    nameEn: 'Cost',
    slug: 'cost',
    description: 'Biaya tenaga kerja: L&D, rekrutmen, turnover, dan rasio kompensasi.',
    totalMetrics: 7,
    completedMetrics: 6,
    pendingMetrics: 1,
    approvedMetrics: 5,
    rejectedMetrics: 0,
    completionPercentage: 91,
    isActive: true,
  },
  {
    id: 'area-04',
    areaNumber: 4,
    name: 'Productivity',
    nameEn: 'Productivity',
    slug: 'productivity',
    description: 'Produktivitas tenaga kerja: revenue per FTE, EBIT per FTE, dan HCROI.',
    totalMetrics: 4,
    completedMetrics: 3,
    pendingMetrics: 1,
    approvedMetrics: 2,
    rejectedMetrics: 0,
    completionPercentage: 76,
    isActive: true,
  },
  {
    id: 'area-05',
    areaNumber: 5,
    name: 'Health, Safety & Well-being',
    nameEn: 'Health, Safety and Well-being',
    slug: 'health-safety-wellbeing',
    description: 'Kesehatan, keselamatan, dan kesejahteraan: kecelakaan kerja, waktu hilang, dan pelatihan wellness.',
    totalMetrics: 5,
    completedMetrics: 5,
    pendingMetrics: 0,
    approvedMetrics: 4,
    rejectedMetrics: 0,
    completionPercentage: 94,
    isActive: true,
  },
  {
    id: 'area-06',
    areaNumber: 6,
    name: 'Leadership, Culture & Engagement',
    nameEn: 'Leadership, Culture and Engagement',
    slug: 'leadership-culture-engagement',
    description: 'Kepemimpinan dan keterlibatan: engagement, eNPS, masa kerja, dan retensi.',
    totalMetrics: 6,
    completedMetrics: 5,
    pendingMetrics: 1,
    approvedMetrics: 4,
    rejectedMetrics: 0,
    completionPercentage: 80,
    isActive: true,
  },
  {
    id: 'area-07',
    areaNumber: 7,
    name: 'Compliance, Ethics & Workforce Relations',
    nameEn: 'Compliance, Ethics and Workforce Relations',
    slug: 'compliance-ethics-workforce',
    description: 'Kepatuhan dan etika: HAM, PKB, pengaduan, tindakan disipliner, dan sengketa.',
    totalMetrics: 11,
    completedMetrics: 10,
    pendingMetrics: 1,
    approvedMetrics: 8,
    rejectedMetrics: 1,
    completionPercentage: 88,
    isActive: true,
  },
  {
    id: 'area-08',
    areaNumber: 8,
    name: 'Recruitment',
    nameEn: 'Recruitment',
    slug: 'recruitment',
    description: 'Rekrutmen: rasio konversi, time-to-fill, kualitas per hire, dan biaya rekrutmen.',
    totalMetrics: 5,
    completedMetrics: 5,
    pendingMetrics: 0,
    approvedMetrics: 4,
    rejectedMetrics: 0,
    completionPercentage: 91,
    isActive: true,
  },
  {
    id: 'area-09',
    areaNumber: 9,
    name: 'Workforce Mobility & Succession',
    nameEn: 'Workforce Mobility and Succession Planning',
    slug: 'workforce-mobility-succession',
    description: 'Mobilitas dan suksesi: pengisian internal, posisi kritis, dan cakupan penerus.',
    totalMetrics: 9,
    completedMetrics: 8,
    pendingMetrics: 1,
    approvedMetrics: 6,
    rejectedMetrics: 0,
    completionPercentage: 84,
    isActive: true,
  },
  {
    id: 'area-10',
    areaNumber: 10,
    name: 'Succession Planning',
    nameEn: 'Succession Planning',
    slug: 'succession-planning',
    description: 'Perencanaan suksesi: efektivitas, cakupan penerus, dan kesiapan suksesi.',
    totalMetrics: 9,
    completedMetrics: 7,
    pendingMetrics: 2,
    approvedMetrics: 5,
    rejectedMetrics: 1,
    completionPercentage: 79,
    isActive: true,
  },
  {
    id: 'area-11',
    areaNumber: 11,
    name: 'Workforce Availability',
    nameEn: 'Workforce Availability',
    slug: 'workforce-availability',
    description: 'Ketersediaan tenaga kerja: jumlah karyawan, FTE, ketidakhadiran, dan retensi.',
    totalMetrics: 7,
    completedMetrics: 7,
    pendingMetrics: 0,
    approvedMetrics: 6,
    rejectedMetrics: 0,
    completionPercentage: 93,
    isActive: true,
  },
  {
    id: 'area-12',
    areaNumber: 12,
    name: 'Learning & Development',
    nameEn: 'Learning and Development',
    slug: 'learning-development',
    description: 'Pembelajaran dan pengembangan: biaya L&D, partisipasi pelatihan, kompetensi, dan efektivitas.',
    totalMetrics: 8,
    completedMetrics: 7,
    pendingMetrics: 1,
    approvedMetrics: 6,
    rejectedMetrics: 0,
    completionPercentage: 89,
    isActive: true,
  },
];

export function getAreaBySlug(slug: string): ISOArea | undefined {
  return ISO_AREAS.find(a => a.slug === slug);
}

export function getAreaById(id: string): ISOArea | undefined {
  return ISO_AREAS.find(a => a.id === id);
}

export function getTotalMetrics(): number {
  return ISO_AREAS.reduce((sum, a) => sum + a.totalMetrics, 0);
}

export function getTotalCompleted(): number {
  return ISO_AREAS.reduce((sum, a) => sum + a.completedMetrics, 0);
}

export function getTotalPending(): number {
  return ISO_AREAS.reduce((sum, a) => sum + a.pendingMetrics, 0);
}

export function getOverallCompletion(): number {
  const total = getTotalMetrics();
  const completed = getTotalCompleted();
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}
