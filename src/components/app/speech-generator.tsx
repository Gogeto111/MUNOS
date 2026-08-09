"use client";

import { useState } from "react";
import { Mic, Loader2, Copy, ChevronDown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMunContext } from "@/lib/mun-context";
import { generateGsl, chatWithAssistant, type GslResult } from "@/lib/actions/assistant";

type SpeechMode = "gsl" | "moderated" | "emergency" | "rebuttal";

const SPEECH_MODES: { key: SpeechMode; label: string; icon: string }[] = [
  { key: "gsl", label: "GSL", icon: "🎤" },
  { key: "moderated", label: "Mod Caucus", icon: "⚖️" },
  { key: "emergency", label: "Emergency", icon: "🚨" },
  { key: "rebuttal", label: "Rebuttal", icon: "⚔️" },
];

const GSL_DURATIONS = [30, 45, 60, 75, 90, 120];
const EMERGENCY_PRESETS = [
  "30 seconds — give me something",
  "60 seconds — give me something",
  "Counter-speech to last delegate",
  "Response to attack on my country",
  "Defensive speech",
  "Offensive speech",
  "Diplomatic response",
  "Crisis response",
];

export function SpeechGenerator() {
  const ctx = useMunContext();
  const [mode, setMode] = useState<SpeechMode>("gsl");
  const [gslDuration, setGslDuration] = useState(60);
  const [topic, setTopic] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [gslData, setGslData] = useState<GslResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setGslData(null);
    try {
      const context = ctx.get_context_summary();

      if (mode === "gsl") {
        const res = await generateGsl(
          {
            country: ctx.country || undefined,
            committee: ctx.committee || undefined,
            agenda: ctx.agenda || undefined,
            assistantContext: customPrompt || topic || undefined,
          },
          gslDuration as 60 | 90 | 120,
          "diplomatic"
        );
        if (res.status === "success") {
          setGslData(res.data);
          setResult(res.data.fullSpeech);
        }
      } else {
        let prompt = "";
        if (mode === "moderated") {
          prompt = customPrompt ||
            `Write a moderated caucus speech${topic ? ` on "${topic}"` : ""}. ` +
            `Be direct, argumentative, and solution-focused. Include evidence and policy references.`;
        } else if (mode === "emergency") {
          prompt = customPrompt || topic || "I have 30 seconds — give me something powerful to say right now.";
        } else if (mode === "rebuttal") {
          prompt = customPrompt ||
            `Write a rebuttal/response${topic ? ` to: "${topic}"` : ""}. ` +
            `Counter the argument, provide evidence, and redirect to my position.`;
        }

        const res = await chatWithAssistant(
          [{ role: "user", content: `${prompt}\n\nContext:\n${context}` }],
          {
            country: ctx.country || undefined,
            committee: ctx.committee || undefined,
            agenda: ctx.agenda || undefined,
            assistantContext: context,
          }
        );
        if (res.status === "success") {
          setResult(res.data);
        }
      }
    } catch {}
    setLoading(false);
  };

  const handleEdit = async (instruction: string) => {
    if (!result) return;
    setEditing(instruction);
    try {
      const res = await chatWithAssistant(
        [{
          role: "user",
          content: `Edit this speech: ${instruction}\n\nOriginal:\n${result}`
        }],
        {
          country: ctx.country || undefined,
          committee: ctx.committee || undefined,
          agenda: ctx.agenda || undefined,
        }
      );
      if (res.status === "success") {
        setResult(res.data);
      }
    } catch {}
    setEditing(null);
  };

  const copyText = (text: string) => navigator.clipboard.writeText(text);

  const EDIT_ACTIONS = [
    "Make shorter",
    "Make stronger",
    "Add evidence",
    "More diplomatic",
    "More aggressive",
    "Simpler language",
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Mic className="h-4 w-4" />
          Speech Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode selector */}
        <div className="flex gap-1.5">
          {SPEECH_MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); setResult(null); setGslData(null); }}
              className={cn(
                "flex-1 rounded-lg border px-2 py-2 text-center transition-colors",
                mode === m.key
                  ? "border-brand-500 bg-brand-500/10 text-brand-600"
                  : "border-border/60 bg-card/60 text-muted-foreground hover:bg-muted"
              )}
            >
              <span className="text-base">{m.icon}</span>
              <span className="block text-[10px] font-medium">{m.label}</span>
            </button>
          ))}
        </div>

        {/* GSL duration */}
        {mode === "gsl" && (
          <div className="flex flex-wrap gap-1.5">
            {GSL_DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setGslDuration(d)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                  gslDuration === d
                    ? "border-brand-500 bg-brand-500/10 text-brand-600"
                    : "border-border/40 text-muted-foreground hover:bg-muted"
                )}
              >
                {d}s
              </button>
            ))}
          </div>
        )}

        {/* Topic / prompt */}
        {mode === "emergency" ? (
          <div className="grid grid-cols-2 gap-1.5">
            {EMERGENCY_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => { setCustomPrompt(p); }}
                className={cn(
                  "rounded-lg border px-2 py-1.5 text-left text-[10px] transition-colors",
                  customPrompt === p
                    ? "border-brand-500 bg-brand-500/10 text-brand-600"
                    : "border-border/40 text-muted-foreground hover:bg-muted"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        ) : (
          <Input
            placeholder={mode === "gsl" ? "Topic (optional)" : mode === "moderated" ? "Moderated caucus topic" : "What to rebut against"}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="h-8 text-xs"
          />
        )}

        {/* Advanced */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className={cn("h-3 w-3 transition-transform", showAdvanced && "rotate-180")} />
          Custom instructions
        </button>
        {showAdvanced && (
          <Textarea
            placeholder="Additional instructions..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="min-h-[60px] text-xs"
          />
        )}

        {/* Generate */}
        <Button
          size="sm"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full text-xs"
        >
          {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Zap className="mr-1 h-3 w-3" />}
          Generate Speech
        </Button>

        {/* Result */}
        {result && (
          <div className="space-y-3">
            {gslData && (
              <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                <div className="rounded bg-muted/50 px-2 py-1">⏱ {gslData.estimatedSeconds}s · {gslData.wordCount} words</div>
                <div className="rounded bg-muted/50 px-2 py-1">🎯 Hook: {gslData.hook}</div>
              </div>
            )}
            <div className="rounded-lg border border-brand-500/20 bg-brand-500/5 p-4">
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">
                  {SPEECH_MODES.find((m) => m.key === mode)?.label} Speech
                </Badge>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyText(result)}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{result}</div>
            </div>

            {/* Edit actions */}
            <div className="flex flex-wrap gap-1.5">
              {EDIT_ACTIONS.map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px]"
                  onClick={() => handleEdit(action)}
                  disabled={!!editing}
                >
                  {editing === action ? <Loader2 className="mr-1 h-2.5 w-2.5 animate-spin" /> : null}
                  {action}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
