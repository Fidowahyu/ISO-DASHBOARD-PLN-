import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuditLogs } from '@/lib/api';

export function AuditLogPage() {
  const [logs, setLogs] = useState<Awaited<ReturnType<typeof getAuditLogs>>>([]);
  const [error, setError] = useState('');
  useEffect(() => { getAuditLogs().then(setLogs).catch(value => setError(value instanceof Error ? value.message : 'Unable to load audit trail.')); }, []);
  return <div className="flex flex-col gap-6"><div><h2 className="text-lg font-semibold">Audit Log</h2><p className="mt-1 text-sm text-muted-foreground">Append-only record of important system activity.</p></div>{error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}<Card><CardHeader><CardTitle className="text-base">Audit events</CardTitle></CardHeader><CardContent className="overflow-x-auto p-0"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Timestamp</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Entity</th><th className="px-4 py-3">Description</th></tr></thead><tbody>{logs.map(log => <tr key={log.id} className="border-b border-border"><td className="px-4 py-3 text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td><td className="px-4 py-3">{log.user?.fullName ?? 'System'}</td><td className="px-4 py-3 font-medium">{log.action}</td><td className="px-4 py-3"><Link className="text-primary hover:underline" to={`/administration/audit-log/${log.id}`}>{log.entityType} · {log.entityId ?? '—'}</Link></td><td className="px-4 py-3 text-muted-foreground">{log.description ?? '—'}</td></tr>)}{logs.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">No audit events available.</td></tr>}</tbody></table></CardContent></Card></div>;
}
