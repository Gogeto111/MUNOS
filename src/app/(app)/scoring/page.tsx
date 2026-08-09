"use client";

import { useState, useEffect } from "react";
import { Loader2, Trophy, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  scoreDelegatePerformance,
  getDelegatePerformanceHistory,
} from "@/lib/actions/mun-scoring";
import { toast } from "sonner";

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

  useEffect(() => { loadHistory(); }, []);

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
      setScore(result.data as unknown as Record<string, unknown>);
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
    </div>
  );
}
