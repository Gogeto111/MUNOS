"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, Bot, User, Loader2, Settings2, Trash2, Plus, MessageSquare,
  Clock, X, ChevronRight, ThumbsUp, ThumbsDown, Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  chatWithAssistant,
  debateWithOpponent,
  generateGsl,
  generatePois,
  analyzeSpeech,
  type MunContext,
  type GslResult,
  type PoiResult,
  type SpeechAnalysis,
} from "@/lib/actions/assistant";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "gsl" | "pois" | "speech";
  data?: GslResult | PoiResult | SpeechAnalysis;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  context: MunContext;
  createdAt: number;
}

const CHATS_KEY = "munos-chats";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadChats(): Chat[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHATS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveChats(chats: Chat[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  } catch {}
}

function createNewChat(): Chat {
  return {
    id: generateId(),
    title: "New chat",
    messages: [],
    context: {},
    createdAt: Date.now(),
  };
}

function autoTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New chat";
  return first.content.slice(0, 50) + (first.content.length > 50 ? "..." : "");
}

const QUICK_ACTIONS = [
  { label: "GSL 60s", icon: "🎤", action: "gsl60" },
  { label: "GSL 90s", icon: "🎤", action: "gsl90" },
  { label: "Counter Argument", icon: "⚔️", action: "counter" },
  { label: "POIs", icon: "💬", action: "poi" },
  { label: "Bloc Strategy", icon: "🤝", action: "bloc" },
  { label: "Yield Points", icon: "🕊️", action: "yield" },
  { label: "Resolution", icon: "📜", action: "resolution" },
  { label: "Practice POI", icon: "🧠", action: "practice" },
];

function GslCard({ data }: { data: GslResult }) {
  return (
    <div className="space-y-3 rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-brand-600">
        <span>🎤</span> GSL SPEECH · {data.estimatedSeconds}s · ~{data.wordCount} words
      </div>
      <div className="whitespace-pre-wrap text-sm leading-relaxed">{data.fullSpeech}</div>
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div><span className="font-medium">Hook:</span> {data.hook}</div>
        <div><span className="font-medium">Closing:</span> {data.closing}</div>
        <div><span className="font-medium">Key idea:</span> {data.keyStrategicIdea}</div>
      </div>
    </div>
  );
}

function PoiCard({ data }: { data: PoiResult }) {
  return (
    <div className="space-y-2 rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-orange-600">
        <span>⚔️</span> POINTS OF INFORMATION
      </div>
      {data.pois.map((poi, i) => (
        <div key={i} className="rounded-lg border border-border/50 p-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">{poi.type}</span>
            <span className="text-xs text-muted-foreground">vs {poi.targetCountry}</span>
          </div>
          <p className="mt-1 text-sm font-medium">{poi.text}</p>
          <p className="mt-1 text-xs text-muted-foreground">{poi.rationale}</p>
          <p className="mt-1 text-xs text-muted-foreground"><span className="font-medium">Expected:</span> {poi.expectedResponse}</p>
          <p className="mt-1 text-xs text-muted-foreground"><span className="font-medium">Follow-up:</span> {poi.followUp}</p>
        </div>
      ))}
    </div>
  );
}

function SpeechCard({ data }: { data: SpeechAnalysis }) {
  const dims = [
    { label: "Clarity", value: data.clarity },
    { label: "Confidence", value: data.confidence },
    { label: "Diplomacy", value: data.diplomacy },
    { label: "Structure", value: data.structure },
    { label: "Persuasion", value: data.persuasiveness },
    { label: "Research", value: data.research },
    { label: "Delivery", value: data.delivery },
  ];
  return (
    <div className="space-y-3 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-green-600">
        <span>📝</span> SPEECH ANALYSIS · Overall: {data.overall}/100
      </div>
      <div className="grid grid-cols-2 gap-2">
        {dims.map((d) => (
          <div key={d.label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{d.label}</span>
            <span className="font-mono font-medium">{d.value}/100</span>
          </div>
        ))}
      </div>
      <div className="rounded-lg bg-background/50 p-3 text-xs">
        <div><span className="font-medium">Biggest weakness:</span> {data.biggestWeakness}</div>
        <div><span className="font-medium">Strongest moment:</span> {data.strongestMoment}</div>
        <div><span className="font-medium">Fix next:</span> {data.oneThingToFix}</div>
      </div>
    </div>
  );
}

export function AssistantChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editContext, setEditContext] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [debateMode, setDebateMode] = useState(false);
  const [ratings, setRatings] = useState<Record<number, "up" | "down">>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      try { setRatings(JSON.parse(localStorage.getItem("munos-ratings") || "{}")); } catch {}
    }
  }, []);

  const rateMessage = (idx: number, rating: "up" | "down") => {
    setRatings((prev) => {
      const next = { ...prev };
      if (next[idx] === rating) delete next[idx];
      else next[idx] = rating;
      if (typeof window !== "undefined") localStorage.setItem("munos-ratings", JSON.stringify(next));
      return next;
    });
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeChat = chats.find((c) => c.id === activeId) ?? null;
  const messages = activeChat?.messages ?? [];
  const context = activeChat?.context ?? {};

  useEffect(() => {
    const loaded = loadChats();
    setChats(loaded);
    if (loaded.length > 0) {
      setActiveId(loaded[0].id);
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) saveChats(chats);
  }, [chats, initialized]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    if (!loading && textareaRef.current) textareaRef.current.focus();
  }, [loading]);

  const updateChat = (id: string, patch: Partial<Chat>) => {
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const addMessage = (chatId: string, msg: Message) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, msg], title: c.messages.length === 0 && msg.role === "user" ? autoTitle([msg]) : c.title }
          : c,
      ),
    );
  };

  const handleNewChat = () => {
    const chat = createNewChat();
    setChats((prev) => [chat, ...prev]);
    setActiveId(chat.id);
    setShowSidebar(false);
  };

  const handleDeleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      setActiveId(chats.find((c) => c.id !== id)?.id ?? null);
    }
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading || !activeId) return;

    const userMessage: Message = { role: "user", content: msg };
    addMessage(activeId, userMessage);
    setInput("");
    setLoading(true);

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const currentChat = chats.find((c) => c.id === activeId);
    if (!currentChat) { setLoading(false); return; }

    const allMessages = [...currentChat.messages, userMessage];
    const ctx = currentChat.context;

    try {
      // Detect GSL request
      const gslMatch = msg.match(/gsl|speech|speaking\s*(60|90|120)/i);
      const durationMatch = msg.match(/(60|90|120)/);
      const duration = durationMatch ? (Number(durationMatch[1]) as 60 | 90 | 120) : 60;

      if (gslMatch || (msg.toLowerCase().includes("write") && msg.toLowerCase().includes("gsl"))) {
        const result = await generateGsl(ctx, duration);
        if (result.status === "success") {
          addMessage(activeId, { role: "assistant", content: result.data.fullSpeech, type: "gsl", data: result.data });
        } else {
          addMessage(activeId, { role: "assistant", content: `Error: ${result.message}` });
        }
      }
      // Detect POI request
      else if (msg.match(/poi|point.*info/i) && !msg.match(/practice|throw/i)) {
        const result = await generatePois(ctx, msg, 5);
        if (result.status === "success") {
          addMessage(activeId, { role: "assistant", content: JSON.stringify(result.data.pois), type: "pois", data: result.data });
        } else {
          addMessage(activeId, { role: "assistant", content: `Error: ${result.message}` });
        }
      }
      // Detect speech analysis
      else if (msg.match(/analyz|score|review.*speech/i) && msg.length > 100) {
        const result = await analyzeSpeech(msg, ctx);
        if (result.status === "success") {
          addMessage(activeId, { role: "assistant", content: JSON.stringify(result.data), type: "speech", data: result.data });
        } else {
          addMessage(activeId, { role: "assistant", content: `Error: ${result.message}` });
        }
      }
      // General chat (or debate mode)
      else {
        if (debateMode) {
          const result = await debateWithOpponent(
            allMessages.map((m) => ({ role: m.role, content: m.content })),
            ctx,
          );
          if (result.status === "success") {
            addMessage(activeId, { role: "assistant", content: result.data });
          } else {
            addMessage(activeId, { role: "assistant", content: `Error: ${result.message}` });
          }
        } else {
          const result = await chatWithAssistant(
            allMessages.map((m) => ({ role: m.role, content: m.content })),
            ctx,
          );
          if (result.status === "success") {
            addMessage(activeId, { role: "assistant", content: result.data });
          } else {
            addMessage(activeId, { role: "assistant", content: `Error: ${result.message}` });
          }
        }
      }
    } catch {
      addMessage(activeId, { role: "assistant", content: "Something went wrong. Please try again." });
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
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
      gsl60: `Write me a 60-second GSL for ${country} in ${committee} on ${agenda}. Use structured output.`,
      gsl90: `Write me a 90-second GSL for ${country} in ${committee} on ${agenda}. Use structured output.`,
      counter: `Give me 3 strong counter-arguments against the most common position on ${agenda} that ${country} can use in ${committee}. For each, include the argument, evidence, and a diplomatic way to deliver it.`,
      poi: `Generate 5 POIs I can use in ${committee} on ${agenda}. Use structured output.`,
      bloc: `What bloc should ${country} form in ${committee} on ${agenda}? List 3-5 ideal allied countries, a bloc name, and a shared position paper outline.`,
      yield: `Give me 3 powerful yield points for ${country} in ${committee} on ${agenda}. Each should be a short, punchy sentence I can use to respond to opposing arguments.`,
      resolution: `Draft 5 actionable resolution clauses for ${agenda} that ${country} could propose.`,
      practice: `Throw me a challenging POI as if you're from an opposing country on ${agenda}.`,
    };

    const prompt = prompts[action];
    if (prompt) sendMessage(prompt);
  };

  const updateContext = (field: keyof MunContext, value: string) => {
    if (!activeId) return;
    updateChat(activeId, { context: { ...context, [field]: value } });
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex h-full">
      {/* Chat sidebar */}
      <div className={cn(
        "flex h-full flex-col border-r border-border/60 bg-card/30 transition-all",
        showSidebar ? "w-72" : "w-0 overflow-hidden",
      )}>
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <span className="text-sm font-semibold">Chats</span>
          <Button size="sm" variant="ghost" onClick={() => setShowSidebar(false)}>
            <X className="size-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors",
                chat.id === activeId ? "bg-brand-500/10 text-brand-600" : "hover:bg-muted/50",
              )}
              onClick={() => { setActiveId(chat.id); setShowSidebar(false); }}
            >
              <MessageSquare className="size-4 shrink-0" />
              <span className="flex-1 truncate">{chat.title}</span>
              <span className="text-[10px] text-muted-foreground">{formatTime(chat.createdAt)}</span>
              <button
                className="hidden group-hover:block text-muted-foreground hover:text-red-500"
                onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id); }}
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
          {chats.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">No chats yet</p>
          )}
        </div>
      </div>

      {/* Main chat */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="shrink-0 border-b border-border/60 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button size="sm" variant="ghost" onClick={() => setShowSidebar(!showSidebar)}>
                <ChevronRight className={cn("size-4 transition-transform", showSidebar && "rotate-180")} />
              </Button>
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
                  <p className="text-xs text-muted-foreground">Set context to get started</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={debateMode ? "default" : "ghost"}
                onClick={() => setDebateMode(!debateMode)}
                className={debateMode ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
              >
                ⚔️ {debateMode ? "Debating" : "Debate"}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleNewChat}>
                <Plus className="mr-1 size-3" /> New
              </Button>
              {activeChat && activeChat.messages.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-red-500"
                  onClick={() => activeId && updateChat(activeId, { messages: [] })}
                >
                  <Trash2 className="size-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditContext(!editContext)}
              >
                <Settings2 className="mr-1 size-3" />
                {editContext ? "Done" : "Context"}
              </Button>
            </div>
          </div>

          {editContext && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <input placeholder="Country" value={context.country || ""} onChange={(e) => updateContext("country", e.target.value)} className="h-8 rounded-md border border-border/60 bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-brand-500" />
              <input placeholder="Committee" value={context.committee || ""} onChange={(e) => updateContext("committee", e.target.value)} className="h-8 rounded-md border border-border/60 bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-brand-500" />
              <input placeholder="Agenda" value={context.agenda || ""} onChange={(e) => updateContext("agenda", e.target.value)} className="h-8 rounded-md border border-border/60 bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-brand-500" />
              <input placeholder="Conference (optional)" value={context.conference || ""} onChange={(e) => updateContext("conference", e.target.value)} className="h-8 rounded-md border border-border/60 bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((qa) => (
              <button
                key={qa.action}
                onClick={() => handleQuickAction(qa.action)}
                disabled={loading || !activeId}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <span>{qa.icon}</span>
                {qa.label}
              </button>
            ))}
          </div>

          {debateMode && (
            <div className="mt-3 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-xs text-orange-600">
              ⚔️ <span className="font-semibold">Debate Mode</span> — AI will argue against your position. Pick a country & committee in Context to begin.
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-700/20">
                <Bot className="size-8 text-brand-500" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">MUNOS AI</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Your MUN command center. Set your country, committee, and agenda, then ask anything.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">Shift+Enter for new lines · Enter to send</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={cn("mb-4 flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && (
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-600">
                  <Bot className="size-4" />
                </div>
              )}
              <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed", msg.role === "user" ? "bg-brand-600 text-white" : "bg-muted/50 text-foreground")}>
                {msg.type === "gsl" && msg.data ? (
                  <GslCard data={msg.data as GslResult} />
                ) : msg.type === "pois" && msg.data ? (
                  <PoiCard data={msg.data as PoiResult} />
                ) : msg.type === "speech" && msg.data ? (
                  <SpeechCard data={msg.data as SpeechAnalysis} />
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-1 self-end">
                  <button
                    onClick={() => copyMessage(msg.content)}
                    className="rounded p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    title="Copy"
                  >
                    <Copy className="size-3" />
                  </button>
                  <button
                    onClick={() => rateMessage(i, "up")}
                    className={cn("rounded p-1 transition-colors", ratings[i] === "up" ? "text-green-500" : "text-muted-foreground/50 hover:text-green-500")}
                    title="Helpful"
                  >
                    <ThumbsUp className="size-3" />
                  </button>
                  <button
                    onClick={() => rateMessage(i, "down")}
                    className={cn("rounded p-1 transition-colors", ratings[i] === "down" ? "text-red-500" : "text-muted-foreground/50 hover:text-red-500")}
                    title="Not helpful"
                  >
                    <ThumbsDown className="size-3" />
                  </button>
                </div>
              )}
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
              disabled={loading || !activeId}
              rows={1}
            />
            <Button size="icon" disabled={loading || !input.trim() || !activeId} onClick={() => sendMessage()} className="shrink-0">
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
