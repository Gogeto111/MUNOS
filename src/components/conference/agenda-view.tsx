"use client";

import { useMemo, useState } from "react";
import { format as formatDate } from "date-fns";
import { Clock, MapPin, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AgendaItem {
  id: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date | null;
  sortOrder: number;
}

const DAY_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-pink-500",
];

function groupByDay(items: AgendaItem[]) {
  const grouped = new Map<string, AgendaItem[]>();
  for (const item of items) {
    const key = new Date(item.startAt).toISOString().slice(0, 10);
    const list = grouped.get(key) ?? [];
    list.push(item);
    grouped.set(key, list);
  }
  return grouped;
}

export function AgendaView({ items }: { items: AgendaItem[] }) {
  const [activeDay, setActiveDay] = useState<string | null>(null);

  const grouped = useMemo(() => groupByDay(items), [items]);
  const days = useMemo(() => Array.from(grouped.keys()), [grouped]);

  const selectedDay = activeDay ?? days[0] ?? null;

  if (items.length === 0) return null;

  return (
    <div className="agenda-view">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {days.map((day, i) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                selectedDay === day
                  ? `${DAY_COLORS[i % DAY_COLORS.length]} text-white`
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {formatDate(new Date(day), "EEE, MMM d")}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-full"
          onClick={() => window.print()}
        >
          <Printer className="size-4" />
          Print
        </Button>
      </div>

      {selectedDay && (
        <div className="relative space-y-0">
          <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border/70 print:left-[11px]" />
          {(grouped.get(selectedDay) ?? []).map((item, i) => (
            <div key={item.id} className="relative flex gap-4 py-4 print:py-3">
              <div
                className={cn(
                  "relative z-10 mt-1 size-[11px] shrink-0 rounded-full border-2 border-background print:mt-0.5",
                  DAY_COLORS[days.indexOf(selectedDay) % DAY_COLORS.length],
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                    {formatDate(new Date(item.startAt), "h:mm a")}
                    {item.endAt
                      ? ` – ${formatDate(new Date(item.endAt), "h:mm a")}`
                      : ""}
                  </span>
                </div>
                <h3 className="mt-0.5 font-semibold">{item.title}</h3>
                {item.description ? (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @media print {
          .agenda-view { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
