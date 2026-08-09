"use client";

import { useState } from "react";
import {
  Radio, Settings, Mic, Brain, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MunProvider, useMunContext } from "@/lib/mun-context";
import { LiveTimer } from "./live-timer";
import { PoiGenerator } from "./poi-generator";
import { SpeechGenerator } from "./speech-generator";
import { LiveTracker } from "./live-tracker";
import { SessionMemory } from "./session-memory";
import { LiveCoach } from "./live-coach";

type MidTab = "dashboard" | "live" | "scripts" | "intel";

const TABS: { key: MidTab; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard", label: "Committee", icon: <Radio className="h-3.5 w-3.5" /> },
  { key: "live", label: "Live Tools", icon: <Zap className="h-3.5 w-3.5" /> },
  { key: "scripts", label: "Scripts", icon: <Mic className="h-3.5 w-3.5" /> },
  { key: "intel", label: "Intelligence", icon: <Brain className="h-3.5 w-3.5" /> },
];

function CommitteeSetup() {
  const ctx = useMunContext();
  const [editing, setEditing] = useState(!ctx.country);

  if (!editing && ctx.country && ctx.committee) {
    return (
      <Card className="border-brand-500/20 bg-brand-500/5">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-brand-500" />
                <span className="text-sm font-semibold">{ctx.committee}</span>
                {ctx.sessionActive && (
                  <Badge className="h-4 text-[8px] bg-green-500/10 text-green-600 border-green-500/20 animate-pulse">
                    LIVE
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                🌍 {ctx.country} · 📋 {ctx.agenda || "No agenda set"}
              </div>
              {ctx.currentTopic && (
                <div className="text-xs text-muted-foreground">
                  🎯 Current: {ctx.currentTopic}
                </div>
              )}
              {ctx.currentModeratedCaucus && (
                <div className="text-xs text-muted-foreground">
                  ⚖️ Mod Caucus: {ctx.currentModeratedCaucus}
                </div>
              )}
              {ctx.currentSpeaker && (
                <div className="text-xs text-muted-foreground">
                  🎤 Speaker: {ctx.currentSpeaker}
                </div>
              )}
            </div>
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px]"
                onClick={() => ctx.setSessionActive(!ctx.sessionActive)}
              >
                {ctx.sessionActive ? "⏸ Pause" : "▶ Start"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px]"
                onClick={() => setEditing(true)}
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Radio className="h-4 w-4" />
          Committee Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Your country"
            value={ctx.country}
            onChange={(e) => ctx.setCountry(e.target.value)}
            className="h-8 text-xs"
          />
          <Input
            placeholder="Committee name"
            value={ctx.committee}
            onChange={(e) => ctx.setCommittee(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <Textarea
          placeholder="Agenda / topic"
          value={ctx.agenda}
          onChange={(e) => ctx.setAgenda(e.target.value)}
          className="min-h-[50px] text-xs"
        />
        <Input
          placeholder="Conference name (optional)"
          value={ctx.conference}
          onChange={(e) => ctx.setConference(e.target.value)}
          className="h-8 text-xs"
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Current moderated caucus topic"
            value={ctx.currentModeratedCaucus}
            onChange={(e) => ctx.setCurrentModeratedCaucus(e.target.value)}
            className="h-8 text-xs"
          />
          <Input
            placeholder="Current unmoderated caucus"
            value={ctx.currentUnmoderatedCaucus}
            onChange={(e) => ctx.setCurrentUnmoderatedCaucus(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Current speaker"
            value={ctx.currentSpeaker}
            onChange={(e) => ctx.setCurrentSpeaker(e.target.value)}
            className="h-8 text-xs"
          />
          <Button
            size="sm"
            onClick={() => {
              if (ctx.currentSpeaker && !ctx.speakingList.includes(ctx.currentSpeaker)) {
                ctx.setSpeakingList([...ctx.speakingList, ctx.currentSpeaker]);
              }
            }}
            className="h-8 px-3 text-xs shrink-0"
            disabled={!ctx.currentSpeaker}
          >
            Add to List
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Speaking list (comma-separated)"
            value={ctx.speakingList.join(", ")}
            onChange={(e) => ctx.setSpeakingList(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            className="h-8 text-xs"
          />
        </div>
        {ctx.country && ctx.committee && (
          <Button
            size="sm"
            onClick={() => { setEditing(false); ctx.setSessionActive(true); }}
            className="w-full text-xs"
          >
            <Zap className="mr-1 h-3 w-3" />
            Start Session
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardTab() {
  const ctx = useMunContext();

  return (
    <div className="space-y-4">
      <CommitteeSetup />

      {/* Speaking list */}
      {ctx.speakingList.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              🎤 Speaking List
              <Badge variant="outline" className="ml-auto text-[10px]">{ctx.speakingList.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {ctx.speakingList.map((s, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 rounded px-2 py-1.5 text-xs",
                    s === ctx.currentSpeaker
                      ? "bg-brand-500/10 text-brand-600 font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  <span className="w-5 text-center text-[10px]">{i + 1}.</span>
                  {s}
                  {s === ctx.currentSpeaker && <Badge className="ml-auto h-3.5 text-[8px]">CURRENT</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session stats */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">📊 Session Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-lg font-bold">{ctx.speeches.length}</div>
              <div className="text-[10px] text-muted-foreground">Speeches</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-lg font-bold">{ctx.pois.length}</div>
              <div className="text-[10px] text-muted-foreground">POIs</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-lg font-bold">{ctx.events.length}</div>
              <div className="text-[10px] text-muted-foreground">Events</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-lg font-bold">
                {ctx.alliances.filter((a) => a.status === "ally").length}
              </div>
              <div className="text-[10px] text-muted-foreground">Allies</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-lg font-bold">
                {ctx.alliances.filter((a) => a.status === "opposition").length}
              </div>
              <div className="text-[10px] text-muted-foreground">Opposition</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer + Coach side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LiveTimer />
        <LiveCoach />
      </div>
    </div>
  );
}

function LiveTab() {
  return (
    <div className="space-y-4">
      <LiveTimer />
      <LiveCoach />
      <SessionMemory />
    </div>
  );
}

function ScriptsTab() {
  return (
    <div className="space-y-4">
      <SpeechGenerator />
      <PoiGenerator />
    </div>
  );
}

function IntelTab() {
  return (
    <div className="space-y-4">
      <LiveTracker />
      <SessionMemory />
    </div>
  );
}

function MidSessionInner() {
  const [tab, setTab] = useState<MidTab>("dashboard");
  const ctx = useMunContext();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-brand-500" />
            <span className="text-sm font-semibold">Mid-Session</span>
            {ctx.sessionActive && (
              <Badge className="h-4 text-[8px] bg-green-500/10 text-green-600 border-green-500/20 animate-pulse">
                LIVE
              </Badge>
            )}
          </div>
          {ctx.country && ctx.committee && (
            <div className="text-[10px] text-muted-foreground">
              {ctx.country} · {ctx.committee}
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex gap-0.5 px-4 pb-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-t-lg px-3 py-1.5 text-xs font-medium transition-colors",
                tab === t.key
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {tab === "dashboard" && <DashboardTab />}
          {tab === "live" && <LiveTab />}
          {tab === "scripts" && <ScriptsTab />}
          {tab === "intel" && <IntelTab />}
        </div>
      </ScrollArea>
    </div>
  );
}

export function MidSessionDashboard() {
  return (
    <MunProvider>
      <MidSessionInner />
    </MunProvider>
  );
}
