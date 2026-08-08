"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ConferenceEvent {
  id: string;
  name: string;
  slug: string;
  startDate: string;
  endDate: string;
  city: string;
  country: string;
  difficulty: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  FIRST_TIMER: "bg-emerald-500",
  BEGINNER: "bg-blue-500",
  INTERMEDIATE: "bg-amber-500",
  ADVANCED: "bg-orange-500",
  EXPERT: "bg-rose-500",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  FIRST_TIMER: "First Timer",
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function sameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isInRange(date: Date, start: Date, end: Date) {
  const d = date.getTime();
  return d >= start.getTime() && d <= end.getTime();
}

export function CalendarGrid({
  conferences,
  initialMonth,
  initialYear,
}: {
  conferences: ConferenceEvent[];
  initialMonth: number;
  initialYear: number;
}) {
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthLabel = new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const conferencesOnDay = (day: number) => {
    const date = new Date(year, month, day);
    return conferences.filter((c) => {
      const start = new Date(c.startDate);
      const end = new Date(c.endDate);
      return sameDay(date, start) || isInRange(date, start, end);
    });
  };

  const startsOnDay = (day: number) => {
    const date = new Date(year, month, day);
    return conferences.filter((c) => sameDay(date, new Date(c.startDate)));
  };

  const selectedConferences =
    selectedDay !== null ? startsOnDay(selectedDay) : [];

  const cellConferences = Array.from({ length: daysInMonth }, (_, i) =>
    conferencesOnDay(i + 1),
  );
  const maxPerDay = Math.max(...cellConferences.map((c) => c.length), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{monthLabel}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prev}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={next}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px rounded-xl border border-border/60 bg-border/60">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="bg-muted/50 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-background p-2" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const events = conferencesOnDay(day);
          const hasEvents = events.length > 0;
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={`relative flex min-h-[72px] flex-col bg-background p-2 text-left transition-colors hover:bg-muted/50 ${
                isSelected ? "ring-2 ring-brand-500 ring-inset" : ""
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  hasEvents ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {day}
              </span>
              {hasEvents && (
                <div className="mt-auto flex flex-wrap gap-0.5">
                  {events.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        DIFFICULTY_COLORS[e.difficulty] || "bg-gray-400"
                      }`}
                    />
                  ))}
                  {events.length > 3 && (
                    <span className="text-[9px] text-muted-foreground">
                      +{events.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Difficulty Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className={`inline-block size-2 rounded-full ${DIFFICULTY_COLORS[key]}`}
            />
            {label}
          </div>
        ))}
      </div>

      {/* Selected Day Detail */}
      {selectedDay !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Conferences starting on {monthLabel.split(" ")[0]} {selectedDay}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedConferences.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No conferences start on this day.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedConferences.map((c) => (
                  <Link
                    key={c.id}
                    href={`/conference/${c.slug}`}
                    className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.city}, {c.country}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-3 shrink-0">
                      {DIFFICULTY_LABELS[c.difficulty] || c.difficulty}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
