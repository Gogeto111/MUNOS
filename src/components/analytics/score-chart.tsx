"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoreEntry {
  label: string;
  score: number;
}

export function ScoreChart({ data }: { data: ScoreEntry[] }) {
  const max = Math.max(...data.map((d) => d.score), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Speech Scores Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No scores recorded yet.
          </p>
        ) : (
          <div className="flex items-end gap-2" style={{ height: 200 }}>
            {data.map((entry, i) => (
              <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                  {entry.score}
                </span>
                <div
                  className="w-full rounded-t-sm bg-brand-500 transition-all"
                  style={{ height: `${(entry.score / max) * 160}px`, minHeight: 4 }}
                />
                <span className="w-full truncate text-center text-[10px] text-muted-foreground">
                  {entry.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
