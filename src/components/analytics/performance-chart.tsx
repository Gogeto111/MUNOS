"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DataPoint {
  label: string;
  value: number;
}

const LINE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];
const BAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-lime-500",
];

export function LineChart({
  data,
  title,
  colorIndex = 0,
}: {
  data: DataPoint[];
  title: string;
  colorIndex?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const color = LINE_COLORS[colorIndex % LINE_COLORS.length];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No data available yet.
          </p>
        ) : (
          <div className="relative" style={{ height: 220 }}>
            {/* Y-axis labels */}
            <div className="absolute inset-y-0 left-0 flex flex-col justify-between py-2 text-[10px] tabular-nums text-muted-foreground">
              <span>{max}</span>
              <span>{Math.round(max * 0.75)}</span>
              <span>{Math.round(max * 0.5)}</span>
              <span>{Math.round(max * 0.25)}</span>
              <span>0</span>
            </div>

            {/* Chart area */}
            <div className="ml-8 flex h-[200px] items-end gap-1 border-b border-l border-border/50 pl-1 pt-2">
              {/* Grid lines */}
              <div className="pointer-events-none absolute inset-y-2 left-8 right-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-t border-border/30" />
                ))}
              </div>

              {/* Data line via SVG */}
              <svg
                className="absolute inset-y-2 left-8 right-0 bottom-2"
                viewBox={`0 0 ${Math.max(data.length - 1, 1)} 100`}
                preserveAspectRatio="none"
              >
                <polyline
                  points={data
                    .map(
                      (d, i) =>
                        `${(i / Math.max(data.length - 1, 1)) * 100},${100 - (d.value / max) * 100}`,
                    )
                    .join(" ")}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                {data.map((d, i) => (
                  <circle
                    key={i}
                    cx={(i / Math.max(data.length - 1, 1)) * 100}
                    cy={100 - (d.value / max) * 100}
                    r="3"
                    fill={color}
                    className="r-3 transition-all hover:r-5"
                  />
                ))}
              </svg>

              {/* X-axis labels */}
              <div className="absolute inset-x-0 bottom-0 flex justify-between px-1">
                {data.map((d, i) => (
                  <span
                    key={i}
                    className="min-w-0 flex-1 truncate text-center text-[10px] text-muted-foreground"
                  >
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function BarChart({
  data,
  title,
  colorMode = "sequential",
}: {
  data: DataPoint[];
  title: string;
  colorMode?: "sequential" | "single";
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No data available yet.
          </p>
        ) : (
          <div className="flex items-end gap-2" style={{ height: 200 }}>
            {data.map((entry, i) => (
              <div
                key={i}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
              >
                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                  {entry.value}
                </span>
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    colorMode === "single"
                      ? "bg-brand-500"
                      : BAR_COLORS[i % BAR_COLORS.length]
                  }`}
                  style={{
                    height: `${(entry.value / max) * 160}px`,
                    minHeight: entry.value > 0 ? 4 : 0,
                  }}
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

export function PieChart({
  data,
  title,
}: {
  data: { label: string; count: number }[];
  title: string;
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 || total === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No data available yet.
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
