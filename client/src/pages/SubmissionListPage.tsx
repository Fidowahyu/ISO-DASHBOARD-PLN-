import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSubmissions, type Submission } from '@/lib/api';

export function SubmissionListPage({ status }: { status?: string }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState('');
  useEffect(() => { getSubmissions().then(setSubmissions).catch(value => setError(value instanceof Error ? value.message : 'Unable to load submissions.')); }, []);
  const filtered = status ? submissions.filter(submission => submission.status === status) : submissions;
  return <div className="flex flex-col gap-6"><div><h2 className="text-lg font-semibold">{status ? `${status} submissions` : 'Metric submissions'}</h2><p className="mt-1 text-sm text-muted-foreground">Draft and submitted metric values from the reporting database.</p></div>{error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}<Card><CardHeader><CardTitle className="text-base">Submission history</CardTitle></CardHeader><CardContent className="p-0"><div className="divide-y divide-border">{filtered.map(submission => <Link key={submission.id} to={`/data-management/submissions/${submission.id}`} className="flex flex-col gap-2 px-4 py-4 hover:bg-accent sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium">{submission.metric.name}</p><p className="mt-1 text-xs text-muted-foreground">{submission.reportingPeriod.label}</p></div><div className="flex items-center gap-3"><span className="text-sm font-semibold tabular-nums">{submission.calculatedResult == null ? 'Not calculated' : Number(submission.calculatedResult).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span><Badge variant={submission.status === 'Submitted' ? 'info' : 'secondary'}>{submission.status}</Badge></div></Link>)}{filtered.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No submissions found.</p>}</div></CardContent></Card></div>;
}
