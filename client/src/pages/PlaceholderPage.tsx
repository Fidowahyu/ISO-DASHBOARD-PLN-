import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from '@/components/ui/icons';

export function PlaceholderPage() {
  const location = useLocation();
  const pageName = location.pathname
    .split('/')
    .filter(Boolean)
    .map(s => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
    .join(' / ');

  return (
    <div className="flex items-center justify-center py-24">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{pageName || 'Page'}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This section will be available in a future phase.
            </p>
          </div>
          <p className="text-xs text-muted-foreground/70">
            Phase 2–7 features are currently in development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
