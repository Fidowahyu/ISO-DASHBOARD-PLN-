import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, FileSpreadsheet, Upload, XCircle, LayoutDashboard } from '@/components/ui/icons';
import { confirmImport, uploadExcel, type ImportPreview } from '@/lib/api';

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function ExcelImportPage() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>('');

  async function handleUpload() {
    if (!file) return;
    setBusy(true);
    setMessage('');
    try {
      setPreview(await uploadExcel(file));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirm() {
    if (!preview) return;
    setBusy(true);
    try {
      await confirmImport(preview.job.id);
      setMessage(`Import completed successfully! Redirecting to Executive Dashboard...`);
      setPreview({ ...preview, job: { ...preview.job, status: 'Completed' } });

      // Automatically redirect directly to Dashboard page
      setTimeout(() => {
        navigate(`/dashboard?t=${Date.now()}`);
      }, 1200);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Import failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h2 className="text-lg font-semibold text-foreground">ISO Configuration Import</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload and validate an ISO 30414 workbook. Once confirmed, you will be redirected directly to the Executive Dashboard.
        </p>
      </div>

      <Card className="glass-card border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Upload className="h-4 w-4 text-blue-400" /> 1. Upload Excel Workbook
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="flex flex-1 cursor-pointer flex-col gap-2 text-sm font-medium">
            Workbook file
            <span className="flex h-11 items-center gap-3 rounded-md border border-dashed border-input bg-card/60 px-3 text-sm font-normal text-muted-foreground hover:border-primary hover:text-foreground transition-all">
              <FileSpreadsheet className="h-4 w-4 text-blue-400" />
              {file?.name ?? 'Choose .xlsx file'}
              <input type="file" accept=".xlsx" className="sr-only" onChange={event => setFile(event.target.files?.[0] ?? null)} />
            </span>
          </label>
          <Button type="button" disabled={!file || busy} onClick={handleUpload} className="bg-blue-600 hover:bg-blue-500 text-white">
            <Upload className="mr-2 h-4 w-4" />
            {busy ? 'Processing...' : 'Upload and Parse'}
          </Button>
        </CardContent>
      </Card>

      {message && (
        <div role="alert" className="rounded-md border border-blue-500/40 bg-blue-950/40 p-4 text-sm font-medium text-blue-300 flex items-center justify-between shadow-lg">
          <span>{message}</span>
          <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard?t=${Date.now()}`)} className="border-blue-500/40 text-blue-300 hover:bg-blue-900/50">
            <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" /> Go to Dashboard Now
          </Button>
        </div>
      )}

      {preview && (
        <>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base font-bold">2. File Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="col-span-2 rounded-md border border-border bg-background/50 p-3">
                <p className="text-xs text-muted-foreground">File name</p>
                <p className="mt-1 truncate text-sm font-semibold">{preview.job.filename}</p>
              </div>
              <Stat label="File size (KB)" value={Math.round(preview.preview.fileSize / 1024)} />
              <Stat label="Sheets detected" value={preview.preview.sheets.length} />
              <div className="col-span-2 rounded-md border border-border bg-background/50 p-3">
                <p className="text-xs text-muted-foreground">Upload date</p>
                <p className="mt-1 text-sm font-medium">{new Date(preview.preview.uploadedAt).toLocaleString()}</p>
              </div>
              <Stat label="Version" value={preview.job.versionNumber} />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base font-bold">3. Detected Structure</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-6">
              <Stat label="ISO Areas" value={preview.preview.structure.isoAreas} />
              <Stat label="Metrics" value={preview.preview.structure.metrics} />
              <Stat label="Attributes" value={preview.preview.structure.attributes} />
              <Stat label="PIC records" value={preview.preview.structure.pic} />
              <Stat label="Divisions" value={preview.preview.structure.divisions} />
              <Stat label="Formulas" value={preview.preview.structure.formulas} />
            </CardContent>
          </Card>

          <Card className="glass-card border-emerald-500/30">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>4. Validation Result</span>
                {preview.job.status === 'Completed' && (
                  <Badge variant="success" className="text-xs">Imported & Active</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-md bg-emerald-950/40 border border-emerald-500/30 p-3 text-sm font-medium text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Valid rows: {preview.preview.validation.validRows}
                </div>
                <div className="flex items-center gap-2 rounded-md bg-amber-950/40 border border-amber-500/30 p-3 text-sm font-medium text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  Warnings: {preview.preview.validation.warningRows}
                </div>
                <div className="flex items-center gap-2 rounded-md bg-red-950/40 border border-red-500/30 p-3 text-sm font-medium text-red-400">
                  <XCircle className="h-4 w-4" />
                  Errors: {preview.preview.validation.errorRows}
                </div>
              </div>

              {preview.preview.validation.issues.length > 0 && (
                <div className="max-h-56 overflow-y-auto rounded-md border border-border bg-background/50">
                  {preview.preview.validation.issues.map((issue, index) => (
                    <div key={`${issue.code}-${index}`} className="flex items-start gap-2 border-b border-border px-3 py-2 text-xs last:border-0">
                      <Badge variant={issue.severity === 'error' ? 'destructive' : 'warning'}>{issue.severity}</Badge>
                      <span>{issue.message}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => { setPreview(null); setFile(null); }}>
                  Cancel
                </Button>
                <Button
                  disabled={busy || preview.preview.validation.errorRows > 0 || preview.job.status === 'Completed'}
                  onClick={handleConfirm}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Import & Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
