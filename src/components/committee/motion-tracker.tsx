"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  History,
} from "lucide-react";

export type MotionType =
  | "moderated-caucus"
  | "unmoderated-caucus"
  | "close-debate"
  | "extend-debate"
  | "suspend-rules"
  | "introduce-resolution"
  | "amend-resolution"
  | "vote-resolution"
  | "other";

const MOTION_LABELS: Record<MotionType, string> = {
  "moderated-caucus": "Moderated Caucus",
  "unmoderated-caucus": "Unmoderated Caucus",
  "close-debate": "Close Debate",
  "extend-debate": "Extend Debate",
  "suspend-rules": "Suspend Rules",
  "introduce-resolution": "Introduce Resolution",
  "amend-resolution": "Amend Resolution",
  "vote-resolution": "Vote on Resolution",
  other: "Other Motion",
};

export interface Motion {
  id: string;
  type: MotionType;
  details: string;
  proposedBy: string;
  status: "active" | "passed" | "failed" | "withdrawn";
  votes: { for: number; against: number; abstain: number };
  totalVoters: number;
  timestamp: number;
  duration?: number;
}

interface MotionTrackerProps {
  motions: Motion[];
  activeMotion: Motion | null;
  onCreateMotion: (
    type: MotionType,
    details: string,
    proposedBy: string,
    duration?: number
  ) => void;
  onVote: (motionId: string, vote: "for" | "against" | "abstain") => void;
  onSetStatus: (
    motionId: string,
    status: Motion["status"]
  ) => void;
  totalDelegates: number;
}

export function MotionTracker({
  motions,
  activeMotion,
  onCreateMotion,
  onVote,
  onSetStatus,
  totalDelegates,
}: MotionTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [motionType, setMotionType] = useState<MotionType>("moderated-caucus");
  const [details, setDetails] = useState("");
  const [proposer, setProposer] = useState("");
  const [duration, setDuration] = useState("");

  const handleCreate = () => {
    if (!details.trim() || !proposer.trim()) return;
    onCreateMotion(
      motionType,
      details.trim(),
      proposer.trim(),
      duration ? parseInt(duration) : undefined
    );
    setDetails("");
    setProposer("");
    setDuration("");
    setShowForm(false);
  };

  const passedMotions = motions.filter((m) => m.status === "passed");
  const failedMotions = motions.filter((m) => m.status === "failed");

  return (
    <div className="space-y-3">
      {/* Active Motion */}
      {activeMotion && (
        <Card className="border-blue-500/30 bg-blue-500/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="size-4 text-blue-400" />
                Active Motion
              </CardTitle>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {MOTION_LABELS[activeMotion.type]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{activeMotion.details}</p>
            <p className="text-xs text-muted-foreground">
              Proposed by {activeMotion.proposedBy}
              {activeMotion.duration && ` • ${activeMotion.duration} min`}
            </p>

            {/* Vote Tally */}
            <div className="space-y-2">
              <div className="flex items-center gap-4 text-center">
                <div className="flex-1">
                  <div className="flex items-center justify-center gap-1 text-emerald-400">
                    <ThumbsUp className="size-3" />
                    <span className="text-lg font-bold tabular-nums">
                      {activeMotion.votes.for}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">For</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-center gap-1 text-red-400">
                    <ThumbsDown className="size-3" />
                    <span className="text-lg font-bold tabular-nums">
                      {activeMotion.votes.against}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Against</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground">
                    <Minus className="size-3" />
                    <span className="text-lg font-bold tabular-nums">
                      {activeMotion.votes.abstain}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Abstain</p>
                </div>
              </div>

              {/* Visual Bar */}
              <div className="h-2.5 overflow-hidden rounded-full bg-muted/30 flex">
                {activeMotion.totalVoters > 0 && (
                  <>
                    <div
                      className="bg-emerald-500 transition-all"
                      style={{
                        width: `${(activeMotion.votes.for / activeMotion.totalVoters) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-red-500 transition-all"
                      style={{
                        width: `${(activeMotion.votes.against / activeMotion.totalVoters) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-muted-foreground/50 transition-all"
                      style={{
                        width: `${(activeMotion.votes.abstain / activeMotion.totalVoters) * 100}%`,
                      }}
                    />
                  </>
                )}
              </div>

              {/* Vote Buttons */}
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  onClick={() => onVote(activeMotion.id, "for")}
                >
                  <ThumbsUp className="size-3" /> For
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => onVote(activeMotion.id, "against")}
                >
                  <ThumbsDown className="size-3" /> Against
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1"
                  onClick={() => onVote(activeMotion.id, "abstain")}
                >
                  <Minus className="size-3" /> Abstain
                </Button>
              </div>

              {/* Pass/Fail Actions */}
              <div className="flex gap-1.5 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  onClick={() => onSetStatus(activeMotion.id, "passed")}
                >
                  <CheckCircle2 className="size-3" /> Pass Motion
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => onSetStatus(activeMotion.id, "failed")}
                >
                  <XCircle className="size-3" /> Fail Motion
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Motion */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Plus className="size-4" /> New Motion
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancel" : "Create"}
            </Button>
          </div>
        </CardHeader>
        {showForm && (
          <CardContent className="space-y-2.5">
            <Select
              value={motionType}
              onValueChange={(v) => setMotionType(v as MotionType)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(MOTION_LABELS) as [MotionType, string][]).map(
                  ([key, label]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <Input
              placeholder="Motion details..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="h-8 text-xs"
            />
            <div className="flex gap-2">
              <Input
                placeholder="Proposed by..."
                value={proposer}
                onChange={(e) => setProposer(e.target.value)}
                className="h-8 flex-1 text-xs"
              />
              <Input
                type="number"
                placeholder="Min"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="h-8 w-20 text-xs"
              />
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={handleCreate}
              disabled={!details.trim() || !proposer.trim()}
            >
              Create Motion
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Motion History */}
      {motions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <History className="size-4" /> Motion History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[20vh]">
              <div className="space-y-1.5">
                {motions.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-2 text-xs",
                      m.status === "passed"
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : m.status === "failed"
                          ? "border-red-500/30 bg-red-500/5"
                          : "border-border/30"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="text-[9px] shrink-0"
                        >
                          {MOTION_LABELS[m.type]}
                        </Badge>
                        <span className="truncate">{m.details}</span>
                      </div>
                      <p className="mt-0.5 text-muted-foreground">
                        {m.proposedBy} •{" "}
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-muted-foreground tabular-nums">
                        {m.votes.for}-{m.votes.against}-{m.votes.abstain}
                      </span>
                      <Badge
                        className={cn(
                          "text-[9px]",
                          m.status === "passed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : m.status === "failed"
                              ? "bg-red-500/20 text-red-400"
                              : m.status === "withdrawn"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-blue-500/20 text-blue-400"
                        )}
                      >
                        {m.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
