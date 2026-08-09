"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getCountryFlag } from "@/lib/country-flags";
import type { Delegate } from "./delegate-card";
import {
  GripVertical,
  X,
  Hand,
  ChevronRight,
  Timer,
} from "lucide-react";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface SpeakingQueueProps {
  queue: string[];
  delegates: Delegate[];
  currentIndex: number;
  speakerTimeRemaining: number;
  speakerTimeTotal: number;
  onRemove: (id: string) => void;
  onYield: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onSkip: () => void;
}

export function SpeakingQueue({
  queue,
  delegates,
  currentIndex,
  speakerTimeRemaining,
  speakerTimeTotal,
  onRemove,
  onYield,
  onReorder,
  onSkip,
}: SpeakingQueueProps) {
  const getDelegate = (id: string) =>
    delegates.find((d) => d.id === id);

  const progressPct =
    speakerTimeTotal > 0
      ? ((speakerTimeTotal - speakerTimeRemaining) / speakerTimeTotal) * 100
      : 0;

  const timeColor =
    speakerTimeRemaining <= 10
      ? "text-red-400"
      : speakerTimeRemaining <= 30
        ? "text-amber-400"
        : "text-emerald-400";

  return (
    <div className="flex h-full flex-col">
      {/* Current Speaker Display */}
      {currentIndex >= 0 && currentIndex < queue.length && (
        <div className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="size-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">
                Current Speaker
              </span>
            </div>
            <span
              className={cn(
                "font-mono text-lg font-bold tabular-nums",
                timeColor
              )}
            >
              {formatTime(speakerTimeRemaining)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xl">
              {getCountryFlag(
                getDelegate(queue[currentIndex])?.country ?? ""
              )}
            </span>
            <span className="font-semibold">
              {getDelegate(queue[currentIndex])?.country}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/30">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-2 flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="h-7 flex-1 gap-1 text-xs"
              onClick={onSkip}
            >
              <ChevronRight className="size-3" /> Skip
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 flex-1 gap-1 text-xs"
              onClick={() => onYield(queue[currentIndex])}
            >
              <Hand className="size-3" /> Yield
            </Button>
          </div>
        </div>
      )}

      {/* Queue List */}
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-xs font-medium text-muted-foreground">
          Speaking Queue
        </span>
        <Badge variant="outline" className="text-[10px]">
          {queue.length} delegate{queue.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {queue.length === 0 && (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No delegates in queue
            </p>
          )}
          {queue.map((id, index) => {
            const delegate = getDelegate(id);
            if (!delegate) return null;
            const isCurrent = index === currentIndex;
            const isPast = index < currentIndex;
            const flag = getCountryFlag(delegate.country);

            return (
              <div
                key={id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors",
                  isCurrent
                    ? "border-emerald-500/40 bg-emerald-500/15"
                    : isPast
                      ? "border-border/20 opacity-40"
                      : "border-border/30 hover:bg-muted/20"
                )}
              >
                <GripVertical className="size-3.5 cursor-grab text-muted-foreground/50" />
                <span
                  className={cn(
                    "w-5 text-center text-xs font-bold tabular-nums",
                    isCurrent ? "text-emerald-400" : "text-muted-foreground"
                  )}
                >
                  {index + 1}
                </span>
                <span className="text-sm">{flag}</span>
                <span
                  className={cn(
                    "flex-1 truncate text-sm",
                    isCurrent && "font-semibold"
                  )}
                >
                  {delegate.country}
                </span>
                {isCurrent && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                    Speaking
                  </Badge>
                )}
                {!isCurrent && !isPast && (
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {index > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="size-6 p-0"
                        onClick={() => onReorder(index, index - 1)}
                      >
                        ↑
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="size-6 p-0"
                      onClick={() => onReorder(index, index + 1)}
                    >
                      ↓
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="size-6 p-0 text-red-400 hover:text-red-300"
                      onClick={() => onRemove(id)}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
