import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { getAreas } from '@/lib/api';

export function ISOAreaListPage() {
  const [areas, setAreas] = useState<Array<{ id: string; areaNumber: number; name: string; _count: { metrics: number } }>>([]);
  const [error, setError] = useState('');
  useEffect(() => { getAreas().then(setAreas).catch(value => setError(value instanceof Error ? value.message : 'Unable to load ISO areas.')); }, []);
  return <div className="flex flex-col gap-6"><div><h2 className="text-lg font-semibold">ISO Areas</h2><p className="mt-1 text-sm text-muted-foreground">Configured ISO 30414 areas from PostgreSQL.</p></div>{error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}{!error && areas.length === 0 && <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">No ISO areas have been configured yet.</CardContent></Card>}<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{areas.map(area => <Link key={area.id} to={`/iso-areas/${area.id}`} className="group"><Card className="h-full transition-shadow hover:shadow-md"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">{area.areaNumber}</div><h3 className="text-sm font-semibold group-hover:text-primary">{area.name}</h3></div><span className="text-xs text-muted-foreground">{area._count.metrics} metrics</span></div></CardContent></Card></Link>)}</div></div>;
}
