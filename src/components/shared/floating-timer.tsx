"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Timer, Play, Pause, RotateCcw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TimerMode = "countdown" | "stopwatch";
type TimerStatus = "idle" | "running" | "paused";

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(Math.abs(totalSeconds) / 60);
  const secs = Math.abs(totalSeconds) % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "square";
    gain.gain.value = 0.3;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Web Audio not available
  }
}

export function FloatingTimer() {
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<TimerMode>("countdown");
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [remaining, setRemaining] = useState(300);
  const [inputMin, setInputMin] = useState("5");
  const [inputSec, setInputSec] = useState("00");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const alertedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Reset on route change (simple: just collapse and reset)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        clearTimer();
        if (status === "running") setStatus("paused");
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [clearTimer, status]);

  useEffect(() => {
    if (status !== "running") {
      clearTimer();
      return;
    }

    alertedRef.current = false;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (mode === "countdown") {
          if (prev <= 1) {
            clearTimer();
            setStatus("idle");
            if (!alertedRef.current) {
              playBeep();
              alertedRef.current = true;
            }
            return 0;
          }
          return prev - 1;
        } else {
          return prev + 1;
        }
      });
    }, 1000);

    return () => clearTimer();
  }, [status, mode, clearTimer]);

  const handleStart = () => {
    if (mode === "countdown" && status === "idle") {
      const m = parseInt(inputMin) || 0;
      const s = parseInt(inputSec) || 0;
      const total = m * 60 + s;
      if (total <= 0) return;
      setRemaining(total);
    }
    setStatus("running");
  };

  const handlePause = () => setStatus("paused");

  const handleReset = () => {
    clearTimer();
    setStatus("idle");
    if (mode === "countdown") {
      const m = parseInt(inputMin) || 0;
      const s = parseInt(inputSec) || 0;
      setRemaining(m * 60 + s);
    } else {
      setRemaining(0);
    }
  };

  const handleModeSwitch = (newMode: TimerMode) => {
    clearTimer();
    setStatus("idle");
    setMode(newMode);
    if (newMode === "countdown") {
      const m = parseInt(inputMin) || 0;
      const s = parseInt(inputSec) || 0;
      setRemaining(m * 60 + s);
    } else {
      setRemaining(0);
    }
  };

  const isLow = mode === "countdown" && remaining <= 30 && remaining > 0 && status === "running";
  const display = mode === "countdown" ? remaining : remaining;
  const timeStr = formatTime(display);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className={cn(
          "fixed bottom-20 right-4 z-50 flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm font-mono shadow-lg transition-all hover:shadow-xl sm:bottom-6",
          isLow && "animate-pulse border-red-500/50 text-red-500",
        )}
        aria-label="Open debate timer"
      >
        <Timer className="size-3.5" />
        {timeStr}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-20 right-4 z-50 w-64 rounded-xl border bg-background p-3 shadow-xl sm:bottom-6",
        isLow && "border-red-500/50",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">Debate Timer</span>
        <button
          onClick={() => setExpanded(false)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Collapse timer"
        >
          <ChevronDown className="size-4" />
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => handleModeSwitch("countdown")}
          className={cn(
            "flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
            mode === "countdown"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          Countdown
        </button>
        <button
          onClick={() => handleModeSwitch("stopwatch")}
          className={cn(
            "flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
            mode === "stopwatch"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          Stopwatch
        </button>
      </div>

      {/* Time display */}
      <div
        className={cn(
          "text-center font-mono text-3xl font-bold py-3 mb-3 rounded-lg bg-muted/50",
          isLow && "text-red-500 animate-pulse",
        )}
      >
        {timeStr}
      </div>

      {/* Countdown input */}
      {mode === "countdown" && status === "idle" && (
        <div className="flex items-center justify-center gap-1 mb-3">
          <Input
            type="number"
            min={0}
            max={99}
            value={inputMin}
            onChange={(e) => setInputMin(e.target.value)}
            className="h-8 w-14 text-center text-sm font-mono"
            placeholder="mm"
          />
          <span className="text-muted-foreground font-mono">:</span>
          <Input
            type="number"
            min={0}
            max={59}
            value={inputSec}
            onChange={(e) => setInputSec(e.target.value)}
            className="h-8 w-14 text-center text-sm font-mono"
            placeholder="ss"
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-2">
        {status !== "running" ? (
          <Button size="sm" onClick={handleStart} className="gap-1">
            <Play className="size-3" />
            Start
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={handlePause} className="gap-1">
            <Pause className="size-3" />
            Pause
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={handleReset} className="gap-1">
          <RotateCcw className="size-3" />
          Reset
        </Button>
      </div>
    </div>
  );
}
