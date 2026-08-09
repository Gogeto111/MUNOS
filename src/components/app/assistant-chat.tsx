"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  chatWithAssistant,
  generateGsl,
  generatePois,
  type MunContext,
} from "@/lib/actions/assistant";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_ACTIONS = [
  { label: "GSL", icon: "🎤", action: "gsl" },
  { label: "POIs", icon: "⚔️", action: "poi" },
  { label: "Speech", icon: "📝", action: "speech" },
  { label: "Resolution", icon: "📜", action: "resolution" },
  { label: "Strategy", icon: "🎯", action: "strategy" },
  { label: "Practice", icon: "🧠", action: "practice" },
  { label: "Timer", icon: "⏱️", action: "timer" },
  { label: "News", icon: "📰", action: "news" },
];

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<MunContext>({});
  const [editContext, setEditContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMessage: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const result = await chatWithAssistant(
      [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
      context,
    );

    if (result.status === "success") {
      setMessages((prev) => [...prev, { role: "assistant", content: result.data }]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${result.message}` },
      ]);
    }
    setLoading(false);
  };

  const handleQuickAction = (action: string) => {
    const prompts: Record<string, string> = {
      gsl: `Generate a 60-second GSL speech for ${context.country || "my country"} in ${context.committee || "committee"} on ${context.agenda || "the agenda"}.`,
      poi: "Generate 5 POIs I can use against opposing countries.",
      speech: "Analyze my speech and give me feedback.",
      resolution: `Draft resolution clauses for ${context.agenda || "the agenda"}.`,
      strategy: `What strategy should ${context.country || "my country"} use in ${context.committee || "committee"}?`,
      practice: "Throw a POI at me. I'll practice answering it.",
      timer: "Start a 60-second timer for my GSL speech.",
      news: "What are the latest developments on the agenda topic?",
    };
    const prompt = prompts[action];
    if (prompt) sendMessage(prompt);
  };

  const updateContext = (field: keyof MunContext, value: string) => {
    setContext((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <Bot className="size-5" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">AI ASSISTANT</h1>
              {context.country && context.committee && context.agenda ? (
                <p className="text-xs text-muted-foreground">
                  {context.country} · {context.committee} · {context.agenda}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Set your context to get started
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditContext(!editContext)}
          >
            {editContext ? "Done" : "Set Context"}
          </Button>
        </div>

        {/* Context editor */}
        {editContext && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder="Country (e.g., Syria)"
              value={context.country || ""}
              onChange={(e) => updateContext("country", e.target.value)}
              className="h-8 text-xs"
            />
            <Input
              placeholder="Committee (e.g., UNGA)"
              value={context.committee || ""}
              onChange={(e) => updateContext("committee", e.target.value)}
              className="h-8 text-xs"
            />
            <Input
              placeholder="Agenda (e.g., Ocean Governance)"
              value={context.agenda || ""}
              onChange={(e) => updateContext("agenda", e.target.value)}
              className="h-8 text-xs"
            />
            <Input
              placeholder="Conference (optional)"
              value={context.conference || ""}
              onChange={(e) => updateContext("conference", e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        )}

        {/* Quick actions */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.action}
              onClick={() => handleQuickAction(qa.action)}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <span>{qa.icon}</span>
              {qa.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-700/20">
              <Bot className="size-8 text-brand-500" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">MUNOS AI Assistant</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Your MUN command center. Set your country, committee, and agenda,
              then ask anything — GSL speeches, POIs, strategy, or practice.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                "Generate a 60s GSL for Syria on Ocean Governance",
                "What POIs can I use against China?",
                "Draft resolution clauses for climate migration",
                "Analyze my speech weakness",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "mb-4 flex gap-3",
              msg.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            {msg.role === "assistant" && (
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-600">
                <Bot className="size-4" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-brand-600 text-white"
                  : "bg-muted/50 text-foreground",
              )}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
            {msg.role === "user" && (
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                <User className="size-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="mb-4 flex gap-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-600">
              <Bot className="size-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-4 py-3">
              <Loader2 className="size-4 animate-spin text-brand-500" />
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border/60 px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about MUN..."
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
