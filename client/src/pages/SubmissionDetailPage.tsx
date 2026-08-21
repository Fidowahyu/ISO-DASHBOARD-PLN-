import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSubmission, type Submission } from '@/lib/api';

export function SubmissionDetailPage() {
  const { id = '' } = useParams();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { getSubmission(id).then(setSubmission).catch(value => setError(value instanceof Error ? value.message : 'Unable to load submission.')); }, [id]);
  if (error) return <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>;
  if (!submission) return <p className="text-sm text-muted-foreground">Loading submission...</p>;
  return <div className="flex flex-col gap-6"><Link to="/data-management/submissions" className="text-sm text-muted-foreground hover:text-foreground">← Back to submissions</Link><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">{submission.metric.name}</h2><p className="mt-1 text-sm text-muted-foreground">{submission.reportingPeriod.label}</p></div><Badge variant={submission.status === 'Submitted' ? 'info' : 'secondary'}>{submission.status}</Badge></div><Card><CardHeader><CardTitle className="text-base">Submitted values</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{Object.entries(submission.attributeValues).map(([attributeId, value]) => <div key={attributeId} className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">{attributeId}</p><p className="mt-1 text-sm font-medium">{Array.isArray(value) ? value.join(', ') : String(value)}</p></div>)}<div className="rounded-md border border-primary/20 bg-primary/[0.03] p-3 sm:col-span-2"><p className="text-xs text-muted-foreground">Calculated result</p><p className="mt-1 text-2xl font-semibold text-primary">{submission.calculatedResult == null ? 'Not calculated' : Number(submission.calculatedResult).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p></div></CardContent></Card></div>;
}
