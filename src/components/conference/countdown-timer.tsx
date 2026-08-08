"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  startDate: string | Date;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(target: Date): TimeLeft {
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function urgencyStyle(daysLeft: number, started: boolean): {
  container: string;
  segment: string;
  label: string;
  badge: string;
} {
  if (started) {
    return {
      container: "bg-muted/50",
      segment: "text-muted-foreground",
      label: "text-muted-foreground",
      badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    };
  }
  if (daysLeft > 30) {
    return {
      container: "bg-muted/30",
      segment: "text-muted-foreground",
      label: "text-muted-foreground",
      badge: "bg-muted text-muted-foreground",
    };
  }
  if (daysLeft >= 7) {
    return {
      container: "bg-amber-50 dark:bg-amber-950/30",
      segment: "text-amber-700 dark:text-amber-400",
      label: "text-amber-600 dark:text-amber-500",
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    };
  }
  return {
    container: "bg-red-50 dark:bg-red-950/30",
    segment: "text-red-600 dark:text-red-400",
    label: "text-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 animate-pulse",
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function CountdownTimer({ startDate, className }: CountdownTimerProps) {
  const target = React.useMemo(
    () => (typeof startDate === "string" ? new Date(startDate) : startDate),
    [startDate],
  );

  const [timeLeft, setTimeLeft] = React.useState<TimeLeft>(() =>
    calculateTimeLeft(target),
  );

  React.useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(calculateTimeLeft(target));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const started = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;
  const styles = urgencyStyle(timeLeft.days, started);

  if (started) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", styles.badge)}>
          Started
        </span>
      </div>
    );
  }

  const segments: { value: string; label: string }[] = [
    { value: pad(timeLeft.days), label: "Days" },
    { value: pad(timeLeft.hours), label: "Hours" },
    { value: pad(timeLeft.minutes), label: "Min" },
    { value: pad(timeLeft.seconds), label: "Sec" },
  ];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className={cn("text-xs font-medium uppercase tracking-wider", styles.label)}>
        Starts in
      </span>
      <div className={cn("flex items-center gap-1 rounded-xl p-2", styles.container)}>
        {segments.map((seg, i) => (
          <React.Fragment key={seg.label}>
            {i > 0 && <span className={cn("text-lg font-light", styles.segment)}>:</span>}
            <div className="flex flex-col items-center px-1.5">
              <span className={cn("text-xl font-bold tabular-nums", styles.segment)}>
                {seg.value}
              </span>
              <span className={cn("text-[10px] font-medium uppercase", styles.label)}>
                {seg.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
