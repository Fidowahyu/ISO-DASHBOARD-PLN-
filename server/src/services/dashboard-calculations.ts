export function completionScore(completed: number, total: number): number | null {
  return total > 0 ? Math.round((completed / total) * 1000) / 10 : null;
}

export function dashboardKpis(statusCounts: { approved: number; submitted: number; underReview: number; rejected: number; needsRevision: number; draft: number }, totalMetrics: number) {
  const completed = statusCounts.approved + statusCounts.submitted + statusCounts.underReview;
  return { totalMetrics, completed, pending: statusCounts.submitted + statusCounts.underReview, approved: statusCounts.approved, needsAttention: statusCounts.rejected + statusCounts.needsRevision + statusCounts.draft, completion: completionScore(completed, totalMetrics) };
}
