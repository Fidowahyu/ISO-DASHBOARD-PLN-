import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ISO_AREAS } from '@/data/iso-areas';

interface StatItem {
  label: string;
  value: number;
  color: string;
}

export function MetricSummaryCard() {
  const totalMetrics = ISO_AREAS.reduce((s, a) => s + a.totalMetrics, 0);
  const totalApproved = ISO_AREAS.reduce((s, a) => s + a.approvedMetrics, 0);
  const totalPending = ISO_AREAS.reduce((s, a) => s + a.pendingMetrics, 0);
  const totalRejected = ISO_AREAS.reduce((s, a) => s + a.rejectedMetrics, 0);
  const totalDraft = totalMetrics - totalApproved - totalPending - totalRejected;

  const stats: StatItem[] = [
    { label: 'Approved', value: totalApproved, color: 'bg-emerald-500' },
    { label: 'Pending', value: totalPending, color: 'bg-amber-500' },
    { label: 'Rejected', value: totalRejected, color: 'bg-red-500' },
    { label: 'Draft', value: totalDraft, color: 'bg-slate-400' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Metric Status Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stacked bar */}
        <div className="mb-4 flex h-3 w-full overflow-hidden rounded-full bg-muted">
          {stats
            .filter(s => s.value > 0)
            .map((stat) => (
              <div
                key={stat.label}
                className={`${stat.color} transition-all`}
                style={{ width: `${(stat.value / totalMetrics) * 100}%` }}
              />
            ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-sm ${stat.color}`} />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground tabular-nums">{stat.value}</span>
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
