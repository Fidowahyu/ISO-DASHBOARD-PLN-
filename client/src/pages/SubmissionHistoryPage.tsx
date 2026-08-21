import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getReviewHistory } from '@/lib/api';

export function SubmissionHistoryPage() {
  const { id = '' } = useParams();
  const [history, setHistory] = useState<Awaited<ReturnType<typeof getReviewHistory>> | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { getReviewHistory(id).then(setHistory).catch(value => setError(value instanceof Error ? value.message : 'Unable to load history.')); }, [id]);
  if (error) return <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>;
  if (!history) return <p className="text-sm text-muted-foreground">Loading version history...</p>;
  return <div className="flex flex-col gap-6"><Link to={`/submissions/${id}`} className="text-sm text-muted-foreground hover:text-foreground">← Submission Detail</Link><Card><CardHeader><CardTitle className="text-base">Submission Version History</CardTitle></CardHeader><CardContent className="space-y-4">{history.versions.map(version => <div key={version.id} className="rounded-md border border-border p-4"><div className="flex items-center justify-between"><p className="font-medium">Version {version.version}</p><Badge variant="outline">{version.status}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{version.createdBy?.fullName ?? 'System'} · {new Date(version.createdAt).toLocaleString()}</p><pre className="mt-3 overflow-x-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(version.attributeValues, null, 2)}</pre><p className="mt-2 text-sm">Calculated result: {version.calculatedResult == null ? 'Not calculated' : String(version.calculatedResult)}</p></div>)}{history.versions.length === 0 && <p className="text-sm text-muted-foreground">No version snapshots yet.</p>}</CardContent></Card></div>;
}
