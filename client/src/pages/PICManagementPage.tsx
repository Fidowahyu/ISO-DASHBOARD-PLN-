import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPIC } from '@/lib/api';

interface PICRow { id: string; picName: string; picYear: string; metric: { name: string; isoArea: { name: string } }; division?: { code: string; name: string } }

export function PICManagementPage() {
  const [year, setYear] = useState('2026');
  const [rows, setRows] = useState<PICRow[]>([]);
  const [error, setError] = useState('');
  useEffect(() => { getPIC(year).then(setRows).catch(value => setError(value instanceof Error ? value.message : 'Unable to load PIC assignments.')); }, [year]);
  const grouped = rows.reduce<Record<string, PICRow[]>>((result, row) => { const key = row.division?.code ?? 'Unassigned'; (result[key] ??= []).push(row); return result; }, {});

  return <div className="flex flex-col gap-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="text-lg font-semibold">PIC Management</h2><p className="mt-1 text-sm text-muted-foreground">Review metric responsibility by division and reporting year.</p></div><label className="text-sm font-medium">PIC year<select value={year} onChange={event => setYear(event.target.value)} className="ml-2 h-9 rounded-md border border-input bg-background px-3 text-sm"><option>2026</option><option>2024</option></select></label></div>{error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}<Card><CardHeader><CardTitle className="text-base">Division / PIC / Year / Number of Metrics</CardTitle></CardHeader><CardContent className="overflow-x-auto p-0"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Division</th><th className="px-4 py-3">PIC</th><th className="px-4 py-3">Year</th><th className="px-4 py-3">Metric</th><th className="px-4 py-3">ISO Area</th></tr></thead><tbody>{Object.entries(grouped).flatMap(([division, divisionRows]) => divisionRows.map(row => <tr key={row.id} className="border-b border-border last:border-0"><td className="px-4 py-3 font-medium">{division}</td><td className="px-4 py-3"><Link className="hover:text-primary hover:underline" to={`/administration/pic/${row.id}`}>{row.picName}</Link></td><td className="px-4 py-3">{row.picYear}</td><td className="px-4 py-3">{row.metric.name}</td><td className="px-4 py-3 text-muted-foreground">{row.metric.isoArea.name}</td></tr>))}</tbody></table>{rows.length === 0 && !error && <p className="p-6 text-center text-sm text-muted-foreground">No PIC assignments for this year.</p>}</CardContent></Card></div>;
}
