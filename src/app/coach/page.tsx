"use client";

import { useEffect, useState } from "react";
import {
  Camera,
  FileVideo,
  Loader2,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  BarChart3,
  Award,
  TrendingUp,
  GitCompareArrows,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  createVideoCoachSession,
  listVideoCoachSessions,
  getVideoCoachSession,
} from "@/lib/actions/video-coach";

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

function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative size-16">
        <svg className="size-16 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted/40" />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray={`${pct} ${100 - pct}`}
            strokeLinecap="round"
            className={color}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-sm font-bold tabular-nums">
          {value}
        </span>
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
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function CoachPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "new" | "detail" | "compare">("list");
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareSessions, setCompareSessions] = useState<SessionDetail[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    listVideoCoachSessions().then((result) => {
      if (result.status === "success" && result.data) {
        setSessions(result.data);
      }
      setLoading(false);
    });
  }, []);

  const handleAnalyze = async () => {
    if (!title.trim()) {
      toast.error("Enter a title for this speech.");
      return;
    }
    if (!transcript.trim()) {
      toast.error("Paste your speech transcript.");
      return;
    }
    setAnalyzing(true);
    const result = await createVideoCoachSession({
      title: title.trim(),
      transcript: transcript.trim(),
      durationSec: duration ? parseFloat(duration) : undefined,
    });
    if (result.status === "success" && result.data) {
      toast.success("Analysis complete!");
      const detailResult = await getVideoCoachSession(result.data.sessionId);
      if (detailResult.status === "success" && detailResult.data) {
        setSelectedSession(detailResult.data);
        setView("detail");
      }
      setTitle("");
      setTranscript("");
      setDuration("");
      const listResult = await listVideoCoachSessions();
      if (listResult.status === "success" && listResult.data) {
        setSessions(listResult.data);
      }
    } else {
      toast.error(result.message);
    }
    setAnalyzing(false);
  };

  const openSession = async (sessionId: string) => {
    setLoadingDetail(true);
    setView("detail");
    const result = await getVideoCoachSession(sessionId);
    if (result.status === "success" && result.data) {
      setSelectedSession(result.data);
    } else {
      toast.error(result.message);
      setView("list");
    }
    setLoadingDetail(false);
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const startCompare = async () => {
    if (compareIds.length !== 2) return;
    setLoadingDetail(true);
    const results = await Promise.all(compareIds.map((id) => getVideoCoachSession(id)));
    const loaded: SessionDetail[] = [];
    for (const r of results) {
      if (r.status === "success" && r.data) loaded.push(r.data);
    }
    if (loaded.length === 2) {
      setCompareSessions(loaded);
      setView("compare");
    } else {
      toast.error("Could not load sessions for comparison");
    }
    setLoadingDetail(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">AI Video Coach</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste your speech transcript, get instant AI-powered feedback on delivery, persuasion, and clarity.
          </p>
        </div>

        {view === "list" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="size-5 text-brand-600" /> New Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Speech title (e.g. 'Opening Statement — DISEC')"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Paste your speech transcript here..."
                    className="min-h-[160px] font-mono text-sm"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                  />
                  <div className="flex items-end gap-3">
                    <div className="w-40">
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Duration (seconds)
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g. 180"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleAnalyze}
                      disabled={analyzing || !title.trim() || !transcript.trim()}
                      className="gap-2"
                    >
                      {analyzing ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                      {analyzing ? "Analyzing..." : "Analyze Speech"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileVideo className="size-5" /> Recent Sessions
                  </CardTitle>
                  {sessions.length >= 2 && (
                    <Button
                      size="sm"
                      variant={compareIds.length === 2 ? "default" : "outline"}
                      disabled={compareIds.length !== 2 || loadingDetail}
                      onClick={startCompare}
                      className="gap-1"
                    >
                      <GitCompareArrows className="size-3" />
                      Compare ({compareIds.length}/2)
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <FileVideo className="mb-4 size-10 text-muted-foreground" />
                      <p className="text-sm font-medium">No sessions yet</p>
                      <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                        Paste a speech transcript above to get your first AI analysis.
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[40vh]">
                      <div className="space-y-2">
                        {sessions.map((session) => {
                          const isSelected = compareIds.includes(session.id);
                          return (
                            <div
                              key={session.id}
                              className={cn(
                                "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors",
                                isSelected ? "border-brand-500 bg-brand-500/10" : "border-border/60 hover:bg-muted/40",
                              )}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleCompare(session.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="size-3.5 rounded border-muted-foreground/50 accent-brand-500"
                                />
                                <button onClick={() => openSession(session.id)} className="flex-1 text-left">
                                  <p className="text-sm font-medium">{session.title}</p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {new Date(session.createdAt).toLocaleDateString()}
                                    {session.durationSec && ` • ${Math.round(session.durationSec)}s`}
                                  </p>
                                </button>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-lg font-bold tabular-nums">{session.overall}</p>
                                  <p className="text-[10px] text-muted-foreground">overall</p>
                                </div>
                                <ChevronRight className="size-4 text-muted-foreground" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Quick Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-muted-foreground">
                  <p>Paste your full speech transcript for the most accurate analysis.</p>
                  <p>Include the speaking duration (in seconds) for time-based feedback.</p>
                  <p>The AI evaluates confidence, clarity, persuasion, and structure separately.</p>
                  <p>Review suggestions after each session to track improvement over time.</p>
                </CardContent>
              </Card>

              {sessions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <BarChart3 className="size-4" /> Your Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { label: "Overall", value: Math.round(sessions.reduce((a, s) => a + s.overall, 0) / sessions.length) },
                      { label: "Confidence", value: Math.round(sessions.reduce((a, s) => a + s.confidence, 0) / sessions.length * 10) / 10 },
                      { label: "Clarity", value: Math.round(sessions.reduce((a, s) => a + s.clarity, 0) / sessions.length * 10) / 10 },
                      { label: "Persuasion", value: Math.round(sessions.reduce((a, s) => a + s.persuasion, 0) / sessions.length * 10) / 10 },
                      { label: "Structure", value: Math.round(sessions.reduce((a, s) => a + s.structure, 0) / sessions.length * 10) / 10 },
                    ].map((item) => (
                      <ScoreBar key={item.label} value={item.value} label={item.label} />
                    ))}
                    <p className="pt-2 text-[10px] text-muted-foreground">
                      Average across {sessions.length} session{sessions.length !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Trend Chart */}
              {sessions.length >= 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <TrendingUp className="size-4" /> Score Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-1 h-24">
                      {sessions.slice(-10).map((s, i) => {
                        const height = Math.max(8, (s.overall / 100) * 96);
                        const color = s.overall >= 80 ? "bg-green-500" : s.overall >= 60 ? "bg-yellow-500" : "bg-red-500";
                        return (
                          <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[9px] font-mono text-muted-foreground">{s.overall}</span>
                            <div className={`w-full rounded-t ${color}`} style={{ height: `${height}px` }} />
                            <span className="text-[8px] text-muted-foreground">#{i + 1}</span>
                          </div>
                        );
                      })}
                    </div>
                    {sessions.length >= 3 && (
                      <p className="mt-2 text-[10px] text-muted-foreground">
                        {sessions[sessions.length - 1].overall > sessions[0].overall
                          ? `↑ Improved ${sessions[sessions.length - 1].overall - sessions[0].overall} points since first session`
                          : sessions[sessions.length - 1].overall === sessions[0].overall
                            ? "→ Consistent performance"
                            : `↓ Down ${sessions[0].overall - sessions[sessions.length - 1].overall} points — keep practicing`}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Achievements */}
              {sessions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <Award className="size-4 text-yellow-500" /> Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { icon: "🎯", label: "First Speech", desc: "Completed first analysis", unlocked: sessions.length >= 1 },
                        { icon: "🔥", label: "On Fire", desc: "5+ sessions logged", unlocked: sessions.length >= 5 },
                        { icon: "🏆", label: "Century Club", desc: "Scored 90+ overall", unlocked: sessions.some((s) => s.overall >= 90) },
                        { icon: "📈", label: "Improver", desc: "Scored higher than first", unlocked: sessions.length >= 2 && sessions[sessions.length - 1].overall > sessions[0].overall },
                        { icon: "💎", label: "Diamond Clarity", desc: "Clarity score 95+", unlocked: sessions.some((s) => s.clarity >= 95) },
                        { icon: "🗣️", label: "Persuasive", desc: "Persuasion score 90+", unlocked: sessions.some((s) => s.persuasion >= 90) },
                        { icon: "🧠", label: "Structured", desc: "Structure score 90+", unlocked: sessions.some((s) => s.structure >= 90) },
                        { icon: "⭐", label: "Marathon", desc: "10+ sessions", unlocked: sessions.length >= 10 },
                      ].map((a) => (
                        <div
                          key={a.label}
                          className={`rounded-lg border p-2 text-center transition-colors ${
                            a.unlocked
                              ? "border-yellow-500/30 bg-yellow-500/10"
                              : "border-border/30 bg-muted/20 opacity-50"
                          }`}
                        >
                          <div className="text-lg">{a.icon}</div>
                          <p className="text-[10px] font-semibold">{a.label}</p>
                          <p className="text-[8px] text-muted-foreground">{a.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {view === "new" && (
          <Button variant="ghost" className="mb-4 gap-2" onClick={() => setView("list")}>
            <ArrowLeft className="size-4" /> Back
          </Button>
        )}

        {view === "detail" && (
          <>
            <Button variant="ghost" className="mb-4 gap-2" onClick={() => setView("list")}>
              <ArrowLeft className="size-4" /> Back to sessions
            </Button>

            {loadingDetail ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : selectedSession ? (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedSession.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedSession.createdAt).toLocaleString()}
                        {selectedSession.durationSec && ` • ${Math.round(selectedSession.durationSec)}s speaking time`}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6">
                        <ScoreRing value={selectedSession.overall} label="Overall" color="stroke-brand-500" />
                        <ScoreRing value={selectedSession.confidence} label="Confidence" color="stroke-emerald-500" />
                        <ScoreRing value={selectedSession.clarity} label="Clarity" color="stroke-blue-500" />
                        <ScoreRing value={selectedSession.persuasion} label="Persuasion" color="stroke-amber-500" />
                        <ScoreRing value={selectedSession.structure} label="Structure" color="stroke-purple-500" />
                      </div>
                    </CardContent>
                  </Card>

                  {selectedSession.transcript && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-semibold">Transcript</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="max-h-[30vh]">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                            {selectedSession.transcript}
                          </p>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold">AI Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedSession.suggestions.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No suggestions generated.</p>
                      ) : (
                        selectedSession.suggestions.map((suggestion, i) => (
                          <div key={i} className="flex gap-3 rounded-lg border border-border/60 p-3">
                            <Badge variant="outline" className="shrink-0 text-[10px]">
                              {i + 1}
                            </Badge>
                            <p className="text-xs leading-relaxed">{suggestion}</p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold">Score Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ScoreBar value={selectedSession.confidence} label="Confidence" />
                      <ScoreBar value={selectedSession.clarity} label="Clarity" />
                      <ScoreBar value={selectedSession.persuasion} label="Persuasion" />
                      <ScoreBar value={selectedSession.structure} label="Structure" />
                    </CardContent>
                  </Card>

                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      setView("list");
                      setSelectedSession(null);
                    }}
                  >
                    <ArrowLeft className="size-4" /> New Analysis
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}

        {view === "compare" && compareSessions.length === 2 && (
          <>
            <Button variant="ghost" className="mb-4 gap-2" onClick={() => { setView("list"); setCompareSessions([]); setCompareIds([]); }}>
              <ArrowLeft className="size-4" /> Back to sessions
            </Button>

            <div className="grid gap-6 lg:grid-cols-2">
              {compareSessions.map((s, idx) => (
                <Card key={s.id}>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      <span className="text-muted-foreground">Session {idx + 1}:</span> {s.title}
                    </CardTitle>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString()}
                      {s.durationSec && ` • ${Math.round(s.durationSec)}s`}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <ScoreRing value={s.overall} label="Overall" color="stroke-brand-500" />
                      <ScoreRing value={s.confidence} label="Confidence" color="stroke-emerald-500" />
                      <ScoreRing value={s.clarity} label="Clarity" color="stroke-blue-500" />
                      <ScoreRing value={s.persuasion} label="Persuasion" color="stroke-amber-500" />
                      <ScoreRing value={s.structure} label="Structure" color="stroke-purple-500" />
                    </div>
                    <div className="space-y-2">
                      <ScoreBar value={s.confidence} label="Confidence" />
                      <ScoreBar value={s.clarity} label="Clarity" />
                      <ScoreBar value={s.persuasion} label="Persuasion" />
                      <ScoreBar value={s.structure} label="Structure" />
                    </div>
                    {s.suggestions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-1">Top Suggestion</p>
                        <p className="text-xs text-muted-foreground">{s.suggestions[0]}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Delta comparison */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="size-4" /> Comparison Delta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4 text-center">
                  {(["overall", "confidence", "clarity", "persuasion", "structure"] as const).map((dim) => {
                    const a = compareSessions[0][dim];
                    const b = compareSessions[1][dim];
                    const diff = b - a;
                    const label = dim.charAt(0).toUpperCase() + dim.slice(1);
                    return (
                      <div key={dim}>
                        <p className={`text-lg font-bold ${diff > 0 ? "text-green-500" : diff < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                          {diff > 0 ? "+" : ""}{diff}
                        </p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-[10px] text-muted-foreground text-center">
                  {compareSessions[1].overall > compareSessions[0].overall
                    ? `↑ Session 2 scored ${compareSessions[1].overall - compareSessions[0].overall} points higher`
                    : compareSessions[1].overall === compareSessions[0].overall
                      ? "→ Same overall score"
                      : `↓ Session 2 scored ${compareSessions[0].overall - compareSessions[1].overall} points lower`}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
