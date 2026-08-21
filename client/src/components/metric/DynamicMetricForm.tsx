import { MetricField, type DynamicAttribute } from './MetricField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DynamicMetricFormProps {
  attributes: DynamicAttribute[];
  values: Record<string, unknown>;
  errors: Record<string, string>;
  result?: number | null;
  formula?: string;
  busy?: boolean;
  onChange: (attributeId: string, value: unknown) => void;
  onCalculate: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

export function FormulaPreview({ formula, result }: { formula?: string; result?: number | null }) {
  if (!formula && result == null) return null;
  return <Card className="border-primary/20 bg-primary/[0.03]"><CardHeader><CardTitle className="text-sm">Calculation Preview</CardTitle></CardHeader><CardContent className="space-y-2"><p className="text-xs text-muted-foreground">{formula ?? 'No formula configured.'}</p>{result != null && <p className="text-2xl font-semibold tabular-nums text-primary">{result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>}</CardContent></Card>;
}

export function ValidationMessage({ errors }: { errors: Record<string, string> }) { const messages = Object.values(errors); return messages.length ? <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{messages.length} validation error{messages.length > 1 ? 's' : ''} found. Review the highlighted fields.</div> : null; }

export function DynamicMetricForm({ attributes, values, errors, result, formula, busy, onChange, onCalculate, onSaveDraft, onSubmit }: DynamicMetricFormProps) {
  return <div className="flex flex-col gap-5"><ValidationMessage errors={errors} /><div className="grid gap-4 md:grid-cols-2">{attributes.map(attribute => <MetricField key={attribute.id} attribute={attribute} value={values[attribute.id]} error={errors[attribute.id]} onChange={value => onChange(attribute.id, value)} />)}</div><FormulaPreview formula={formula} result={result} /><div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4"><Button variant="outline" type="button" disabled={busy} onClick={onSaveDraft}>Save Draft</Button><Button variant="secondary" type="button" disabled={busy} onClick={onCalculate}>Calculate</Button><Button type="button" disabled={busy} onClick={onSubmit}>Submit for Review</Button></div></div>;
}
