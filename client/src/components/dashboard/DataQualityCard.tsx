import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPercentage } from '@/lib/utils';
import type { DataQualityScore } from '@/types';

interface DataQualityCardProps {
  score: DataQualityScore;
}

interface QualityDimension {
  label: string;
  value: number;
  key: keyof DataQualityScore;
}

const dimensions: QualityDimension[] = [
  { label: 'Completeness', value: 0, key: 'completeness' },
  { label: 'Accuracy', value: 0, key: 'accuracy' },
  { label: 'Consistency', value: 0, key: 'consistency' },
  { label: 'Timeliness', value: 0, key: 'timeliness' },
];

function getScoreColor(value: number): string {
  if (value >= 90) return 'text-emerald-600';
  if (value >= 75) return 'text-blue-600';
  if (value >= 50) return 'text-amber-600';
  return 'text-red-600';
}

function getBarColor(value: number): string {
  if (value >= 90) return 'bg-emerald-500';
  if (value >= 75) return 'bg-blue-500';
  if (value >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

export function DataQualityCard({ score }: DataQualityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Data Quality Score</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Overall Score */}
        <div className="mb-5 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <span className={`text-4xl font-bold tabular-nums ${getScoreColor(score.overall)}`}>
              {score.overall}
            </span>
            <span className="text-xs text-muted-foreground mt-1">Overall Score</span>
          </div>
        </div>

        {/* Dimension bars */}
        <div className="flex flex-col gap-3">
          {dimensions.map((dim) => {
            const value = score[dim.key];
            return (
              <div key={dim.key} className="flex items-center gap-3">
                <span className="w-24 text-xs text-muted-foreground">{dim.label}</span>
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getBarColor(value)}`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
                <span className={`w-10 text-right text-xs font-semibold tabular-nums ${getScoreColor(value)}`}>
                  {formatPercentage(value, 0)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
