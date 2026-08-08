"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryEntry {
  label: string;
  count: number;
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

export function CategoryChart({ data }: { data: CategoryEntry[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Awards by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 || total === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No awards recorded yet.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative size-40 shrink-0">
              <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                {(() => {
                  let cumulative = 0;
                  return data.map((entry, i) => {
                    const pct = (entry.count / total) * 100;
                    const dash = `${pct} ${100 - pct}`;
                    const offset = 100 - cumulative;
                    cumulative += pct;
                    return (
                      <circle
                        key={i}
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth="3.5"
                        strokeDasharray={dash}
                        strokeDashoffset={offset}
                        className="transition-all"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold tabular-nums">{total}</span>
                <span className="text-xs text-muted-foreground">total</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {data.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="inline-block size-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.label}
                  </span>
                  <span className="ml-auto text-sm font-medium tabular-nums">
                    {entry.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
