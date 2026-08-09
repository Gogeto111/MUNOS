"use client";

import { useState, useEffect } from "react";
import { Loader2, Radio, AlertTriangle, Lightbulb, History, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { generateSituationAnalysis } from "@/lib/actions/situation-room";

const HISTORY_KEY = "munos-situation-history";

interface SituationUpdate {
  type: "breaking" | "talking_point" | "poi" | "resolution_implication";
  title: string;
  content: string;
  whyItMatters: string;
  source?: string;
}

interface AnalysisEntry {
  country: string;
  committee: string;
  agenda: string;
  content: string;
  ts: number;
}

function loadHistory(): AnalysisEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}

function saveHistory(entry: AnalysisEntry) {
  if (typeof window === "undefined") return;
  const history = loadHistory();
  history.unshift(entry);
  if (history.length > 20) history.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

export function SituationRoom() {
  const [country, setCountry] = useState("");
  const [committee, setCommittee] = useState("");
  const [agenda, setAgenda] = useState("");
  const [loading, setLoading] = useState(false);
  const [updates, setUpdates] = useState<SituationUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisEntry[]>([]);
  const [analysisType, setAnalysisType] = useState<"full" | "poi" | "counter" | "bloc">("full");

  useEffect(() => { setHistory(loadHistory()); }, []);

  const handleAnalyze = async () => {
    if (!country || !committee || !agenda) return;
    setLoading(true);
    setError(null);

    const prompts: Record<string, string> = {
      full: `Give me a full situation analysis for ${country} in ${committee} on ${agenda}. Cover: key allies, opponents, likely blocs, hot-button issues, and 3 strategic moves ${country} should make right now.`,
      poi: `Generate 5 hard-hitting POIs ${country} can use in ${committee} on ${agenda}. Each should target a weak argument from opposing countries.`,
      counter: `What are the 3 strongest arguments against ${country}'s position on ${agenda}? For each, give a counter-argument ${country} can use.`,
      bloc: `Which countries should ${country} ally with in ${committee} on ${agenda}? List 5 allies, shared interests, and a draft working paper outline.`,
    };

    try {
      const result = await generateSituationAnalysis(country, committee, agenda, prompts[analysisType]);
      if (result.status === "error") {
        setError(result.message);
      } else {
        const titles: Record<string, string> = { full: "Situation Analysis", poi: "POI Generator", counter: "Counter-Arguments", bloc: "Bloc Builder" };
        setUpdates([{
          type: "breaking",
          title: titles[analysisType],
          content: result.data,
          whyItMatters: `Tailored for ${country} in ${committee} on ${agenda}`,
          source: "AI Analysis",
        }]);
        saveHistory({ country, committee, agenda, content: result.data, ts: Date.now() });
        setHistory(loadHistory());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate analysis");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Radio className="size-4 text-red-500" />
            Committee Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input placeholder="Your country" value={country} onChange={(e) => setCountry(e.target.value)} />
            <Input placeholder="Committee" value={committee} onChange={(e) => setCommittee(e.target.value)} />
            <Input placeholder="Agenda topic" value={agenda} onChange={(e) => setAgenda(e.target.value)} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[
              { key: "full" as const, label: "Full Analysis", icon: "📋" },
              { key: "poi" as const, label: "Quick POIs", icon: "💬" },
              { key: "counter" as const, label: "Counter-Args", icon: "⚔️" },
              { key: "bloc" as const, label: "Bloc Builder", icon: "🤝" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setAnalysisType(t.key)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
                  analysisType === t.key ? "border-brand-500 bg-brand-500/10 text-brand-600" : "border-border/60 bg-card/60 text-muted-foreground hover:bg-muted",
                )}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
          <Button onClick={handleAnalyze} disabled={!country || !committee || !agenda || loading} className="mt-3">
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Radio className="mr-2 size-4" />}
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600">{error}</div>
      )}

      {updates.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Live Feed</h3>
          {updates.map((update, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {update.type === "breaking" && <AlertTriangle className="size-4 text-red-500" />}
                    {update.type === "talking_point" && <Lightbulb className="size-4 text-yellow-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {update.type.replace("_", " ")}
                      </Badge>
                      {update.source && <span className="text-[10px] text-muted-foreground">{update.source}</span>}
                    </div>
                    <h4 className="mt-1 font-semibold">{update.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{update.content}</p>
                    <div className="mt-3 rounded-lg bg-brand-500/5 p-3">
                      <p className="text-xs font-medium text-brand-600 dark:text-brand-400">
                        Why this matters to {country}:
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{update.whyItMatters}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Analysis History */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <History className="size-4" /> Past Analyses
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-red-500"
              onClick={() => { clearHistory(); setHistory([]); }}
            >
              <Trash2 className="size-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[30vh]">
              <div className="space-y-2">
                {history.map((entry, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCountry(entry.country);
                      setCommittee(entry.committee);
                      setAgenda(entry.agenda);
                      setUpdates([{
                        type: "breaking",
                        title: "Situation Analysis",
                        content: entry.content,
                        whyItMatters: `This analysis is tailored for ${entry.country} in ${entry.committee} on ${entry.agenda}`,
                        source: "AI Analysis",
                      }]);
                    }}
                    className="flex w-full items-start gap-3 rounded-lg border border-border/40 p-3 text-left transition-colors hover:bg-muted/30"
                  >
                    <Clock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{entry.country} · {entry.committee}</p>
                      <p className="text-[10px] text-muted-foreground">{entry.agenda}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(entry.ts).toLocaleDateString()} {new Date(entry.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
