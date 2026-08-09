"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, AlertTriangle, Clock, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type TimerMode = "gsl" | "moderated" | "unmoderated" | "poi" | "speech" | "custom";

interface TimerPreset {
  key: TimerMode;
  label: string;
  icon: string;
  durations: number[];
}

const TIMER_PRESETS: TimerPreset[] = [
  { key: "gsl", label: "GSL", icon: "🎤", durations: [30, 45, 60, 75, 90, 120] },
  { key: "moderated", label: "Moderated Caucus", icon: "⚖️", durations: [30, 45, 60, 90] },
  { key: "unmoderated", label: "Unmoderated Caucus", icon: "🤝", durations: [300, 600, 900, 1200] },
  { key: "poi", label: "POI", icon: "💬", durations: [10, 15, 20, 30] },
  { key: "speech", label: "Speech Prep", icon: "📝", durations: [120, 300, 600, 900] },
  { key: "custom", label: "Custom", icon: "⏱️", durations: [] },
];

export function LiveTimer() {
  const [mode, setMode] = useState<TimerMode>("gsl");
  const [duration, setDuration] = useState(60);
  const [customSeconds, setCustomSeconds] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<{ mode: string; duration: number; finished: boolean; timestamp: number }[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalDuration = mode === "custom" ? (parseInt(customSeconds) || 60) : duration;
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
  const isWarning = timeLeft <= 10 && timeLeft > 5;
  const isCritical = timeLeft <= 5;
  const isOvertime = timeLeft <= 0;

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            playAlert();
            setHistory((h) => [...h.slice(-19), { mode, duration: totalDuration, finished: true, timestamp: Date.now() }]);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode, totalDuration]);

  const playAlert = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  }, []);

  const start = () => { if (timeLeft > 0) setRunning(true); };
  const pause = () => { setRunning(false); };
  const reset = () => {
    setRunning(false);
    setTimeLeft(mode === "custom" ? (parseInt(customSeconds) || 60) : duration);
  };
  const addTime = (sec: number) => {
    setTimeLeft((t) => t + sec);
  };

  const selectPreset = (preset: TimerPreset) => {
    setMode(preset.key);
    if (preset.durations.length > 0) {
      setDuration(preset.durations[2] || preset.durations[0]);
      setTimeLeft(preset.durations[2] || preset.durations[0]);
    }
    setRunning(false);
  };

  const selectDuration = (d: number) => {
    setDuration(d);
    setTimeLeft(d);
    setRunning(false);
  };

  const formatTime = (s: number) => {
    const abs = Math.abs(s);
    const m = Math.floor(abs / 60);
    const sec = abs % 60;
    const sign = s < 0 ? "-" : "";
    return `${sign}${m}:${sec.toString().padStart(2, "0")}`;
  };

  const modeLabel = TIMER_PRESETS.find((p) => p.key === mode)?.label || "Custom";

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          Live Timer
          {running && <Badge variant="outline" className="ml-auto text-[10px] animate-pulse">RUNNING</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode selector */}
        <div className="flex flex-wrap gap-1.5">
          {TIMER_PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => selectPreset(p)}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                mode === p.key
                  ? "border-brand-500 bg-brand-500/10 text-brand-600"
                  : "border-border/60 bg-card/60 text-muted-foreground hover:bg-muted"
              )}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>

        {/* Duration presets */}
        {mode !== "custom" && (
          <div className="flex flex-wrap gap-1.5">
            {TIMER_PRESETS.find((p) => p.key === mode)?.durations.map((d) => (
              <button
                key={d}
                onClick={() => selectDuration(d)}
                className={cn(
                  "rounded-md border px-2 py-1 text-xs transition-colors",
                  duration === d && timeLeft === d && !running
                    ? "border-brand-500 bg-brand-500/10 text-brand-600"
                    : "border-border/40 text-muted-foreground hover:bg-muted"
                )}
              >
                {d >= 60 ? `${d / 60}m` : `${d}s`}
              </button>
            ))}
          </div>
        )}

        {mode === "custom" && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Seconds"
              value={customSeconds}
              onChange={(e) => {
                setCustomSeconds(e.target.value);
                setTimeLeft(parseInt(e.target.value) || 0);
                setRunning(false);
              }}
              className="h-8 text-xs"
            />
            <span className="text-xs text-muted-foreground">sec</span>
          </div>
        )}

        {/* Timer display */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              "font-mono text-5xl font-bold tabular-nums transition-colors",
              isOvertime ? "text-red-500 animate-pulse" :
              isCritical ? "text-red-500" :
              isWarning ? "text-amber-500" :
              "text-foreground"
            )}
          >
            {formatTime(timeLeft)}
          </div>
          <div className="text-xs text-muted-foreground">{modeLabel} · {formatTime(totalDuration)} total</div>

          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                isOvertime ? "bg-red-500" :
                isCritical ? "bg-red-500" :
                isWarning ? "bg-amber-500" :
                "bg-brand-500"
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Warning banners */}
          {isOvertime && (
            <div className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-600">
              <AlertTriangle className="h-3 w-3" />
              OVERTIME — {Math.abs(timeLeft)}s over
            </div>
          )}
          {isWarning && !isOvertime && (
            <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600">
              <Bell className="h-3 w-3" />
              {timeLeft}s remaining
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="outline" onClick={() => addTime(-10)} className="h-8 text-xs">-10s</Button>
          {!running ? (
            <Button size="sm" onClick={start} className="h-8 px-4 text-xs" disabled={timeLeft <= 0}>
              <Play className="mr-1 h-3 w-3" /> Start
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={pause} className="h-8 px-4 text-xs">
              <Pause className="mr-1 h-3 w-3" /> Pause
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={reset} className="h-8 text-xs">
            <RotateCcw className="mr-1 h-3 w-3" /> Reset
          </Button>
          <Button size="sm" variant="outline" onClick={() => addTime(10)} className="h-8 text-xs">+10s</Button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Recent</div>
            <div className="flex flex-wrap gap-1">
              {history.slice(-8).reverse().map((h, i) => (
                <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {h.mode} {formatTime(h.duration)} {h.finished ? "✓" : "中途"}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
