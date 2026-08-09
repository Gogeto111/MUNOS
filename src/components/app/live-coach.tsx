"use client";

import { useState } from "react";
import { Lightbulb, Loader2, Copy, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMunContext } from "@/lib/mun-context";
import { chatWithAssistant } from "@/lib/actions/assistant";

interface CoachPrompt {
  key: string;
  label: string;
  icon: string;
  prompt: string;
}

const COACH_PROMPTS: CoachPrompt[] = [
  { key: "say", label: "What should I say?", icon: "💬", prompt: "Based on the current committee situation, what should I say next? Give me 2-3 specific options with different approaches." },
  { key: "do", label: "What should I do next?", icon: "🎯", prompt: "Given the current state of the committee, what's my next strategic move? Consider speaking opportunities, alliances, and timing." },
  { key: "approach", label: "Who should I approach?", icon: "🤝", prompt: "Which delegates should I approach right now? Who are the key players I need to talk to and why?" },
  { key: "attack", label: "Who should I attack?", icon: "⚔️", prompt: "Which country's position is most vulnerable to attack right now? What specific argument would be most effective?" },
  { key: "ally", label: "Who should I ally with?", icon: "🤝", prompt: "Based on shared interests and voting patterns, which countries should I build alliances with? How should I approach them?" },
  { key: "argument", label: "What argument should I make?", icon: "📜", prompt: "What's the strongest argument I can make right now? Consider the current debate, my country's position, and what will resonate." },
  { key: "evidence", label: "What evidence should I use?", icon: "📊", prompt: "What statistics, case studies, treaties, or historical examples would strengthen my position right now?" },
  { key: "avoid", label: "What should I avoid?", icon: "⚠️", prompt: "What mistakes should I be careful not to make? What are the common traps in this type of debate?" },
];

export function LiveCoach() {
  const ctx = useMunContext();
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<{ prompt: string; result: string; timestamp: number }[]>([]);
  const [showCustom, setShowCustom] = useState(false);

  const handlePrompt = async (cp: CoachPrompt) => {
    setActivePrompt(cp.key);
    setLoading(true);
    setResult("");
    try {
      const context = ctx.get_context_summary();
      const res = await chatWithAssistant(
        [{ role: "user", content: `${cp.prompt}\n\nContext:\n${context}` }],
        {
          country: ctx.country || undefined,
          committee: ctx.committee || undefined,
          agenda: ctx.agenda || undefined,
          assistantContext: context,
        }
      );
      if (res.status === "success") {
        setResult(res.data);
        setHistory((h) => [{ prompt: cp.label, result: res.data, timestamp: Date.now() }, ...h.slice(0, 9)]);
      }
    } catch {}
    setLoading(false);
    setActivePrompt(null);
  };

  const handleCustom = async () => {
    if (!customPrompt.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const context = ctx.get_context_summary();
      const res = await chatWithAssistant(
        [{ role: "user", content: `${customPrompt}\n\nContext:\n${context}` }],
        {
          country: ctx.country || undefined,
          committee: ctx.committee || undefined,
          agenda: ctx.agenda || undefined,
          assistantContext: context,
        }
      );
      if (res.status === "success") {
        setResult(res.data);
        setHistory((h) => [{ prompt: customPrompt.slice(0, 50), result: res.data, timestamp: Date.now() }, ...h.slice(0, 9)]);
        setCustomPrompt("");
      }
    } catch {}
    setLoading(false);
  };

  const copyText = (text: string) => navigator.clipboard.writeText(text);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Lightbulb className="h-4 w-4" />
          Live AI Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick prompts grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {COACH_PROMPTS.map((cp) => (
            <button
              key={cp.key}
              onClick={() => handlePrompt(cp)}
              disabled={loading}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
                activePrompt === cp.key
                  ? "border-brand-500 bg-brand-500/10 text-brand-600"
                  : "border-border/60 bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {loading && activePrompt === cp.key ? (
                <Loader2 className="h-3 w-3 animate-spin shrink-0" />
              ) : (
                <span className="text-sm shrink-0">{cp.icon}</span>
              )}
              <span className="text-[10px] font-medium leading-tight">{cp.label}</span>
            </button>
          ))}
        </div>

        {/* Custom prompt */}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className={cn("h-3 w-3 transition-transform", showCustom && "rotate-180")} />
          Ask anything
        </button>
        {showCustom && (
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask your own question..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[50px] text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCustom();
                }
              }}
            />
            <Button
              size="sm"
              onClick={handleCustom}
              disabled={loading || !customPrompt.trim()}
              className="h-8 px-3 text-xs shrink-0 self-end"
            >
              <Sparkles className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-lg border border-brand-500/20 bg-brand-500/5 p-4">
            <div className="mb-2 flex items-center justify-between">
              <Badge variant="outline" className="text-[10px]">
                <Sparkles className="mr-1 h-2.5 w-2.5" />
                AI Coach
              </Badge>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyText(result)}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{result}</div>
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Recent</div>
            {history.slice(1, 4).map((h, i) => (
              <button
                key={i}
                onClick={() => setResult(h.result)}
                className="flex w-full items-center gap-2 rounded border border-border/30 px-2 py-1.5 text-left transition-colors hover:bg-muted/50"
              >
                <span className="text-[10px] text-muted-foreground truncate flex-1">{h.prompt}</span>
                <span className="text-[8px] text-muted-foreground shrink-0">
                  {new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
