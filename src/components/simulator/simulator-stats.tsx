"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Trophy,
  Target,
  Star,
  BarChart3,
  Zap,
} from "lucide-react";

interface ScoringBreakdown {
  speechCount: number;
  poiCount: number;
  motionCount: number;
  totalScore: number;
  maxScore: number;
  averageScore: number;
  bestSpeech: number;
  consistency: number;
}

interface SimulatorStatsProps {
  breakdown: ScoringBreakdown;
}

export function SimulatorStats({ breakdown }: SimulatorStatsProps) {
  const scorePercentage = Math.round((breakdown.totalScore / breakdown.maxScore) * 100);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Trophy className="size-4 text-amber-500" /> Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-4xl font-bold tabular-nums text-brand-600 dark:text-brand-400">
              {breakdown.totalScore}
            </p>
            <p className="text-xs text-muted-foreground">
              out of {breakdown.maxScore} points
            </p>
            <div className="mx-auto mt-2 h-2 w-32 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${scorePercentage}%` }}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/60 p-3 text-center">
              <Zap className="mx-auto mb-1 size-4 text-amber-500" />
              <p className="text-lg font-bold tabular-nums">{breakdown.speechCount}</p>
              <p className="text-[10px] text-muted-foreground">Speeches</p>
            </div>
            <div className="rounded-lg border border-border/60 p-3 text-center">
              <Target className="mx-auto mb-1 size-4 text-brand-500" />
              <p className="text-lg font-bold tabular-nums">{breakdown.poiCount}</p>
              <p className="text-[10px] text-muted-foreground">POIs</p>
            </div>
            <div className="rounded-lg border border-border/60 p-3 text-center">
              <BarChart3 className="mx-auto mb-1 size-4 text-emerald-500" />
              <p className="text-lg font-bold tabular-nums">{breakdown.motionCount}</p>
              <p className="text-[10px] text-muted-foreground">Motions</p>
            </div>
            <div className="rounded-lg border border-border/60 p-3 text-center">
              <Star className="mx-auto mb-1 size-4 text-amber-500" />
              <p className="text-lg font-bold tabular-nums">{breakdown.bestSpeech}</p>
              <p className="text-[10px] text-muted-foreground">Best Score</p>
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Average Score</span>
              <span className="font-semibold tabular-nums">{breakdown.averageScore.toFixed(1)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Consistency</span>
              <Badge variant={breakdown.consistency > 70 ? "default" : "secondary"}>
                {breakdown.consistency > 70 ? "Strong" : "Developing"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
