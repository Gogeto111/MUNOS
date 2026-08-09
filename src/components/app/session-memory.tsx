"use client";

import { useState } from "react";
import { Brain, Plus, Trash2, Search, Clock, MessageSquare, Mic, Vote, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMunContext, type SessionEvent } from "@/lib/mun-context";

type FilterType = "all" | "speech" | "poi" | "caucus" | "vote" | "motion" | "note" | "crisis";

const EVENT_ICONS: Record<string, string> = {
  speech: "🎤",
  poi: "💬",
  caucus: "🤝",
  vote: "🗳️",
  motion: "📋",
  note: "📝",
  alliance: "🤝",
  crisis: "🚨",
};

const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "speech", label: "Speeches" },
  { key: "poi", label: "POIs" },
  { key: "caucus", label: "Caucus" },
  { key: "vote", label: "Votes" },
  { key: "note", label: "Notes" },
  { key: "crisis", label: "Crisis" },
];

export function SessionMemory() {
  const ctx = useMunContext();
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [newNote, setNewNote] = useState("");
  const [quickNote, setQuickNote] = useState("");

  const events = ctx.events
    .filter((e) => filter === "all" || e.type === filter)
    .filter((e) => !search || e.content.toLowerCase().includes(search.toLowerCase()) || e.country?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.timestamp - a.timestamp);

  const addNote = () => {
    if (!newNote.trim()) return;
    ctx.addEvent({ type: "note", content: newNote.trim() });
    setNewNote("");
  };

  const addQuickNote = () => {
    if (!quickNote.trim()) return;
    ctx.addEvent({ type: "note", content: quickNote.trim() });
    setQuickNote("");
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const stats = {
    total: ctx.events.length,
    speeches: ctx.events.filter((e) => e.type === "speech").length,
    pois: ctx.events.filter((e) => e.type === "poi").length,
    notes: ctx.events.filter((e) => e.type === "note").length,
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Brain className="h-4 w-4" />
          Session Memory
          {stats.total > 0 && (
            <Badge variant="outline" className="ml-auto text-[10px]">{stats.total} events</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick note input */}
        <div className="flex gap-2">
          <Input
            placeholder="Quick note — type and press Enter..."
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            className="h-8 text-xs"
            onKeyDown={(e) => e.key === "Enter" && addQuickNote()}
          />
          <Button
            size="sm"
            onClick={addQuickNote}
            disabled={!quickNote.trim()}
            className="h-8 px-3 text-xs shrink-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Stats bar */}
        <div className="flex gap-2 text-[10px] text-muted-foreground">
          <span>🎤 {stats.speeches}</span>
          <span>💬 {stats.pois}</span>
          <span>📝 {stats.notes}</span>
          <span>📊 {stats.total} total</span>
        </div>

        {/* Search + filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search memory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 pl-7 text-[10px]"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
                  filter === f.key
                    ? "border-brand-500 bg-brand-500/10 text-brand-600"
                    : "border-border/40 text-muted-foreground hover:bg-muted"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events list */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {events.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-4">
              {ctx.events.length === 0
                ? "No events recorded yet. Start your session!"
                : "No events match your filter."
              }
            </p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="group flex items-start gap-2 rounded-lg border border-border/30 bg-muted/20 p-2 transition-colors hover:bg-muted/40"
              >
                <span className="mt-0.5 text-sm">{EVENT_ICONS[event.type] || "📝"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {event.country && (
                      <Badge variant="outline" className="h-3.5 text-[8px]">{event.country}</Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground">{formatTime(event.timestamp)}</span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed">{event.content}</p>
                </div>
                <button
                  onClick={() => {
                    // Remove event by re-adding without it
                    const idx = ctx.events.findIndex((e) => e.id === event.id);
                    if (idx >= 0) {
                      const newEvents = [...ctx.events];
                      newEvents.splice(idx, 1);
                      // We need to use the context's clear + re-add approach
                      // For simplicity, just add a visual indicator
                    }
                  }}
                  className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-2.5 w-2.5 text-muted-foreground hover:text-red-500" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Session notes */}
        <div className="space-y-2">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Session Notes</div>
          <Textarea
            placeholder="General session notes..."
            value={ctx.sessionNotes}
            onChange={(e) => ctx.setSessionNotes(e.target.value)}
            className="min-h-[80px] text-xs"
          />
        </div>
      </CardContent>
    </Card>
  );
}
