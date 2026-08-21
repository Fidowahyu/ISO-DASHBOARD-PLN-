import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAreas, getMetricForm, getMetrics, getReportingPeriods, createMetricSubmission, calculateMetricSubmission, submitMetricSubmission, type ConfigurationArea, type MetricConfiguration, type ReportingPeriod, type Submission } from '@/lib/api';
import { DynamicMetricForm } from '@/components/metric/DynamicMetricForm';

function parseValidationError(error: unknown): Record<string, string> {
  if (!(error instanceof Error)) return {};
  try { const payload = JSON.parse(error.message) as { errors?: Array<{ attributeId: string; message: string }> }; return Object.fromEntries((payload.errors ?? []).map(item => [item.attributeId, item.message])); } catch { return {}; }
}

export function DynamicMetricInputPage() {
  const { metricId: routeMetricId } = useParams();
  const [periods, setPeriods] = useState<ReportingPeriod[]>([]);
  const [areas, setAreas] = useState<Array<Omit<ConfigurationArea, 'metrics'> & { _count: { metrics: number } }>>([]);
  const [metrics, setMetrics] = useState<Array<{ id: string; name: string; metricNumber: number; isoArea: { name: string } }>>([]);
  const [configuration, setConfiguration] = useState<MetricConfiguration | null>(null);
  const [periodId, setPeriodId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [metricId, setMetricId] = useState('');
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { if (routeMetricId) setMetricId(routeMetricId); }, [routeMetricId]);

  useEffect(() => { Promise.all([getReportingPeriods(), getAreas()]).then(([loadedPeriods, loadedAreas]) => { setPeriods(loadedPeriods); setAreas(loadedAreas); setPeriodId(loadedPeriods.find(period => period.status === 'Open')?.id ?? loadedPeriods[0]?.id ?? ''); }).catch(() => setMessage('Unable to load reporting configuration.')); }, []);
  useEffect(() => { if (!areaId) { setMetrics([]); return; } getMetrics(areaId).then(setMetrics).catch(() => setMessage('Unable to load metrics for this area.')); }, [areaId]);
  useEffect(() => { if (!metricId) { setConfiguration(null); return; } getMetricForm(metricId).then(loaded => { setConfiguration(loaded); setValues({}); setErrors({}); setSubmission(null); }).catch(() => setMessage('Unable to load metric configuration.')); }, [metricId]);
  useEffect(() => { if (!submission || !configuration || !Object.keys(values).length) return; const timer = window.setTimeout(() => { calculateMetricSubmission(submission.id, values).then(setSubmission).catch(error => setErrors(parseValidationError(error))); }, 700); return () => window.clearTimeout(timer); }, [JSON.stringify(values)]); // Recalculate the saved draft as values change.

  function changeValue(attributeId: string, value: unknown) { setValues(previous => ({ ...previous, [attributeId]: value })); setErrors(previous => ({ ...previous, [attributeId]: '' })); }
  async function saveDraft(showMessage = true) { if (!configuration || !periodId) return null; setBusy(true); setMessage(''); try { const saved = submission ? await calculateMetricSubmission(submission.id, values) : await createMetricSubmission({ metricId, reportingPeriodId: periodId, attributeValues: values }); setSubmission(saved); if (showMessage) setMessage('Draft saved.'); return saved; } catch (error) { setErrors(parseValidationError(error)); setMessage(error instanceof Error && !Object.keys(parseValidationError(error)).length ? error.message : 'Please review the highlighted fields.'); return null; } finally { setBusy(false); } }
  async function calculate() { await saveDraft(false); setMessage('Calculation refreshed.'); }
  async function submit() { const draft = submission ?? await saveDraft(false); if (!draft) return; setBusy(true); try { const result = await submitMetricSubmission(draft.id); setSubmission(result); setMessage('Submission sent for review.'); } catch (error) { setErrors(parseValidationError(error)); setMessage('Unable to submit this data. Please review the fields and try again.'); } finally { setBusy(false); } }

  return <div className="flex flex-col gap-6"><div><h2 className="text-lg font-semibold">Dynamic Metric Input</h2><p className="mt-1 text-sm text-muted-foreground">Complete an ISO metric using the configuration imported from PostgreSQL.</p></div><div className="grid gap-2 sm:grid-cols-5">{['Select Metric', 'Input Data', 'Calculate', 'Review', 'Submit'].map((step, index) => <div key={step} className={`border-t-2 pt-2 text-xs font-medium ${index === 0 && !configuration || index === 1 && configuration ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}>{index + 1}. {step}</div>)}</div>{message && <div role="alert" className="rounded-md border border-border bg-card p-3 text-sm">{message}</div>}<Card><CardHeader><CardTitle className="text-base">1. Select Reporting Period and Metric</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-3"><label className="text-sm font-medium">Reporting period<select className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={periodId} onChange={event => setPeriodId(event.target.value)}><option value="">Select period...</option>{periods.map(period => <option key={period.id} value={period.id}>{period.label} ({period.status})</option>)}</select></label><label className="text-sm font-medium">ISO area<select className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={areaId} onChange={event => { setAreaId(event.target.value); setMetricId(''); }}><option value="">Select area...</option>{areas.map(area => <option key={area.id} value={area.id}>{area.areaNumber}. {area.name}</option>)}</select></label><label className="text-sm font-medium">Metric<select className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={metricId} onChange={event => setMetricId(event.target.value)} disabled={!areaId}><option value="">Select metric...</option>{metrics.map(metric => <option key={metric.id} value={metric.id}>{metric.metricNumber}. {metric.name}</option>)}</select></label></CardContent></Card>{configuration && <><Card><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="text-base">{configuration.metric.name}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{configuration.metric.isoArea.name}</p></div><Badge variant="outline">{configuration.metric.metricType}</Badge></div></CardHeader><CardContent className="grid gap-4 text-sm md:grid-cols-2"><div><p className="text-xs uppercase tracking-wide text-muted-foreground">Responsible division</p><p className="mt-1">{configuration.pic.map(pic => pic.division?.code).filter(Boolean).filter((value, index, all) => all.indexOf(value) === index).join(', ') || 'Not assigned'}</p></div><div><p className="text-xs uppercase tracking-wide text-muted-foreground">PIC</p><p className="mt-1">{configuration.pic.map(pic => pic.picName).filter((value, index, all) => all.indexOf(value) === index).join(', ') || 'Not assigned'}</p></div><div className="md:col-span-2"><p className="text-xs uppercase tracking-wide text-muted-foreground">Formula</p><p className="mt-1">{configuration.formula?.formula ?? 'No formula configured.'}</p></div></CardContent></Card><Card><CardHeader><CardTitle className="text-base">2. Input Attributes</CardTitle></CardHeader><CardContent><DynamicMetricForm attributes={configuration.attributes} values={values} errors={errors} result={submission?.calculatedResult == null ? null : Number(submission.calculatedResult)} formula={configuration.formula?.formula} busy={busy || submission?.status === 'Submitted'} onChange={changeValue} onCalculate={calculate} onSaveDraft={saveDraft} onSubmit={submit} /></CardContent></Card></>}</div>;
}
