"use client";

import { useCallback, useEffect, useState } from "react";
import { Gavel, History, Loader2, Sparkles } from "lucide-react";
import { listAiScores, scoreSpeech } from "@/lib/actions/ai-sources";
import type { AiScoreResult } from "@/lib/ai/judge-parse";
import { SectionCard } from "@/components/profile/section-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ScoreRecord {
  id: string;
  createdAt: Date;
  result: AiScoreResult;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const percent = Math.max(0, Math.min(100, value * 10));
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-sm">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-sm font-medium tabular-nums">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

export function ScoreCard({ score }: { score: AiScoreResult }) {
  return (
    <div className="rounded-lg border border-border/70 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-muted-foreground">Overall</p>
        <p className="text-3xl font-semibold tabular-nums">
          {score.overall}
          <span className="text-base text-muted-foreground">/100</span>
        </p>
      </div>
      <div className="mt-4 space-y-2.5">
        <ScoreBar label="Confidence" value={score.confidence} />
        <ScoreBar label="Diplomacy" value={score.diplomacy} />
        <ScoreBar label="Research depth" value={score.research} />
        <ScoreBar label="Flow & structure" value={score.flow} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border border-border/70 px-2 py-0.5">
          ~{Math.max(1, Math.round(score.speakingTimeSec))}s speaking time
        </span>
        <span className="rounded-full border border-border/70 px-2 py-0.5">
          {score.logicalFallacies} logical fallac{score.logicalFallacies === 1 ? "y" : "ies"}
        </span>
      </div>
      {score.suggestions.length > 0 ? (
        <ul className="mt-3 space-y-1 border-t border-border/70 pt-3">
          {score.suggestions.map((suggestion, index) => (
            <li key={index} className="flex gap-2 text-sm">
              <span className="shrink-0 text-muted-foreground">•</span>
              {suggestion}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * AI Judge — scores a debate speech (transcript) against an MUN rubric and
 * keeps a recent score history. The voice debate mode feeds results here.
 */
export function JudgeSection({ workspaceId }: { workspaceId: string }) {
  const [transcript, setTranscript] = useState("");
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [score, setScore] = useState<AiScoreResult | null>(null);
  const [history, setHistory] = useState<ScoreRecord[]>([]);

  const refreshHistory = useCallback(async () => {
    const result = await listAiScores(workspaceId);
    if (result.status === "success" && result.data) setHistory(result.data.scores);
  }, [workspaceId]);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  const handleScore = async () => {
    if (!transcript.trim()) {
      toast.error("Nothing to score — paste or record a speech first.");
      return;
    }
    setIsScoring(true);
    try {
      const result = await scoreSpeech(workspaceId, {
        transcript,
        durationSec: durationSec ?? undefined,
      });
      if (result.status === "success" && result.data) {
        setScore(result.data.score);
        setTranscript("");
        setDurationSec(null);
        await refreshHistory();
        toast.success("Speech scored.");
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsScoring(false);
    }
  };

  return (
    <SectionCard
      title="AI judge"
      description="Score a speech against an MUN rubric — confidence, diplomacy, research depth, flow — with concrete coaching suggestions."
      icon={Gavel}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="judge-transcript">Speech transcript</Label>
          <Textarea
            id="judge-transcript"
            rows={5}
            placeholder="Paste the speech transcript here, or run Voice Debate Mode and hit “Judge this round”…"
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            className="mt-1.5 resize-y"
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Label htmlFor="judge-duration" className="text-xs text-muted-foreground">
              Speaking time (sec)
            </Label>
            <input
              id="judge-duration"
              type="number"
              min={0}
              max={600}
              className="h-8 w-20 rounded-md border border-input bg-transparent px-2 text-sm"
              placeholder="auto"
              value={durationSec ?? ""}
              onChange={(event) =>
                setDurationSec(
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
            />
            <Button
              type="button"
              size="sm"
              onClick={() => void handleScore()}
              disabled={isScoring || !transcript.trim()}
            >
              {isScoring ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Judge this speech
            </Button>
          </div>
        </div>

        {score ? <ScoreCard score={score} /> : null}

        {history.length > 0 ? (
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium">
              <History className="size-4" />
              Recent rounds
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {history.slice(0, 6).map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium tabular-nums">
                      {entry.result.overall}
                      <span className="text-xs text-muted-foreground">/100</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                    onClick={() => setScore(entry.result)}
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}
