"use client";

import { useState } from "react";
import { MessageSquare, Loader2, Copy, ChevronDown, Zap, Shield, Target, BookOpen, Cpu, RotateCcw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMunContext } from "@/lib/mun-context";
import { generatePois } from "@/lib/actions/assistant";

type PoiType = "diplomatic" | "aggressive" | "trap" | "evidence" | "technical" | "follow-up" | "counter";
type AnswerMode = "10s" | "20s" | "30s";

const POI_TYPES: { key: PoiType; label: string; icon: string; desc: string }[] = [
  { key: "diplomatic", label: "Diplomatic", icon: "🤝", desc: "Polite, constructive challenge" },
  { key: "aggressive", label: "Aggressive", icon: "⚔️", desc: "Direct confrontation" },
  { key: "trap", label: "Trap", icon: "🪤", desc: "Corner them with their own words" },
  { key: "evidence", label: "Evidence-Based", icon: "📊", desc: "Counter with data/statistics" },
  { key: "technical", label: "Technical", icon: "🔬", desc: "Legal/procedural challenge" },
  { key: "follow-up", label: "Follow-Up", icon: "🔄", desc: "Build on their response" },
  { key: "counter", label: "Counter-POI", icon: "🛡️", desc: "Defend against a POI" },
];

const ANSWER_MODES: { key: AnswerMode; label: string; desc: string }[] = [
  { key: "10s", label: "10s", desc: "Quick deflection" },
  { key: "20s", label: "20s", desc: "Standard response" },
  { key: "30s", label: "30s", desc: "Full rebuttal" },
];

interface PoiResult {
  type: string;
  targetCountry: string;
  text: string;
  rationale: string;
  expectedResponse: string;
  followUp: string;
}

export function PoiGenerator() {
  const ctx = useMunContext();
  const [selectedType, setSelectedType] = useState<PoiType>("diplomatic");
  const [targetCountry, setTargetCountry] = useState("");
  const [topic, setTopic] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PoiResult[]>([]);
  const [answerMode, setAnswerMode] = useState<AnswerMode>("20s");
  const [answerPrompt, setAnswerPrompt] = useState("");
  const [answerResult, setAnswerResult] = useState("");
  const [answerLoading, setAnswerLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const typeLabel = POI_TYPES.find((t) => t.key === selectedType)?.label || "Diplomatic";
      const speechText = customPrompt ||
        `Generate ${typeLabel} POIs${targetCountry ? ` against ${targetCountry}` : ""}${topic ? ` on "${topic}"` : ""}. ` +
        `Include: the POI text, rationale, expected response, and follow-up.`;

      const result = await generatePois(
        {
          country: ctx.country || undefined,
          committee: ctx.committee || undefined,
          agenda: ctx.agenda || undefined,
          opposingCountries: targetCountry ? [targetCountry] : undefined,
          assistantContext: `POI Type: ${typeLabel}`,
        },
        speechText,
        3
      );

      if (result.status === "success") {
        setResults(result.data.pois);
      }
    } catch {}
    setLoading(false);
  };

  const handleAnswer = async () => {
    if (!answerPrompt.trim()) return;
    setAnswerLoading(true);
    try {
      const { chatWithAssistant } = await import("@/lib/actions/assistant");
      const context = ctx.get_context_summary();
      const result = await chatWithAssistant(
        [{
          role: "user",
          content: `Answer this POI in ${answerMode} (${answerMode === "10s" ? "very brief deflection" : answerMode === "20s" ? "standard response" : "full rebuttal"}): "${answerPrompt}"\n\nContext:\n${context}`
        }],
        {
          country: ctx.country || undefined,
          committee: ctx.committee || undefined,
          agenda: ctx.agenda || undefined,
        }
      );
      if (result.status === "success") {
        setAnswerResult(result.data);
      }
    } catch {}
    setAnswerLoading(false);
  };

  const copyText = (text: string) => navigator.clipboard.writeText(text);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <MessageSquare className="h-4 w-4" />
          POI Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Type selector */}
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {POI_TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => setSelectedType(t.key)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-center transition-colors",
                selectedType === t.key
                  ? "border-brand-500 bg-brand-500/10 text-brand-600"
                  : "border-border/60 bg-card/60 text-muted-foreground hover:bg-muted"
              )}
            >
              <span className="text-base">{t.icon}</span>
              <span className="text-[10px] font-medium leading-tight">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Target + topic */}
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Target country"
            value={targetCountry}
            onChange={(e) => setTargetCountry(e.target.value)}
            className="h-8 text-xs"
          />
          <Input
            placeholder="Topic (optional)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Advanced */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className={cn("h-3 w-3 transition-transform", showAdvanced && "rotate-180")} />
          Custom prompt
        </button>
        {showAdvanced && (
          <Textarea
            placeholder="Override the default prompt..."
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
          Generate {POI_TYPES.find((t) => t.key === selectedType)?.label} POIs
        </Button>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((poi, i) => (
              <div key={i} className="rounded-lg border border-border/50 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{poi.type}</Badge>
                  {poi.targetCountry && (
                    <span className="text-[10px] text-muted-foreground">vs {poi.targetCountry}</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-6 w-6 p-0"
                    onClick={() => copyText(poi.text)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm font-medium">{poi.text}</p>
                <p className="text-xs text-muted-foreground">{poi.rationale}</p>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                  <div><span className="font-medium">Expected:</span> {poi.expectedResponse}</div>
                  <div><span className="font-medium">Follow-up:</span> {poi.followUp}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-card px-2 text-muted-foreground">Answer Mode</span>
          </div>
        </div>

        {/* POI Answer */}
        <div className="space-y-2">
          <div className="flex gap-1.5">
            {ANSWER_MODES.map((a) => (
              <button
                key={a.key}
                onClick={() => setAnswerMode(a.key)}
                className={cn(
                  "flex-1 rounded-lg border px-2 py-1.5 text-center text-[10px] font-medium transition-colors",
                  answerMode === a.key
                    ? "border-brand-500 bg-brand-500/10 text-brand-600"
                    : "border-border/60 text-muted-foreground hover:bg-muted"
                )}
              >
                {a.label}
                <span className="block text-[8px] font-normal">{a.desc}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Paste the POI you received..."
              value={answerPrompt}
              onChange={(e) => setAnswerPrompt(e.target.value)}
              className="h-8 text-xs"
              onKeyDown={(e) => e.key === "Enter" && handleAnswer()}
            />
            <Button
              size="sm"
              onClick={handleAnswer}
              disabled={answerLoading || !answerPrompt.trim()}
              className="h-8 px-3 text-xs shrink-0"
            >
              {answerLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3" />}
            </Button>
          </div>
          {answerResult && (
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
              <div className="mb-1 flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">{answerMode} Answer</Badge>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => copyText(answerResult)}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm leading-relaxed">{answerResult}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
