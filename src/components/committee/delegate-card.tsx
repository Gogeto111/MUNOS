"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getCountryFlag } from "@/lib/country-flags";
import {
  Mic,
  Clock,
  MessageSquare,
  UserMinus,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Hand,
} from "lucide-react";

export interface Delegate {
  id: string;
  country: string;
  speakingTime: number;
  poisReceived: number;
  status: "present" | "present-vote" | "absent";
  queueStatus: "speaking" | "in-queue" | "yielded" | "none";
}

interface DelegateCardProps {
  delegate: Delegate;
  compact?: boolean;
  onAddToQueue?: (id: string) => void;
  onRemoveFromQueue?: (id: string) => void;
  onGrantPOI?: (id: string) => void;
  onMarkYielded?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  onRemove?: (id: string) => void;
  onAddDelegate?: (country: string) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getStatusColor(status: Delegate["queueStatus"]) {
  switch (status) {
    case "speaking":
      return "bg-emerald-500/20 border-emerald-500/40 text-emerald-400";
    case "in-queue":
      return "bg-blue-500/20 border-blue-500/40 text-blue-400";
    case "yielded":
      return "bg-amber-500/20 border-amber-500/40 text-amber-400";
    default:
      return "border-border/40";
  }
}

function getStatusBadge(status: Delegate["queueStatus"]) {
  switch (status) {
    case "speaking":
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1">
          <Mic className="size-3" /> Speaking
        </Badge>
      );
    case "in-queue":
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 gap-1">
          <Clock className="size-3" /> In Queue
        </Badge>
      );
    case "yielded":
      return (
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1">
          <Hand className="size-3" /> Yielded
        </Badge>
      );
    default:
      return null;
  }
}

export function DelegateCard({
  delegate,
  compact = false,
  onAddToQueue,
  onRemoveFromQueue,
  onGrantPOI,
  onMarkYielded,
  onToggleStatus,
  onRemove,
}: DelegateCardProps) {
  const [expanded, setExpanded] = useState(false);
  const flag = getCountryFlag(delegate.country);

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border p-2 transition-colors",
          getStatusColor(delegate.queueStatus)
        )}
      >
        <span className="text-base">{flag}</span>
        <span className="flex-1 truncate text-sm font-medium">
          {delegate.country}
        </span>
        {delegate.queueStatus !== "none" && getStatusBadge(delegate.queueStatus)}
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {formatTime(delegate.speakingTime)}
        </span>
        {onAddToQueue && delegate.queueStatus === "none" && (
          <Button
            size="sm"
            variant="ghost"
            className="size-7 p-0"
            onClick={() => onAddToQueue(delegate.id)}
          >
            <UserPlus className="size-3.5" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "transition-all",
        getStatusColor(delegate.queueStatus),
        delegate.status === "absent" && "opacity-50"
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{flag}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold truncate">
                {delegate.country}
              </h3>
              {getStatusBadge(delegate.queueStatus)}
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {formatTime(delegate.speakingTime)}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="size-3" />
                {delegate.poisReceived} POIs
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px]",
                  delegate.status === "present-vote"
                    ? "border-emerald-500/40 text-emerald-400"
                    : delegate.status === "present"
                      ? "border-blue-500/40 text-blue-400"
                      : "border-red-500/40 text-red-400"
                )}
              >
                {delegate.status === "present-vote"
                  ? "P/V"
                  : delegate.status === "present"
                    ? "P"
                    : "A"}
              </Badge>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="size-7 p-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </Button>
        </div>

        {expanded && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/30 pt-2.5">
            {delegate.queueStatus === "none" && onAddToQueue && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-xs"
                onClick={() => onAddToQueue(delegate.id)}
              >
                <UserPlus className="size-3" /> Add to Queue
              </Button>
            )}
            {delegate.queueStatus !== "none" && onRemoveFromQueue && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-xs"
                onClick={() => onRemoveFromQueue(delegate.id)}
              >
                <UserMinus className="size-3" /> Remove
              </Button>
            )}
            {onGrantPOI && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-xs"
                onClick={() => onGrantPOI(delegate.id)}
              >
                <MessageSquare className="size-3" /> Grant POI
              </Button>
            )}
            {delegate.queueStatus !== "yielded" &&
              delegate.queueStatus !== "none" &&
              onMarkYielded && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-xs"
                  onClick={() => onMarkYielded(delegate.id)}
                >
                  <Hand className="size-3" /> Yield
                </Button>
              )}
            {onToggleStatus && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-xs"
                onClick={() => onToggleStatus(delegate.id)}
              >
                {delegate.status === "absent" ? "Mark Present" : "Mark Absent"}
              </Button>
            )}
            {onRemove && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={() => onRemove(delegate.id)}
              >
                Remove Delegate
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AddDelegateForm({
  onAdd,
}: {
  onAdd: (country: string) => void;
}) {
  const [country, setCountry] = useState("");

  const handleSubmit = () => {
    if (country.trim()) {
      onAdd(country.trim());
      setCountry("");
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Country name..."
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        className="flex-1"
      />
      <Button onClick={handleSubmit} disabled={!country.trim()} size="sm">
        <UserPlus className="mr-1 size-3.5" /> Add
      </Button>
    </div>
  );
}
