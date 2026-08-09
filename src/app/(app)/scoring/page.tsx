"use client";

import { useState, useEffect } from "react";
import {
  Loader2, Trophy, TrendingUp, Target, Star, Camera, FileVideo,
  ChevronRight, ArrowLeft, BarChart3, Award, GitCompareArrows, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  scoreDelegatePerformance,
  getDelegatePerformanceHistory,
} from "@/lib/actions/mun-scoring";
import {
  createVideoCoachSession,
  listVideoCoachSessions,
  getVideoCoachSession,
} from "@/lib/actions/video-coach";

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

interface SessionSummary {
  id: string;
  title: string;
  overall: number;
  confidence: number;
  clarity: number;
  persuasion: number;
  structure: number;
  durationSec: number | null;
  createdAt: string;
}

interface SessionDetail {
  id: string;
  title: string;
  transcript: string | null;
  durationSec: number | null;
  overall: number;
  confidence: number;
  clarity: number;
  persuasion: number;
  structure: number;
  suggestions: string[];
  createdAt: string;
}

const DEFAULT_GOALS: Goals = { speaking: 80, research: 80, diplomacy: 80, leadership: 75, documentation: 75, collaboration: 75, overall: 80 };

const BENCHMARKS = [
  { label: "Beginner", speaking: 40, research: 35, diplomacy: 45, leadership: 30, documentation: 40, collaboration: 50, overall: 40 },
  { label: "Intermediate", speaking: 65, research: 60, diplomacy: 70, leadership: 55, documentation: 65, collaboration: 70, overall: 63 },
  { label: "Advanced", speaking: 80, research: 78, diplomacy: 85, leadership: 75, documentation: 80, collaboration: 85, overall: 80 },
  { label: "Best Delegate", speaking: 92, research: 90, diplomacy: 95, leadership: 90, documentation: 88, collaboration: 92, overall: 91 },
];

function loadGoals(): Goals {
  if (typeof window === "undefined") return DEFAULT_GOALS;
  try { const r = localStorage.getItem(GOALS_KEY); return r ? JSON.parse(r) : DEFAULT_GOALS; } catch { return DEFAULT_GOALS; }
}

function saveGoals(g: Goals) {
  if (typeof window !== "undefined") try { localStorage.setItem(GOALS_KEY, JSON.stringify(g)); } catch {}
}

function loadScoreLog(): ScoreLog[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(SCORE_LOG_KEY) || "[]"); } catch { return []; }
}

function appendScoreLog(e: ScoreLog) {
  if (typeof window === "undefined") return;
  const log = loadScoreLog();
  log.push(e);
  if (log.length > 50) log.splice(0, log.length - 50);
  localStorage.setItem(SCORE_LOG_KEY, JSON.stringify(log));
}

function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative size-14">
        <svg className="size-14 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted/40" />
          <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" className={color} />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-sm font-bold tabular-nums">{value}</span>
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function ScoreBar({ value, label, max = 10 }: { value: number; label: string; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="font-semibold tabular-nums">{value}/{max}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function PerformancePage() {
  // Scoring state
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

  // Coach state
  const [coachSessions, setCoachSessions] = useState<SessionSummary[]>([]);
  const [coachLoading, setCoachLoading] = useState(true);
  const [coachView, setCoachView] = useState<"list" | "detail" | "compare">("list");
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareSessions, setCompareSessions] = useState<SessionDetail[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [coachTitle, setCoachTitle] = useState("");
  const [coachTranscript, setCoachTranscript] = useState("");
  const [coachDuration, setCoachDuration] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadHistory();
    setGoals(loadGoals());
    setScoreLog(loadScoreLog());
    listVideoCoachSessions().then((r) => {
      if (r.status === "success" && r.data) setCoachSessions(r.data);
      setCoachLoading(false);
    });
  }, []);

  const loadHistory = async () => {
    const result = await getDelegatePerformanceHistory();
    if (result) setHistory(result);
  };

  const handleScore = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    const result = await scoreDelegatePerformance([transcript.trim()], [], [], {
      country: country || undefined, committee: committee || undefined, agenda: agenda || undefined,
    });
    if (result.status === "success") {
      const data = result.data as unknown as Record<string, unknown>;
      setScore(data);
      appendScoreLog({
        overall: Number(data.overall) || 0, speaking: Number(data.speaking) || 0,
        research: Number(data.research) || 0, diplomacy: Number(data.diplomacy) || 0,
        leadership: Number(data.leadership) || 0, documentation: Number(data.documentation) || 0,
        collaboration: Number(data.collaboration) || 0, country, committee, agenda, ts: Date.now(),
      });
      setScoreLog(loadScoreLog());
      toast.success("Scored!");
      loadHistory();
    } else { toast.error(result.message); }
    setLoading(false);
  };

  const handleCoachAnalyze = async () => {
    if (!coachTitle.trim()) { toast.error("Enter a title."); return; }
    if (!coachTranscript.trim()) { toast.error("Paste your transcript."); return; }
    setAnalyzing(true);
    const result = await createVideoCoachSession({
      title: coachTitle.trim(), transcript: coachTranscript.trim(),
      durationSec: coachDuration ? parseFloat(coachDuration) : undefined,
    });
    if (result.status === "success" && result.data) {
      toast.success("Analysis complete!");
      const detail = await getVideoCoachSession(result.data.sessionId);
      if (detail.status === "success" && detail.data) { setSelectedSession(detail.data); setCoachView("detail"); }
      setCoachTitle(""); setCoachTranscript(""); setCoachDuration("");
      const list = await listVideoCoachSessions();
      if (list.status === "success" && list.data) setCoachSessions(list.data);
    } else { toast.error(result.message); }
    setAnalyzing(false);
  };

  const openCoachSession = async (id: string) => {
    setLoadingDetail(true); setCoachView("detail");
    const r = await getVideoCoachSession(id);
    if (r.status === "success" && r.data) setSelectedSession(r.data);
    else { toast.error(r.message); setCoachView("list"); }
    setLoadingDetail(false);
  };

  const toggleCompare = (id: string) => {
    setCompareIds((p) => { if (p.includes(id)) return p.filter((x) => x !== id); if (p.length >= 2) return [p[1], id]; return [...p, id]; });
  };

  const startCompare = async () => {
    if (compareIds.length !== 2) return;
    setLoadingDetail(true);
    const results = await Promise.all(compareIds.map((id) => getVideoCoachSession(id)));
    const loaded: SessionDetail[] = [];
    for (const r of results) if (r.status === "success" && r.data) loaded.push(r.data);
    if (loaded.length === 2) { setCompareSessions(loaded); setCoachView("compare"); }
    else toast.error("Could not load sessions");
    setLoadingDetail(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Performance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Score speeches, track progress, analyze delivery, and compare sessions.
        </p>
      </div>

      {/* ── INPUT SECTION ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Score a Performance */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Trophy className="size-4 text-yellow-500" /> Score a Performance</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <Input placeholder="Country (optional)" value={country} onChange={(e) => setCountry(e.target.value)} />
              <Input placeholder="Committee (optional)" value={committee} onChange={(e) => setCommittee(e.target.value)} />
              <Input placeholder="Agenda (optional)" value={agenda} onChange={(e) => setAgenda(e.target.value)} />
            </div>
            <Textarea placeholder="Paste your speech transcript here..." value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={4} />
            <Button onClick={handleScore} disabled={loading || !transcript.trim()} className="w-full">
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Trophy className="mr-2 size-4" />}
              {loading ? "Scoring..." : "Score Performance"}
            </Button>
          </CardContent>
        </Card>

        {/* Speech Analysis */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Camera className="size-4 text-brand-600" /> Speech Analysis</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Speech title (e.g. 'Opening Statement — DISEC')" value={coachTitle} onChange={(e) => setCoachTitle(e.target.value)} />
            <Textarea placeholder="Paste your speech transcript for detailed AI feedback..." className="min-h-[120px] font-mono text-sm" value={coachTranscript} onChange={(e) => setCoachTranscript(e.target.value)} />
            <div className="flex items-end gap-3">
              <div className="w-36">
                <label className="mb-1 block text-xs text-muted-foreground">Duration (sec)</label>
                <Input type="number" placeholder="e.g. 180" value={coachDuration} onChange={(e) => setCoachDuration(e.target.value)} />
              </div>
              <Button onClick={handleCoachAnalyze} disabled={analyzing || !coachTitle.trim() || !coachTranscript.trim()} className="flex-1 gap-2">
                {analyzing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {analyzing ? "Analyzing..." : "Analyze Speech"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── SCORE RESULT ── */}
      {score && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Trophy className="size-4 text-yellow-500" /> Score Result: {String(score.overall)}/100</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              <ScoreRing value={Number(score.speaking) || 0} label="Speaking" color="stroke-emerald-500" />
              <ScoreRing value={Number(score.research) || 0} label="Research" color="stroke-blue-500" />
              <ScoreRing value={Number(score.diplomacy) || 0} label="Diplomacy" color="stroke-amber-500" />
              <ScoreRing value={Number(score.leadership) || 0} label="Leadership" color="stroke-purple-500" />
              <ScoreRing value={Number(score.documentation) || 0} label="Docs" color="stroke-pink-500" />
              <ScoreRing value={Number(score.collaboration) || 0} label="Collab" color="stroke-cyan-500" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
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
                <ul className="space-y-1">{(score.improvements as string[]).map((imp, i) => <li key={i} className="text-sm text-muted-foreground">• {imp}</li>)}</ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── COACH DETAIL VIEW ── */}
      {coachView === "detail" && selectedSession && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">{selectedSession.title}</CardTitle>
              <p className="text-[10px] text-muted-foreground">
                {new Date(selectedSession.createdAt).toLocaleString()}
                {selectedSession.durationSec && ` • ${Math.round(selectedSession.durationSec)}s`}
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => { setCoachView("list"); setSelectedSession(null); }}>
              <ArrowLeft className="mr-1 size-3" /> Back
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              <ScoreRing value={selectedSession.overall} label="Overall" color="stroke-brand-500" />
              <ScoreRing value={selectedSession.confidence} label="Confidence" color="stroke-emerald-500" />
              <ScoreRing value={selectedSession.clarity} label="Clarity" color="stroke-blue-500" />
              <ScoreRing value={selectedSession.persuasion} label="Persuasion" color="stroke-amber-500" />
              <ScoreRing value={selectedSession.structure} label="Structure" color="stroke-purple-500" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <ScoreBar value={selectedSession.confidence} label="Confidence" />
                <ScoreBar value={selectedSession.clarity} label="Clarity" />
                <ScoreBar value={selectedSession.persuasion} label="Persuasion" />
                <ScoreBar value={selectedSession.structure} label="Structure" />
              </div>
              <div>
                <p className="text-xs font-semibold mb-2">AI Suggestions</p>
                <div className="space-y-2">
                  {selectedSession.suggestions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No suggestions.</p>
                  ) : selectedSession.suggestions.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex gap-2 rounded-lg border border-border/60 p-2">
                      <Badge variant="outline" className="shrink-0 text-[10px]">{i + 1}</Badge>
                      <p className="text-xs leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {selectedSession.transcript && (
              <div>
                <p className="text-xs font-semibold mb-1">Transcript</p>
                <ScrollArea className="max-h-[20vh] rounded-lg border border-border/40 p-3">
                  <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{selectedSession.transcript}</p>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── COACH COMPARE VIEW ── */}
      {coachView === "compare" && compareSessions.length === 2 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm"><GitCompareArrows className="size-4" /> Session Comparison</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => { setCoachView("list"); setCompareSessions([]); setCompareIds([]); }}>
              <ArrowLeft className="mr-1 size-3" /> Back
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {compareSessions.map((s, idx) => (
                <div key={s.id} className="space-y-3 rounded-lg border border-border/40 p-3">
                  <p className="text-xs font-medium">Session {idx + 1}: {s.title}</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <ScoreRing value={s.overall} label="Overall" color="stroke-brand-500" />
                    <ScoreRing value={s.confidence} label="Confidence" color="stroke-emerald-500" />
                    <ScoreRing value={s.clarity} label="Clarity" color="stroke-blue-500" />
                    <ScoreRing value={s.persuasion} label="Persuasion" color="stroke-amber-500" />
                    <ScoreRing value={s.structure} label="Structure" color="stroke-purple-500" />
                  </div>
                  {s.suggestions.length > 0 && (
                    <p className="text-[10px] text-muted-foreground">Top: {s.suggestions[0]}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-3 text-center">
              {(["overall", "confidence", "clarity", "persuasion", "structure"] as const).map((dim) => {
                const diff = compareSessions[1][dim] - compareSessions[0][dim];
                return (
                  <div key={dim}>
                    <p className={`text-lg font-bold ${diff > 0 ? "text-green-500" : diff < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                      {diff > 0 ? "+" : ""}{diff}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize">{dim}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── RECENT SPEECH SESSIONS ── */}
      {coachView === "list" && coachSessions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm"><FileVideo className="size-4" /> Recent Speech Analyses</CardTitle>
            <div className="flex items-center gap-2">
              {coachSessions.length >= 2 && (
                <Button size="sm" variant={compareIds.length === 2 ? "default" : "outline"} disabled={compareIds.length !== 2 || loadingDetail} onClick={startCompare} className="gap-1">
                  <GitCompareArrows className="size-3" /> Compare ({compareIds.length}/2)
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[30vh]">
              <div className="space-y-2">
                {coachSessions.map((s) => {
                  const sel = compareIds.includes(s.id);
                  return (
                    <div key={s.id} className={cn("flex items-center justify-between rounded-lg border p-2.5 transition-colors", sel ? "border-brand-500 bg-brand-500/10" : "border-border/40 hover:bg-muted/30")}>
                      <div className="flex items-center gap-2 flex-1">
                        <input type="checkbox" checked={sel} onChange={() => toggleCompare(s.id)} onClick={(e) => e.stopPropagation()} className="size-3 rounded accent-brand-500" />
                        <button onClick={() => openCoachSession(s.id)} className="flex-1 text-left">
                          <p className="text-sm font-medium">{s.title}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}{s.durationSec && ` • ${Math.round(s.durationSec)}s`}</p>
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold tabular-nums">{s.overall}</p>
                        <p className="text-[10px] text-muted-foreground">overall</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* ── STATS ROW ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance History */}
        {history && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="size-4" /> MUN History</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><p className="text-2xl font-bold">{String(history.totalSessions)}</p><p className="text-[10px] text-muted-foreground">Sessions</p></div>
                <div><p className="text-2xl font-bold">{String(history.topStrength)}</p><p className="text-[10px] text-muted-foreground">Top Strength</p></div>
                <div><p className="text-2xl font-bold">{String(history.trend)}</p><p className="text-[10px] text-muted-foreground">Trend</p></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        {coachSessions.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><BarChart3 className="size-4" /> Speech Averages</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Overall", value: Math.round(coachSessions.reduce((a, s) => a + s.overall, 0) / coachSessions.length) },
                { label: "Confidence", value: Math.round(coachSessions.reduce((a, s) => a + s.confidence, 0) / coachSessions.length * 10) / 10 },
                { label: "Clarity", value: Math.round(coachSessions.reduce((a, s) => a + s.clarity, 0) / coachSessions.length * 10) / 10 },
                { label: "Persuasion", value: Math.round(coachSessions.reduce((a, s) => a + s.persuasion, 0) / coachSessions.length * 10) / 10 },
                { label: "Structure", value: Math.round(coachSessions.reduce((a, s) => a + s.structure, 0) / coachSessions.length * 10) / 10 },
              ].map((item) => <ScoreBar key={item.label} value={item.value} label={item.label} />)}
              <p className="pt-1 text-[10px] text-muted-foreground">Avg across {coachSessions.length} speech{coachSessions.length !== 1 ? "es" : ""}</p>
            </CardContent>
          </Card>
        )}

        {/* Goals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm"><Target className="size-4 text-brand-500" /> My Goals</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => { setEditGoals(!editGoals); if (editGoals) { saveGoals(goals); toast.success("Goals saved"); } }}>
              {editGoals ? "Save" : "Edit"}
            </Button>
          </CardHeader>
          <CardContent>
            {score ? (
              <div className="space-y-2">
                {(["speaking", "research", "diplomacy", "leadership", "documentation", "collaboration", "overall"] as const).map((dim) => {
                  const current = dim === "overall" ? Number(score.overall) || 0 : Number(score[dim]) || 0;
                  const goal = goals[dim];
                  const pct = Math.min(100, Math.round((current / goal) * 100));
                  const met = current >= goal;
                  return (
                    <div key={dim} className="flex items-center gap-2">
                      <span className="w-20 text-[10px] capitalize text-muted-foreground">{dim}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${met ? "bg-green-500" : "bg-brand-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-[10px] font-mono ${met ? "text-green-500" : "text-muted-foreground"}`}>{current}/{goal}</span>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-xs text-muted-foreground">Score a performance to see goals.</p>}
            {editGoals && (
              <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {(["speaking", "research", "diplomacy", "leadership", "documentation", "collaboration", "overall"] as const).map((dim) => (
                  <div key={dim} className="flex items-center gap-1.5">
                    <span className="text-[10px] capitalize text-muted-foreground w-20">{dim}</span>
                    <Input type="number" min={0} max={100} value={goals[dim]} onChange={(e) => setGoals({ ...goals, [dim]: Number(e.target.value) })} className="h-7 text-xs" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── SCORE HISTORY + BENCHMARKS + ACHIEVEMENTS ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Score History Chart */}
        {scoreLog.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="size-4" /> Score History</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-24 mb-2">
                {scoreLog.slice(-12).map((e, i) => {
                  const h = Math.max(8, (e.overall / 100) * 96);
                  const c = e.overall >= 80 ? "bg-green-500" : e.overall >= 60 ? "bg-yellow-500" : "bg-red-500";
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <span className="text-[8px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{e.overall}</span>
                      <div className={`w-full rounded-t ${c}`} style={{ height: `${h}px` }} />
                      <span className="text-[7px] text-muted-foreground">{new Date(e.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded bg-muted/30 p-1.5"><p className="text-sm font-bold">{Math.round(scoreLog.reduce((a, s) => a + s.overall, 0) / scoreLog.length)}</p><p className="text-[9px] text-muted-foreground">Avg</p></div>
                <div className="rounded bg-muted/30 p-1.5"><p className="text-sm font-bold">{Math.max(...scoreLog.map((s) => s.overall))}</p><p className="text-[9px] text-muted-foreground">Best</p></div>
                <div className="rounded bg-muted/30 p-1.5"><p className="text-sm font-bold">{scoreLog.length}</p><p className="text-[9px] text-muted-foreground">Total</p></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benchmarks */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Star className="size-4 text-yellow-500" /> Benchmarks</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead><tr className="border-b border-border/60">
                  <th className="pb-1 text-left font-medium text-muted-foreground">Level</th>
                  {["Speak", "Res", "Dip", "Lead", "Doc", "Collab", "Total"].map((h) => <th key={h} className="pb-1 text-center font-medium text-muted-foreground">{h}</th>)}
                </tr></thead>
                <tbody>
                  {BENCHMARKS.map((b) => (
                    <tr key={b.label} className="border-b border-border/30">
                      <td className="py-1 font-medium">{b.label}</td>
                      <td className="py-1 text-center">{b.speaking}</td>
                      <td className="py-1 text-center">{b.research}</td>
                      <td className="py-1 text-center">{b.diplomacy}</td>
                      <td className="py-1 text-center">{b.leadership}</td>
                      <td className="py-1 text-center">{b.documentation}</td>
                      <td className="py-1 text-center">{b.collaboration}</td>
                      <td className="py-1 text-center font-semibold">{b.overall}</td>
                    </tr>
                  ))}
                  {score && (
                    <tr className="bg-brand-500/10">
                      <td className="py-1 font-semibold text-brand-600">You</td>
                      <td className="py-1 text-center font-mono">{Number(score.speaking) || 0}</td>
                      <td className="py-1 text-center font-mono">{Number(score.research) || 0}</td>
                      <td className="py-1 text-center font-mono">{Number(score.diplomacy) || 0}</td>
                      <td className="py-1 text-center font-mono">{Number(score.leadership) || 0}</td>
                      <td className="py-1 text-center font-mono">{Number(score.documentation) || 0}</td>
                      <td className="py-1 text-center font-mono">{Number(score.collaboration) || 0}</td>
                      <td className="py-1 text-center font-mono font-semibold">{Number(score.overall) || 0}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Award className="size-4 text-yellow-500" /> Achievements</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { icon: "🎯", label: "First Score", desc: "Scored a performance", unlocked: scoreLog.length >= 1 },
                { icon: "🎤", label: "First Speech", desc: "Analyzed a speech", unlocked: coachSessions.length >= 1 },
                { icon: "🔥", label: "On Fire", desc: "5+ speech sessions", unlocked: coachSessions.length >= 5 },
                { icon: "🏆", label: "Century Club", desc: "Scored 90+ overall", unlocked: scoreLog.some((s) => s.overall >= 90) || coachSessions.some((s) => s.overall >= 90) },
                { icon: "📈", label: "Improver", desc: "Scored higher than first", unlocked: (scoreLog.length >= 2 && scoreLog[scoreLog.length - 1].overall > scoreLog[0].overall) || (coachSessions.length >= 2 && coachSessions[coachSessions.length - 1].overall > coachSessions[0].overall) },
                { icon: "💎", label: "Diamond Clarity", desc: "Clarity 95+", unlocked: coachSessions.some((s) => s.clarity >= 95) },
                { icon: "🗣️", label: "Persuasive", desc: "Persuasion 90+", unlocked: coachSessions.some((s) => s.persuasion >= 90) },
                { icon: "⭐", label: "Marathon", desc: "10+ total sessions", unlocked: scoreLog.length + coachSessions.length >= 10 },
              ].map((a) => (
                <div key={a.label} className={cn("rounded-lg border p-2 text-center transition-colors", a.unlocked ? "border-yellow-500/30 bg-yellow-500/10" : "border-border/30 bg-muted/20 opacity-50")}>
                  <div className="text-base">{a.icon}</div>
                  <p className="text-[9px] font-semibold">{a.label}</p>
                  <p className="text-[7px] text-muted-foreground">{a.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
