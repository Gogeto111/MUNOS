"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, BarChart, PieChart } from "./performance-chart";
import { InsightsPanel } from "./insights-panel";
import {
  Calendar,
  Trophy,
  Clock,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface ConferenceEntry {
  name: string;
  date: string;
  score: number;
  committee: string;
  speakingMinutes: number;
  rank?: number;
  totalDelegates?: number;
}

interface ConferenceAnalyticsProps {
  conferences: ConferenceEntry[];
  scores: { label: string; value: number }[];
  committeeDistribution: { label: string; count: number }[];
  speakingData: { label: string; value: number }[];
  monthlyScores: { label: string; value: number }[];
}

function filterByTimeRange(
  conferences: ConferenceEntry[],
  range: string,
): ConferenceEntry[] {
  if (range === "all") return conferences;
  const now = new Date();
  const cutoff = new Date();
  if (range === "month") cutoff.setMonth(now.getMonth() - 1);
  if (range === "quarter") cutoff.setMonth(now.getMonth() - 3);
  return conferences.filter((c) => new Date(c.date) >= cutoff);
}

function computeRankPercentile(
  rank?: number,
  total?: number,
): string | null {
  if (!rank || !total || total === 0) return null;
  const pct = Math.round(((total - rank + 1) / total) * 100);
  return `Top ${100 - pct}%`;
}

export function ConferenceAnalytics({
  conferences,
  scores,
  committeeDistribution,
  speakingData,
  monthlyScores,
}: ConferenceAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("all");

  const filtered = filterByTimeRange(conferences, timeRange);

  const totalConferences = filtered.length;
  const avgScore =
    filtered.length > 0
      ? Math.round(
          filtered.reduce((sum, c) => sum + c.score, 0) / filtered.length,
        )
      : 0;
  const totalSpeakingHours =
    Math.round(
      (filtered.reduce((sum, c) => sum + c.speakingMinutes, 0) / 60) * 10,
    ) / 10;

  // Best rank percentile
  const rankedConferences = filtered.filter(
    (c) => c.rank && c.totalDelegates,
  );
  const bestRankPercentile =
    rankedConferences.length > 0
      ? rankedConferences.reduce((best, c) => {
          const pct = computeRankPercentile(c.rank, c.totalDelegates);
          return pct && pct < best ? pct : best;
        }, "Top 100%")
      : null;

  // Trend
  const recentScores = filtered.slice(-3).map((c) => c.score);
  const earlierScores = filtered.slice(0, Math.max(filtered.length - 3, 1)).map((c) => c.score);
  const recentAvg = recentScores.length
    ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
    : 0;
  const earlierAvg = earlierScores.length
    ? earlierScores.reduce((a, b) => a + b, 0) / earlierScores.length
    : 0;
  const scoreTrend =
    recentAvg > earlierAvg + 3
      ? "up"
      : recentAvg < earlierAvg - 3
        ? "down"
        : "flat";

  // Filtered committee distribution
  const filteredCommittees = new Map<string, number>();
  for (const c of filtered) {
    filteredCommittees.set(
      c.committee,
      (filteredCommittees.get(c.committee) || 0) + 1,
    );
  }
  const filteredCommitteeData = [...filteredCommittees.entries()]
    .map(([name, count]) => ({ label: name, count }))
    .sort((a, b) => b.count - a.count);

  // Filtered speaking data
  const filteredSpeaking = new Map<string, number>();
  for (const c of filtered) {
    filteredSpeaking.set(
      c.committee,
      (filteredSpeaking.get(c.committee) || 0) + c.speakingMinutes,
    );
  }
  const filteredSpeakingData = [...filteredSpeaking.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  // Filtered score timeline
  const filteredScoreTimeline = filtered.map((c) => ({
    label: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
    value: c.score,
  }));

  const stats = [
    {
      label: "Total Conferences",
      value: totalConferences,
      icon: Calendar,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Average Score",
      value: avgScore || "—",
      icon: Trophy,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Speaking Hours",
      value: totalSpeakingHours || "—",
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Rank Percentile",
      value: bestRankPercentile || "—",
      icon: Percent,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Conference Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your performance across conferences and sessions.
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`rounded-lg p-1.5 ${stat.bg}`}>
                  <stat.icon className={`size-4 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-3xl font-semibold tabular-nums">
                  {stat.value}
                </p>
                {stat.label === "Average Score" && scoreTrend !== "flat" && (
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      scoreTrend === "up"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {scoreTrend === "up" ? (
                      <ArrowUpRight className="size-3" />
                    ) : (
                      <ArrowDownRight className="size-3" />
                    )}
                    {scoreTrend === "up" ? "Trending up" : "Trending down"}
                  </span>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LineChart
          data={filteredScoreTimeline.length > 0 ? filteredScoreTimeline : scores}
          title="Score Trend"
          colorIndex={0}
        />
        <PieChart
          data={filteredCommitteeData.length > 0 ? filteredCommitteeData : committeeDistribution}
          title="Committee Distribution"
        />
      </div>

      <BarChart
        data={filteredSpeakingData.length > 0 ? filteredSpeakingData : speakingData}
        title="Speaking Time by Committee"
        colorMode="sequential"
      />

      {/* Conference comparison table */}
      {filtered.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conference Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Conference</th>
                    <th className="pb-2 pr-4 font-medium">Committee</th>
                    <th className="pb-2 pr-4 font-medium">Score</th>
                    <th className="pb-2 pr-4 font-medium">Speaking (min)</th>
                    <th className="pb-2 font-medium">Rank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filtered.map((c, i) => (
                    <tr key={i} className="text-muted-foreground">
                      <td className="py-2.5 pr-4 font-medium text-foreground">
                        {c.name}
                      </td>
                      <td className="py-2.5 pr-4">
                        <Badge variant="secondary">{c.committee}</Badge>
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums">{c.score}</td>
                      <td className="py-2.5 pr-4 tabular-nums">
                        {c.speakingMinutes}
                      </td>
                      <td className="py-2.5 tabular-nums">
                        {c.rank && c.totalDelegates
                          ? `${c.rank}/${c.totalDelegates}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      <InsightsPanel
        scores={filtered.map((c) => c.score)}
        committees={filteredCommitteeData.map((d) => ({
          name: d.label,
          count: d.count,
        }))}
        conferences={totalConferences}
        avgScore={avgScore}
      />
    </div>
  );
}
