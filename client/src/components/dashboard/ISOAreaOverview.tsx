import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from '@/components/ui/icons';
import { cn, formatPercentage } from '@/lib/utils';
import type { ISOArea } from '@/types';

interface ISOAreaOverviewProps {
  areas: ISOArea[];
}

function getCompletionColor(pct: number): string {
  if (pct >= 90) return 'bg-emerald-500';
  if (pct >= 75) return 'bg-blue-500';
  if (pct >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function getCompletionBadgeVariant(pct: number): 'success' | 'info' | 'warning' | 'destructive' {
  if (pct >= 90) return 'success';
  if (pct >= 75) return 'info';
  if (pct >= 50) return 'warning';
  return 'destructive';
}

export function ISOAreaOverview({ areas }: ISOAreaOverviewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">ISO Area Completion</CardTitle>
        <Link
          to="/iso-areas"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all <ExternalLink className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {areas.map((area) => (
            <Link
              key={area.id}
              to={`/iso-areas/${area.slug}`}
              className="group flex items-center gap-4 rounded-md px-3 py-2.5 transition-colors hover:bg-accent"
            >
              {/* Area number */}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                {area.areaNumber}
              </div>

              {/* Area name + progress */}
              <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                    {area.name}
                  </span>
                  <Badge variant={getCompletionBadgeVariant(area.completionPercentage)} className="shrink-0">
                    {formatPercentage(area.completionPercentage, 0)}
                  </Badge>
                </div>
                <Progress
                  value={area.completionPercentage}
                  className="h-1.5"
                  indicatorClassName={cn(getCompletionColor(area.completionPercentage))}
                />
              </div>

              {/* Metric summary */}
              <div className="hidden shrink-0 text-right sm:block">
                <span className="text-xs text-muted-foreground">
                  {area.completedMetrics}/{area.totalMetrics} metrics
                </span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
