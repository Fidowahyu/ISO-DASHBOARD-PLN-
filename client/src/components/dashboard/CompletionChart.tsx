import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ISOArea } from '@/types';

interface CompletionChartProps {
  areas: ISOArea[];
}

const COLORS = {
  high: '#16a34a',
  medium: '#2563eb',
  low: '#d97706',
  critical: '#dc2626',
};

function getColor(pct: number): string {
  if (pct >= 90) return COLORS.high;
  if (pct >= 75) return COLORS.medium;
  if (pct >= 50) return COLORS.low;
  return COLORS.critical;
}

export function CompletionChart({ areas }: CompletionChartProps) {
  const chartData = areas.map(a => ({
    name: a.areaNumber.toString(),
    fullName: a.name,
    completion: a.completionPercentage,
    completed: a.completedMetrics,
    total: a.totalMetrics,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Completion by Area</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 4, left: -20, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const data = payload[0].payload as (typeof chartData)[0];
                  return (
                    <div className="rounded-md border border-border bg-card px-3 py-2 shadow-sm">
                      <p className="text-xs font-semibold text-foreground">{data.fullName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {data.completed}/{data.total} metrics ({data.completion}%)
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="completion" radius={[3, 3, 0, 0]} barSize={28}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.completion)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS.high }} />
            <span className="text-[10px] text-muted-foreground">≥90%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS.medium }} />
            <span className="text-[10px] text-muted-foreground">75–89%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS.low }} />
            <span className="text-[10px] text-muted-foreground">50–74%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS.critical }} />
            <span className="text-[10px] text-muted-foreground">&lt;50%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
