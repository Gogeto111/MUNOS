"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  Filter,
  Loader2,
  Trophy,
  Mic,
} from "lucide-react";
import {
  getSpeechHistory,
  getSpeechStats,
} from "@/lib/actions/speech-history";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SpeechRecord = {
  id: string;
  createdAt: Date;
  feature: string;
  transcript: string | null;
  durationSec: number | null;
  result: {
    overall: number;
    confidence: number;
    diplomacy: number;
    research: number;
    flow: number;
    speakingTimeSec: number;
    logicalFallacies: number;
    suggestions: string[];
  };
};

type SpeechStats = {
  totalSpeeches: number;
  avgScore: number;
  bestScore: number;
  avgConfidence: number;
  avgDiplomacy: number;
  avgResearch: number;
  avgFlow: number;
};

function ScoreBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-sm">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-sm font-medium tabular-nums">
        {typeof value === "number" ? value.toFixed(1) : value}
      </span>
    </div>
  );
}

function ScoreTrendChart({ scores }: { scores: SpeechRecord[] }) {
  const recent = scores.slice(0, 20).reverse();
  if (recent.length === 0) return null;

  const maxScore = Math.max(...recent.map((s) => s.result.overall), 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <BarChart3 className="size-4 text-muted-foreground" />
          Score Trend
        </CardTitle>
        <CardDescription>Your last {recent.length} speeches</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1" style={{ height: 160 }}>
          {recent.map((score, i) => {
            const height = (score.result.overall / maxScore) * 100;
            const date = new Date(score.createdAt);
            const label = `${date.getMonth() + 1}/${date.getDate()}`;
            return (
              <div
                key={score.id}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
                title={`${score.result.overall}/100 — ${label}`}
              >
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {score.result.overall}
                </span>
                <div
                  className="w-full rounded-t-sm bg-primary/70 transition-all hover:bg-primary"
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
                {i % Math.max(1, Math.floor(recent.length / 8)) === 0 && (
                  <span className="text-[9px] text-muted-foreground">{label}</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SpeechHistoryPage() {
  const [speeches, setSpeeches] = useState<SpeechRecord[]>([]);
  const [stats, setStats] = useState<SpeechStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"date" | "score">("date");
  const [filterCommittee, setFilterCommittee] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [historyResult, statsResult] = await Promise.all([
        getSpeechHistory(),
        getSpeechStats(),
      ]);
      if (historyResult.status === "success" && historyResult.data) {
        setSpeeches(historyResult.data.speeches);
      }
      if (statsResult.status === "success" && statsResult.data) {
        setStats(statsResult.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filtered = speeches
    .filter(
      (s) =>
        filterCommittee === "all" ||
        s.feature === filterCommittee,
    )
    .sort((a, b) =>
      sortBy === "score"
        ? b.result.overall - a.result.overall
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const committeeTypes = [...new Set(speeches.map((s) => s.feature))];

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Speech History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your speech scores over time and identify areas for improvement.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && stats.totalSpeeches > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Speeches
                </CardTitle>
                <BarChart3 className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-3xl font-semibold tabular-nums">
                {stats.totalSpeeches}
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Score
                </CardTitle>
                <BarChart3 className="size-4 text-blue-500" />
              </div>
              <p className="mt-2 text-3xl font-semibold tabular-nums">
                {stats.avgScore}
                <span className="text-base text-muted-foreground">/100</span>
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Best Score
                </CardTitle>
                <Trophy className="size-4 text-amber-500" />
              </div>
              <p className="mt-2 text-3xl font-semibold tabular-nums">
                {stats.bestScore}
                <span className="text-base text-muted-foreground">/100</span>
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Confidence
                </CardTitle>
                <BarChart3 className="size-4 text-emerald-500" />
              </div>
              <p className="mt-2 text-3xl font-semibold tabular-nums">
                {stats.avgConfidence}
                <span className="text-base text-muted-foreground">/10</span>
              </p>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Score Trend Chart */}
      {speeches.length > 0 && <ScoreTrendChart scores={speeches} />}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={filterCommittee} onValueChange={setFilterCommittee}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {committeeTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "score")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">By date</SelectItem>
              <SelectItem value="score">By score</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span className="text-xs text-muted-foreground">
          {filtered.length} speech{filtered.length === 1 ? "" : "es"}
        </span>
      </div>

      {/* Speech List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-muted p-3">
                <Mic className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {speeches.length === 0
                    ? "No speeches scored yet"
                    : "No speeches match the current filter"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {speeches.length === 0
                    ? "Try the AI Judge in your workspace to get started."
                    : "Try adjusting your filter criteria."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((speech) => (
            <Card key={speech.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold tabular-nums">
                        {speech.result.overall}
                        <span className="text-sm text-muted-foreground">/100</span>
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {speech.feature}
                      </Badge>
                      {speech.durationSec && (
                        <span className="text-xs text-muted-foreground">
                          ~{Math.round(speech.durationSec)}s
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(speech.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpandedId(expandedId === speech.id ? null : speech.id)
                    }
                  >
                    <ChevronDown
                      className={`size-4 transition-transform ${expandedId === speech.id ? "rotate-180" : ""}`}
                    />
                  </Button>
                </div>

                {expandedId === speech.id && (
                  <div className="mt-4 space-y-3 border-t border-border/70 pt-4">
                    <div className="space-y-2">
                      <ScoreBar label="Confidence" value={speech.result.confidence} />
                      <ScoreBar label="Diplomacy" value={speech.result.diplomacy} />
                      <ScoreBar label="Research" value={speech.result.research} />
                      <ScoreBar label="Flow" value={speech.result.flow} />
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border border-border/70 px-2 py-0.5">
                        ~{Math.max(1, Math.round(speech.result.speakingTimeSec))}s
                      </span>
                      <span className="rounded-full border border-border/70 px-2 py-0.5">
                        {speech.result.logicalFallacies} fallac{speech.result.logicalFallacies === 1 ? "y" : "ies"}
                      </span>
                    </div>
                    {speech.result.suggestions.length > 0 && (
                      <ul className="space-y-1">
                        {speech.result.suggestions.map((suggestion, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span className="shrink-0 text-muted-foreground">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
