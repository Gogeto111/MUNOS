"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, Settings2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  chatWithAssistant,
  type MunContext,
} from "@/lib/actions/assistant";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_ACTIONS = [
  { label: "GSL 60s", icon: "🎤", action: "gsl60" },
  { label: "GSL 90s", icon: "🎤", action: "gsl90" },
  { label: "GSL 120s", icon: "🎤", action: "gsl120" },
  { label: "POIs", icon: "⚔️", action: "poi" },
  { label: "Analyze Speech", icon: "📝", action: "speech" },
  { label: "Resolution", icon: "📜", action: "resolution" },
  { label: "Strategy", icon: "🎯", action: "strategy" },
  { label: "Practice POI", icon: "🧠", action: "practice" },
  { label: "Current Affairs", icon: "📰", action: "news" },
];

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<MunContext>({});
  const [editContext, setEditContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Auto-focus textarea after message sent
  useEffect(() => {
    if (!loading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [loading]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMessage: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    // Shift+Enter = newline (default behavior, no prevention)
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 150) + "px";
  };

  const handleQuickAction = (action: string) => {
    const c = context;
    const country = c.country || "my country";
    const committee = c.committee || "my committee";
    const agenda = c.agenda || "the agenda";

    const prompts: Record<string, string> = {
      gsl60: `Write me a powerful 60-second GSL speech for ${country} in ${committee} on ${agenda}. Make the opening line a hook that grabs attention. Make the closing line a one-liner that leaves the room silent. Use ${country}'s ACTUAL foreign policy. Include specific statistics or resolutions. Format: [HOOK] → [POSITION] → [EVIDENCE] → [PROPOSAL] → [CLOSING HOOK]`,
      gsl90: `Write me a powerful 90-second GSL speech for ${country} in ${committee} on ${agenda}. Make the opening line a hook that grabs attention. Make the closing line a one-liner that leaves the room silent. Use ${country}'s ACTUAL foreign policy. Include specific statistics, treaties, and UN resolutions. Format: [HOOK] → [CONTEXT] → [POSITION] → [EVIDENCE] → [PROPOSALS] → [CLOSING HOOK]`,
      gsl120: `Write me a powerful 120-second GSL speech for ${country} in ${committee} on ${agenda}. Make the opening line a hook that grabs attention. Make the closing line a one-liner that leaves the room silent. Use ${country}'s ACTUAL foreign policy. Include specific statistics, treaties, UN resolutions, and real-world examples. Format: [HOOK] → [CONTEXT] → [PROBLEM] → [POSITION] → [EVIDENCE] → [PROPOSALS] → [CALL TO ACTION] → [CLOSING HOOK]`,
      poi: `Generate 5 sharp Points of Information I can use in ${committee} on ${agenda}. For each POI, give me: the exact question, which country it targets, why it's devastating, and a follow-up if they dodge. Mix diplomatic, aggressive, and trap POIs.`,
      speech: `Analyze my speech and give me a brutally honest score out of 100. Break it down: Clarity, Confidence, Diplomacy, Structure, Research, Persuasion. Tell me my ONE biggest weakness and ONE strongest moment. Then rewrite my opening 10 seconds to be stronger.`,
      resolution: `Draft 5 actionable resolution clauses for ${agenda} that ${country} could realistically propose. Each clause must: (1) start with "The General Assembly", (2) include a funding mechanism, (3) include implementation details, (4) be specific enough to actually work. Also suggest 2 preambulatory clauses.`,
      strategy: `What is ${country}'s optimal strategy in ${committee} on ${agenda}? Give me: (1) Key allies to caucus with, (2) Countries to avoid, (3) 3 strong arguments, (4) 2 potential compromises, (5) How to handle hostile POIs, (6) What resolutions to support vs block.`,
      practice: `I'm practicing POI responses. Throw me a challenging POI as if you're a delegate from an opposing country. Make it specific to ${country}'s position on ${agenda}. I'll respond, and you score me 0-100 on Relevance, Diplomacy, Confidence, and Time Management.`,
      news: `What are the latest real-world developments on ${agenda}? Give me 3 breaking news items, explain why each matters to ${country}, and suggest how ${country} can reference them in speeches.`,
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
            <Settings2 className="mr-1 size-3" />
            {editContext ? "Done" : "Context"}
          </Button>
        </div>

        {/* Context editor */}
        {editContext && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <input
              placeholder="Country (e.g., Syria)"
              value={context.country || ""}
              onChange={(e) => updateContext("country", e.target.value)}
              className="h-8 rounded-md border border-border/60 bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-brand-500"
            />
            <input
              placeholder="Committee (e.g., UNGA)"
              value={context.committee || ""}
              onChange={(e) => updateContext("committee", e.target.value)}
              className="h-8 rounded-md border border-border/60 bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-brand-500"
            />
            <input
              placeholder="Agenda (e.g., Ocean Governance)"
              value={context.agenda || ""}
              onChange={(e) => updateContext("agenda", e.target.value)}
              className="h-8 rounded-md border border-border/60 bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-brand-500"
            />
            <input
              placeholder="Conference (optional)"
              value={context.conference || ""}
              onChange={(e) => updateContext("conference", e.target.value)}
              className="h-8 rounded-md border border-border/60 bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        )}

        {/* Quick actions */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.action}
              onClick={() => handleQuickAction(qa.action)}
              disabled={loading}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <span>{qa.icon}</span>
              {qa.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-700/20">
              <Bot className="size-8 text-brand-500" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">MUNOS AI</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Your MUN command center. Set your country, committee, and agenda,
              then ask anything — or use the quick actions above.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Shift+Enter for new lines · Enter to send
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                "Write a 60s GSL for Syria on Ocean Governance",
                "Generate 5 POIs against China",
                "What's Syria's strategy in UNGA?",
                "Draft resolution clauses for climate migration",
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
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
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
              <span className="text-sm text-muted-foreground">Preparing your MUN strategy...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border/60 px-4 py-3">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about MUN... (Shift+Enter for new line)"
            className="min-h-[44px] max-h-[150px] flex-1 resize-none"
            disabled={loading}
            rows={1}
          />
          <Button
            size="icon"
            disabled={loading || !input.trim()}
            onClick={() => sendMessage()}
            className="shrink-0"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
