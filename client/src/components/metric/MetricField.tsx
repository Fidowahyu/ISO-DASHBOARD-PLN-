import type { ChangeEvent } from 'react';

export interface DynamicAttribute {
  id: string;
  name: string;
  dataType: string;
  exampleValue?: string;
  validationRules?: Record<string, unknown>;
  listOptions?: Array<{ value: string }>;
}

interface FieldProps {
  attribute: DynamicAttribute;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
}

function FieldShell({ attribute, error, children }: { attribute: DynamicAttribute; error?: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground"><span>{attribute.name}</span>{children}{attribute.exampleValue && <span className="text-xs font-normal text-muted-foreground">Example: {attribute.exampleValue}</span>}{error && <span role="alert" className="text-xs font-normal text-red-600">{error}</span>}</label>;
}

const inputClass = 'h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20';

export function NumberField({ attribute, value, error, onChange }: FieldProps) { return <FieldShell attribute={attribute} error={error}><input className={inputClass} type="number" value={value == null ? '' : String(value)} onChange={event => onChange(event.target.value === '' ? '' : Number(event.target.value))} /></FieldShell>; }
export function TextField({ attribute, value, error, onChange }: FieldProps) { return <FieldShell attribute={attribute} error={error}><input className={inputClass} type="text" value={value == null ? '' : String(value)} onChange={event => onChange(event.target.value)} /></FieldShell>; }
export function PercentageField({ attribute, value, error, onChange }: FieldProps) { return <FieldShell attribute={attribute} error={error}><div className="relative"><input className={`${inputClass} w-full pr-9`} type="number" min="0" max="100" step="0.01" value={value == null ? '' : String(value)} onChange={event => onChange(event.target.value === '' ? '' : Number(event.target.value))} /><span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span></div></FieldShell>; }
export function CurrencyField({ attribute, value, error, onChange }: FieldProps) { return <FieldShell attribute={attribute} error={error}><input className={inputClass} type="number" min="0" step="0.01" value={value == null ? '' : String(value)} onChange={event => onChange(event.target.value === '' ? '' : Number(event.target.value))} /></FieldShell>; }
export function DateField({ attribute, value, error, onChange }: FieldProps) { return <FieldShell attribute={attribute} error={error}><input className={inputClass} type="date" value={value == null ? '' : String(value)} onChange={event => onChange(event.target.value)} /></FieldShell>; }
export function BooleanField({ attribute, value, error, onChange }: FieldProps) { return <FieldShell attribute={attribute} error={error}><select className={inputClass} value={value == null ? '' : String(value)} onChange={event => onChange(event.target.value === '' ? '' : event.target.value === 'true')}><option value="">Select...</option><option value="true">Yes</option><option value="false">No</option></select></FieldShell>; }
export function SelectField({ attribute, value, error, onChange }: FieldProps) { return <FieldShell attribute={attribute} error={error}><select className={inputClass} value={value == null ? '' : String(value)} onChange={event => onChange(event.target.value)}><option value="">Select...</option>{attribute.listOptions?.map(option => <option key={option.value} value={option.value}>{option.value}</option>)}</select></FieldShell>; }
export function MultiSelectField({ attribute, value, error, onChange }: FieldProps) { const selected = Array.isArray(value) ? value.map(String) : []; return <FieldShell attribute={attribute} error={error}><select multiple className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring" value={selected} onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(Array.from(event.target.selectedOptions, option => option.value))}>{attribute.listOptions?.map(option => <option key={option.value} value={option.value}>{option.value}</option>)}</select></FieldShell>; }

export function MetricField(props: FieldProps) {
  switch (props.attribute.dataType) {
    case 'Number': case 'Integer': case 'Decimal': case 'Year': return <NumberField {...props} />;
    case 'Percentage': return <PercentageField {...props} />;
    case 'Currency': return <CurrencyField {...props} />;
    case 'Date': return <DateField {...props} />;
    case 'Boolean': return <BooleanField {...props} />;
    case 'List': return <SelectField {...props} />;
    case 'MultiSelect': return <MultiSelectField {...props} />;
    default: return <TextField {...props} />;
  }
}
