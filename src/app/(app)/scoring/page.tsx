"use client";

import { useState, useEffect } from "react";
import { Loader2, Trophy, TrendingUp, Target, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  scoreDelegatePerformance,
  getDelegatePerformanceHistory,
} from "@/lib/actions/mun-scoring";
import { toast } from "sonner";

const GOALS_KEY = "munos-scoring-goals";
const SCORE_LOG_KEY = "munos-score-log";

interface Goals {
  speaking: number;
  research: number;
  diplomacy: number;
  leadership: number;
  documentation: number;
  collaboration: number;
  overall: number;
}

interface ScoreLog {
  overall: number;
  speaking: number;
  research: number;
  diplomacy: number;
  leadership: number;
  documentation: number;
  collaboration: number;
  country: string;
  committee: string;
  agenda: string;
  ts: number;
}

const DEFAULT_GOALS: Goals = { speaking: 80, research: 80, diplomacy: 80, leadership: 75, documentation: 75, collaboration: 75, overall: 80 };

const BENCHMARKS = [
  { label: "Beginner Delegate", speaking: 40, research: 35, diplomacy: 45, leadership: 30, documentation: 40, collaboration: 50, overall: 40 },
  { label: "Intermediate Delegate", speaking: 65, research: 60, diplomacy: 70, leadership: 55, documentation: 65, collaboration: 70, overall: 63 },
  { label: "Advanced Delegate", speaking: 80, research: 78, diplomacy: 85, leadership: 75, documentation: 80, collaboration: 85, overall: 80 },
  { label: "Best Delegate Winner", speaking: 92, research: 90, diplomacy: 95, leadership: 90, documentation: 88, collaboration: 92, overall: 91 },
];

function loadGoals(): Goals {
  if (typeof window === "undefined") return DEFAULT_GOALS;
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_GOALS;
  } catch { return DEFAULT_GOALS; }
}

function saveGoals(goals: Goals) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(GOALS_KEY, JSON.stringify(goals)); } catch {}
}

function loadScoreLog(): ScoreLog[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(SCORE_LOG_KEY) || "[]"); } catch { return []; }
}

function appendScoreLog(entry: ScoreLog) {
  if (typeof window === "undefined") return;
  const log = loadScoreLog();
  log.push(entry);
  if (log.length > 50) log.splice(0, log.length - 50);
  localStorage.setItem(SCORE_LOG_KEY, JSON.stringify(log));
}

function ScoreRing({ label, score }: { label: string; score: number }) {
  const pct = Math.round(score);
  const color = pct >= 80 ? "text-green-500" : pct >= 60 ? "text-yellow-500" : "text-red-500";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative size-16">
        <svg className="size-16 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="2" />
          <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" className={color}
            strokeWidth="2" strokeDasharray={`${pct} 100`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">{score}</span>
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

export default function ScoringPage() {
  const [transcript, setTranscript] = useState("");
  const [country, setCountry] = useState("");
  const [committee, setCommittee] = useState("");
  const [agenda, setAgenda] = useState("");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<Record<string, unknown> | null>(null);
  const [history, setHistory] = useState<Record<string, unknown> | null>(null);
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS);
  const [editGoals, setEditGoals] = useState(false);
  const [scoreLog, setScoreLog] = useState<ScoreLog[]>([]);

  useEffect(() => { loadHistory(); setGoals(loadGoals()); setScoreLog(loadScoreLog()); }, []);

  const loadHistory = async () => {
    const result = await getDelegatePerformanceHistory();
    if (result) setHistory(result);
  };

  const handleScore = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    const result = await scoreDelegatePerformance(
      [transcript.trim()],
      [],
      [],
      {
        country: country || undefined,
        committee: committee || undefined,
        agenda: agenda || undefined,
      },
    );
    if (result.status === "success") {
      const data = result.data as unknown as Record<string, unknown>;
      setScore(data);
      const entry: ScoreLog = {
        overall: Number(data.overall) || 0,
        speaking: Number(data.speaking) || 0,
        research: Number(data.research) || 0,
        diplomacy: Number(data.diplomacy) || 0,
        leadership: Number(data.leadership) || 0,
        documentation: Number(data.documentation) || 0,
        collaboration: Number(data.collaboration) || 0,
        country, committee, agenda,
        ts: Date.now(),
      };
      appendScoreLog(entry);
      setScoreLog(loadScoreLog());
      toast.success("Scored!");
      loadHistory();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">MUN Scoring</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Get your speaking, research, diplomacy, leadership, documentation, and collaboration scored.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Score a Performance</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input placeholder="Country (optional)" value={country} onChange={(e) => setCountry(e.target.value)} />
            <Input placeholder="Committee (optional)" value={committee} onChange={(e) => setCommittee(e.target.value)} />
            <Input placeholder="Agenda (optional)" value={agenda} onChange={(e) => setAgenda(e.target.value)} />
          </div>
          <Textarea
            placeholder="Paste your speech transcript here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={6}
          />
          <Button onClick={handleScore} disabled={loading || !transcript.trim()}>
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Trophy className="mr-2 size-4" />}
            Score Performance
          </Button>
        </CardContent>
      </Card>

      {score && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Trophy className="size-4 text-yellow-500" />
              Overall Score: {String(score.overall)}/100
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap justify-center gap-6">
              <ScoreRing label="Speaking" score={Number(score.speaking) || 0} />
              <ScoreRing label="Research" score={Number(score.research) || 0} />
              <ScoreRing label="Diplomacy" score={Number(score.diplomacy) || 0} />
              <ScoreRing label="Leadership" score={Number(score.leadership) || 0} />
              <ScoreRing label="Documentation" score={Number(score.documentation) || 0} />
              <ScoreRing label="Collaboration" score={Number(score.collaboration) || 0} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <p className="text-xs font-semibold text-red-500">Biggest Opportunity</p>
                <p className="mt-1 text-sm text-muted-foreground">{String(score.biggestOpportunity)}</p>
              </div>
              <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                <p className="text-xs font-semibold text-green-500">Rank</p>
                <p className="mt-1 text-sm text-muted-foreground">{String(score.rank)}</p>
              </div>
            </div>
            {Array.isArray(score.improvements) && (
              <div>
                <p className="text-xs font-semibold mb-2">Improvements</p>
                <ul className="space-y-1">
                  {(score.improvements as string[]).map((imp, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {imp}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {history && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="size-4" /> Performance History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{String(history.totalSessions)}</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{String(history.topStrength)}</p>
                <p className="text-xs text-muted-foreground">Top Strength</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{String(history.trend)}</p>
                <p className="text-xs text-muted-foreground">Trend</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="size-4 text-brand-500" /> My Goals
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={() => { setEditGoals(!editGoals); if (editGoals) { saveGoals(goals); toast.success("Goals saved"); } }}>
            {editGoals ? "Save" : "Edit"}
          </Button>
        </CardHeader>
        <CardContent>
          {score ? (
            <div className="space-y-3">
              {(["speaking", "research", "diplomacy", "leadership", "documentation", "collaboration", "overall"] as const).map((dim) => {
                const current = dim === "overall" ? Number(score.overall) || 0 : Number(score[dim]) || 0;
                const goal = goals[dim];
                const pct = Math.min(100, Math.round((current / goal) * 100));
                const met = current >= goal;
                return (
                  <div key={dim} className="flex items-center gap-3">
                    <span className="w-28 text-xs capitalize text-muted-foreground">{dim}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${met ? "bg-green-500" : "bg-brand-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`text-xs font-mono ${met ? "text-green-500" : "text-muted-foreground"}`}>{current}/{goal}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Score a performance to see goal progress.</p>
          )}
          {editGoals && (
            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              {(["speaking", "research", "diplomacy", "leadership", "documentation", "collaboration", "overall"] as const).map((dim) => (
                <div key={dim} className="flex items-center gap-2">
                  <span className="text-xs capitalize text-muted-foreground w-24">{dim}</span>
                  <Input type="number" min={0} max={100} value={goals[dim]} onChange={(e) => setGoals({ ...goals, [dim]: Number(e.target.value) })} className="h-8" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Star className="size-4 text-yellow-500" /> Delegate Benchmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="pb-2 text-left font-medium text-muted-foreground">Level</th>
                  {["Speaking", "Research", "Diplomacy", "Leadership", "Docs", "Collab", "Overall"].map((h) => (
                    <th key={h} className="pb-2 text-center font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BENCHMARKS.map((b) => (
                  <tr key={b.label} className="border-b border-border/30">
                    <td className="py-2 font-medium">{b.label}</td>
                    <td className="py-2 text-center">{b.speaking}</td>
                    <td className="py-2 text-center">{b.research}</td>
                    <td className="py-2 text-center">{b.diplomacy}</td>
                    <td className="py-2 text-center">{b.leadership}</td>
                    <td className="py-2 text-center">{b.documentation}</td>
                    <td className="py-2 text-center">{b.collaboration}</td>
                    <td className="py-2 text-center font-semibold">{b.overall}</td>
                  </tr>
                ))}
                {score && (
                  <tr className="bg-brand-500/10">
                    <td className="py-2 font-semibold text-brand-600">You</td>
                    <td className="py-2 text-center font-mono">{Number(score.speaking) || 0}</td>
                    <td className="py-2 text-center font-mono">{Number(score.research) || 0}</td>
                    <td className="py-2 text-center font-mono">{Number(score.diplomacy) || 0}</td>
                    <td className="py-2 text-center font-mono">{Number(score.leadership) || 0}</td>
                    <td className="py-2 text-center font-mono">{Number(score.documentation) || 0}</td>
                    <td className="py-2 text-center font-mono">{Number(score.collaboration) || 0}</td>
                    <td className="py-2 text-center font-mono font-semibold">{Number(score.overall) || 0}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Score History */}
      {scoreLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="size-4" /> Score History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32 mb-3">
              {scoreLog.slice(-15).map((entry, i) => {
                const h = Math.max(8, (entry.overall / 100) * 120);
                const color = entry.overall >= 80 ? "bg-green-500" : entry.overall >= 60 ? "bg-yellow-500" : "bg-red-500";
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <span className="text-[9px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{entry.overall}</span>
                    <div className={`w-full rounded-t ${color}`} style={{ height: `${h}px` }} />
                    <span className="text-[8px] text-muted-foreground">{new Date(entry.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                );
              })}
            </div>
            {scoreLog.length >= 2 && (
              <p className="text-[10px] text-muted-foreground">
                {scoreLog[scoreLog.length - 1].overall > scoreLog[0].overall
                  ? `↑ Improved ${scoreLog[scoreLog.length - 1].overall - scoreLog[0].overall} points since first score`
                  : scoreLog[scoreLog.length - 1].overall === scoreLog[0].overall
                    ? "→ Consistent performance"
                    : `↓ Down ${scoreLog[0].overall - scoreLog[scoreLog.length - 1].overall} points`}
                {" "} · {scoreLog.length} total scores
              </p>
            )}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-muted/30 p-2">
                <p className="text-lg font-bold">{Math.round(scoreLog.reduce((a, s) => a + s.overall, 0) / scoreLog.length)}</p>
                <p className="text-[10px] text-muted-foreground">Avg Overall</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-2">
                <p className="text-lg font-bold">{Math.max(...scoreLog.map((s) => s.overall))}</p>
                <p className="text-[10px] text-muted-foreground">Best Score</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-2">
                <p className="text-lg font-bold">{scoreLog.length}</p>
                <p className="text-[10px] text-muted-foreground">Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
