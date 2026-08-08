"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SpeakingTimerProps {
  speakerName?: string;
  maxSeconds?: number;
  warningAt?: number;
  onTimeUp?: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getTimerColor(elapsed: number, max: number): string {
  const remaining = max - elapsed;
  if (remaining <= 5) return "text-red-500";
  if (remaining <= 15) return "text-amber-500";
  if (remaining <= 30) return "text-orange-400";
  return "text-emerald-500";
}

function getProgressColor(elapsed: number, max: number): string {
  const pct = (elapsed / max) * 100;
  if (pct >= 97.5) return "bg-red-500";
  if (pct >= 75) return "bg-amber-500";
  if (pct >= 62.5) return "bg-orange-400";
  return "bg-emerald-500";
}

export function SpeakingTimer({
  speakerName,
  maxSeconds = 120,
  warningAt = 15,
  onTimeUp,
}: SpeakingTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firedTimeUp = useRef(false);

  const stop = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setElapsed(0);
    firedTimeUp.current = false;
  }, [stop]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= maxSeconds) {
            stop();
            return maxSeconds;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, maxSeconds, stop]);

  useEffect(() => {
    if (elapsed >= maxSeconds && !firedTimeUp.current) {
      firedTimeUp.current = true;
      onTimeUp?.();
    }
  }, [elapsed, maxSeconds, onTimeUp]);

  const remaining = maxSeconds - elapsed;
  const progressPct = Math.min((elapsed / maxSeconds) * 100, 100);
  const colorClass = getTimerColor(elapsed, maxSeconds);
  const progressColor = getProgressColor(elapsed, maxSeconds);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Clock className="size-4" />
          Speaking Timer
          {speakerName && (
            <span className="text-xs font-normal text-muted-foreground">
              — {speakerName}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <span
            className={cn(
              "text-4xl font-bold tabular-nums transition-colors",
              colorClass,
            )}
          >
            {formatTime(elapsed)}
          </span>
          <span className="ml-2 text-sm text-muted-foreground">
            / {formatTime(maxSeconds)}
          </span>
        </div>

        <div className="relative">
          <Progress value={progressPct} className="h-3" />
          <div
            className={cn(
              "absolute inset-0 h-3 rounded-full transition-all",
              progressColor,
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {remaining <= warningAt && remaining > 0 && (
          <p className="text-center text-xs font-medium text-amber-500">
            {remaining <= 5 ? "Time nearly up!" : `${remaining}s remaining`}
          </p>
        )}

        {elapsed >= maxSeconds && (
          <p className="text-center text-xs font-medium text-red-500">
            Time exceeded!
          </p>
        )}

        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant={running ? "secondary" : "default"}
            onClick={() => setRunning(!running)}
            disabled={elapsed >= maxSeconds}
            className="gap-1.5"
          >
            {running ? (
              <>
                <Pause className="size-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="size-3.5" /> Start
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={reset} className="gap-1.5">
            <RotateCcw className="size-3.5" /> Reset
          </Button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>
            Green: &gt; {formatTime(maxSeconds - 30)}
          </span>
          <span>
            Amber: &gt; {formatTime(maxSeconds - 15)}
          </span>
          <span>Red: &gt; {formatTime(maxSeconds - 5)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
