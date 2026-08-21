import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RecentActivity } from '@/data/dashboard';

interface RecentActivityCardProps {
  activities: RecentActivity[];
}

function getActivityBadgeVariant(type: RecentActivity['type']): 'success' | 'info' | 'destructive' | 'warning' {
  switch (type) {
    case 'approve': return 'success';
    case 'submit': return 'info';
    case 'reject': return 'destructive';
    case 'update': return 'warning';
  }
}

function getActivityLabel(type: RecentActivity['type']): string {
  switch (type) {
    case 'approve': return 'Approved';
    case 'submit': return 'Submitted';
    case 'reject': return 'Rejected';
    case 'update': return 'Updated';
  }
}

export function RecentActivityCard({ activities }: RecentActivityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {activities.map((activity, idx) => (
            <div
              key={activity.id}
              className={cn(
                'flex items-start gap-3 py-3',
                idx < activities.length - 1 && 'border-b border-border'
              )}
            >
              {/* User avatar */}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                {activity.user.split(' ').map(w => w[0]).join('').substring(0, 2)}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {activity.user}
                  </span>
                  <Badge variant={getActivityBadgeVariant(activity.type)} className="shrink-0">
                    {getActivityLabel(activity.type)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {activity.metric} — {activity.area}
                </p>
                <span className="text-[10px] text-muted-foreground/70">{activity.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
