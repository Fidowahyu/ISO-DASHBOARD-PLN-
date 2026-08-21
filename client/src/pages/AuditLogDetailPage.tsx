import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuditLog } from '@/lib/api';

export function AuditLogDetailPage() {
  const { id = '' } = useParams();
  const [log, setLog] = useState<Awaited<ReturnType<typeof getAuditLog>> | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { getAuditLog(id).then(setLog).catch(value => setError(value instanceof Error ? value.message : 'Unable to load audit event.')); }, [id]);
  if (error) return <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>;
  if (!log) return <p className="text-sm text-muted-foreground">Loading audit event...</p>;
  return <div className="flex flex-col gap-6"><Link to="/administration/audit-log" className="text-sm text-muted-foreground hover:text-foreground">← Audit Log</Link><Card><CardHeader><CardTitle className="text-base">Audit Event</CardTitle></CardHeader><CardContent className="grid gap-4 text-sm md:grid-cols-2"><div><p className="text-xs text-muted-foreground">Action</p><p className="mt-1 font-medium">{log.action}</p></div><div><p className="text-xs text-muted-foreground">User</p><p className="mt-1">{log.user?.fullName ?? 'System'}</p></div><div><p className="text-xs text-muted-foreground">Timestamp</p><p className="mt-1">{new Date(log.createdAt).toLocaleString()}</p></div><div><p className="text-xs text-muted-foreground">Entity</p><p className="mt-1">{log.entityType} · {log.entityId ?? '—'}</p></div><div className="md:col-span-2"><p className="text-xs text-muted-foreground">Description</p><p className="mt-1">{log.description ?? '—'}</p></div><div><p className="text-xs text-muted-foreground">Old Value</p><pre className="mt-1 max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(log.oldValues, null, 2)}</pre></div><div><p className="text-xs text-muted-foreground">New Value</p><pre className="mt-1 max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(log.newValues, null, 2)}</pre></div></CardContent></Card></div>;
}
