import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPICDashboard } from '@/lib/api';

export function PICDetailPage() {
  const { id = '' } = useParams();
  const [data, setData] = useState<Awaited<ReturnType<typeof getPICDashboard>> | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { getPICDashboard(id).then(setData).catch(value => setError(value instanceof Error ? value.message : 'Unable to load PIC detail.')); }, [id]);
  if (error) return <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Loading PIC detail...</p>;
  const first = data.assignments[0];
  const completed = data.assignments.filter(item => ['Submitted', 'UnderReview', 'Approved'].includes(item.metric.metricValues[0]?.status ?? '')).length;
  return <div className="flex flex-col gap-6"><Link to="/administration/pic" className="text-sm text-muted-foreground hover:text-foreground">← PIC Management</Link><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">PIC</p><h2 className="mt-1 text-xl font-semibold">{first?.picName ?? 'PIC detail'}</h2><p className="mt-1 text-sm text-muted-foreground">{first?.division?.code ?? 'Unassigned'} · {data.period?.label ?? 'No period'}</p></div><div className="grid grid-cols-3 gap-4"><Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Assigned Metrics</p><p className="mt-1 text-2xl font-semibold">{data.assignments.length}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Completed</p><p className="mt-1 text-2xl font-semibold">{completed}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pending</p><p className="mt-1 text-2xl font-semibold">{data.assignments.length - completed}</p></CardContent></Card></div><Card><CardHeader><CardTitle className="text-base">Assigned Metrics</CardTitle></CardHeader><CardContent className="divide-y divide-border p-0">{data.assignments.map(item => { const status = item.metric.metricValues[0]?.status ?? 'Missing'; return <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3"><div><p className="text-sm font-medium">{item.metric.name}</p><p className="text-xs text-muted-foreground">{item.metric.isoArea.name}</p></div><Badge variant={status === 'Approved' ? 'success' : 'warning'}>{status}</Badge></div>; })}</CardContent></Card></div>;
}
