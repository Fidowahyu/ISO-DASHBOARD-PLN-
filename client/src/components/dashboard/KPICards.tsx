import { Card, CardContent } from '@/components/ui/card';
import { DynamicIcon } from '@/components/ui/icons';
import { cn, formatNumber } from '@/lib/utils';
import type { DashboardKPI } from '@/types';

interface KPICardsProps {
  kpis: DashboardKPI[];
}

export function KPICards({ kpis }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {kpi.label}
                </span>
                <span className="text-2xl font-bold text-foreground tabular-nums">
                  {formatNumber(kpi.value)}{kpi.suffix ?? ''}
                </span>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/8">
                <DynamicIcon name={kpi.icon} className="h-4.5 w-4.5 text-primary" />
              </div>
            </div>
            {kpi.trendValue && (
              <div className="mt-3 flex items-center gap-1.5">
                <span
                  className={cn(
                    'inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-semibold',
                    kpi.trend === 'up' && 'bg-emerald-50 text-emerald-700',
                    kpi.trend === 'down' && 'bg-emerald-50 text-emerald-700',
                    kpi.trend === 'neutral' && 'bg-slate-100 text-slate-600'
                  )}
                >
                  {kpi.trendValue}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
