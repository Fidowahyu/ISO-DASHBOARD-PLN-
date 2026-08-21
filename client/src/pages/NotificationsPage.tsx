import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getNotifications, markNotificationRead } from '@/lib/api';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Awaited<ReturnType<typeof getNotifications>>>([]);
  const [error, setError] = useState('');
  useEffect(() => { getNotifications().then(setNotifications).catch(value => setError(value instanceof Error ? value.message : 'Unable to load notifications.')); }, []);
  async function markRead(id: string) { await markNotificationRead(id); setNotifications(items => items.map(item => item.id === id ? { ...item, readAt: new Date().toISOString() } : item)); }
  return <div className="flex flex-col gap-6"><div><h2 className="text-lg font-semibold">Notifications</h2><p className="mt-1 text-sm text-muted-foreground">Review workflow updates for your submissions.</p></div>{error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}<Card><CardHeader><CardTitle className="text-base">Recent notifications</CardTitle></CardHeader><CardContent className="divide-y divide-border p-0">{notifications.map(item => <div key={item.id} className={`flex items-start justify-between gap-4 px-4 py-4 ${item.readAt ? '' : 'bg-primary/[0.03]'}`}><div><p className="text-sm font-medium">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{item.message}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p></div>{!item.readAt && <Button variant="outline" size="sm" onClick={() => markRead(item.id)}>Mark read</Button>}</div>)}{notifications.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No notifications.</p>}</CardContent></Card></div>;
}
