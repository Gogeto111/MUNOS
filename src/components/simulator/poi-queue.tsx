"use client";

import { useState } from "react";
import {
  Hand,
  UserCheck,
  ArrowUpRight,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface POIEntry {
  id: string;
  delegateId: string;
  country: string;
  isAi: boolean;
  status: "waiting" | "called" | "asked";
  joinedAt: number;
}

interface POIQueueProps {
  delegates: { id: string; country: string; isAi: boolean }[];
  onCallNext: (delegateId: string) => void;
  onPOIAsked: (delegateId: string) => void;
}

export function POIQueue({ delegates, onCallNext, onPOIAsked }: POIQueueProps) {
  const [queue, setQueue] = useState<POIEntry[]>([]);

  const raiseHand = (delegateId: string) => {
    const del = delegates.find((d) => d.id === delegateId);
    if (!del) return;
    if (queue.some((e) => e.delegateId === delegateId && e.status !== "asked")) return;

    const entry: POIEntry = {
      id: `poi-${Date.now()}-${delegateId}`,
      delegateId: del.id,
      country: del.country,
      isAi: del.isAi,
      status: "waiting",
      joinedAt: Date.now(),
    };
    setQueue((prev) => [...prev, entry]);
  };

  const callNext = () => {
    const next = queue.find((e) => e.status === "waiting");
    if (!next) return;

    setQueue((prev) =>
      prev.map((e) => (e.id === next.id ? { ...e, status: "called" as const } : e)),
    );
    onCallNext(next.delegateId);
  };

  const markAsked = (entryId: string) => {
    const entry = queue.find((e) => e.id === entryId);
    if (!entry) return;

    setQueue((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, status: "asked" as const } : e)),
    );
    onPOIAsked(entry.delegateId);

    setTimeout(() => {
      setQueue((prev) => prev.filter((e) => e.id !== entryId));
    }, 2000);
  };

  const removeFromQueue = (entryId: string) => {
    setQueue((prev) => prev.filter((e) => e.id !== entryId));
  };

  const waiting = queue.filter((e) => e.status === "waiting");
  const called = queue.find((e) => e.status === "called");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Hand className="size-4" /> POI Queue
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {waiting.length} waiting
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {delegates.map((d) => {
            const inQueue = queue.some(
              (e) => e.delegateId === d.id && e.status !== "asked",
            );
            return (
              <Button
                key={d.id}
                size="sm"
                variant={inQueue ? "secondary" : "outline"}
                className="gap-1 text-[10px]"
                onClick={() => raiseHand(d.id)}
                disabled={inQueue}
              >
                <Hand className="size-3" />
                {d.country}
              </Button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 gap-1.5"
            onClick={callNext}
            disabled={waiting.length === 0}
          >
            <UserCheck className="size-3.5" /> Call Next
          </Button>
        </div>

        {called && (
          <div className="rounded-lg border border-brand-500/40 bg-brand-500/5 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  Called
                </p>
                <p className="text-sm font-semibold">{called.country}</p>
              </div>
              <Button
                size="sm"
                variant="default"
                className="gap-1 text-[10px]"
                onClick={() => markAsked(called.id)}
              >
                <ArrowUpRight className="size-3" /> POI Asked
              </Button>
            </div>
          </div>
        )}

        {waiting.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Waiting
            </p>
            {waiting.map((entry, i) => (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center justify-between rounded-lg border border-border/60 p-2",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    #{i + 1}
                  </span>
                  <span className="text-xs font-medium">{entry.country}</span>
                  {entry.isAi && (
                    <Badge variant="secondary" className="text-[9px] px-1 py-0">
                      AI
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="size-6 p-0"
                  onClick={() => removeFromQueue(entry.id)}
                >
                  <Trash2 className="size-3 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {queue.length === 0 && (
          <p className="py-2 text-center text-xs text-muted-foreground">
            No POIs in queue. Delegates can raise their hand to ask a POI.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
