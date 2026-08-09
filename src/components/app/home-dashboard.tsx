"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home, Compass, Bot, Search, FolderKanban, UserRound,
  ChevronRight, Clock, Target, FileText, Award, Calendar,
  Zap, ArrowRight, CheckCircle, Circle, Star, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// ---------------------------------------------------------------------------
// MUN Lifecycle
// ---------------------------------------------------------------------------

interface LifecycleStage {
  key: string;
  label: string;
  icon: string;
  description: string;
  href?: string;
  completed: boolean;
  current: boolean;
}

const LIFECYCLE_STAGES: Omit<LifecycleStage, "completed" | "current">[] = [
  { key: "discover", label: "Discover", icon: "🔎", description: "Find your next MUN", href: "/discover" },
  { key: "register", label: "Register", icon: "📝", description: "Sign up for a conference" },
  { key: "assignment", label: "Get Assignment", icon: "🌍", description: "Country & committee" },
  { key: "research", label: "Research", icon: "🔬", description: "Deep-dive intelligence", href: "/research-agent" },
  { key: "prepare", label: "Prepare", icon: "📋", description: "Speeches & strategy", href: "/workspaces" },
  { key: "practice", label: "Practice", icon: "🎯", description: "AI-assisted rehearsal" },
  { key: "committee", label: "Committee", icon: "🏛️", description: "Live session tools", href: "/assistant" },
  { key: "performance", label: "Performance", icon: "📊", description: "Score & analytics", href: "/scoring" },
  { key: "passport", label: "Portfolio", icon: "🪪", description: "Your MUN career", href: "/passport" },
];

// ---------------------------------------------------------------------------
// Upcoming Conferences
// ---------------------------------------------------------------------------

interface UpcomingConference {
  id: string;
  name: string;
  date: string;
  daysLeft: number;
  committee?: string;
  country?: string;
}

function loadUpcoming(): UpcomingConference[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("munos.saved.conferences.meta");
    if (!raw) return [];
    const metas: Record<string, { name?: string; savedAt: number }> = JSON.parse(raw);
    return Object.entries(metas).slice(0, 3).map(([id, m], i) => ({
      id,
      name: m.name || `Conference ${i + 1}`,
      date: "TBD",
      daysLeft: 30 + i * 15,
    }));
  } catch { return []; }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HomeDashboard() {
  const [upcoming, setUpcoming] = useState<UpcomingConference[]>([]);
  const [currentStage, setCurrentStage] = useState(3); // Research stage by default
  const [completedStages, setCompletedStages] = useState<number[]>([0, 1, 2]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setUpcoming(loadUpcoming());
    try {
      const saved = localStorage.getItem("munos-lifecycle");
      if (saved) {
        const data = JSON.parse(saved);
        setCurrentStage(data.currentStage ?? 3);
        setCompletedStages(data.completedStages ?? [0, 1, 2]);
      }
    } catch {}
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      localStorage.setItem("munos-lifecycle", JSON.stringify({ currentStage, completedStages }));
    }
  }, [currentStage, completedStages, initialized]);

  const completeStage = (idx: number) => {
    if (!completedStages.includes(idx)) {
      setCompletedStages((prev) => [...prev, idx]);
    }
    if (idx === currentStage && idx < LIFECYCLE_STAGES.length - 1) {
      setCurrentStage(idx + 1);
    }
  };

  if (!initialized) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your MUN Journey</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything you need, from discovery to portfolio.
        </p>
      </div>

      {/* MUN Lifecycle */}
      <Card className="border-brand-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <span className="text-base">🔄</span> MUN Lifecycle
            <Badge variant="outline" className="ml-auto text-[10px]">
              Stage {currentStage + 1}/{LIFECYCLE_STAGES.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const completed = completedStages.includes(idx);
              const current = idx === currentStage;
              return (
                <div
                  key={stage.key}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-2.5 transition-colors",
                    current ? "border-brand-500 bg-brand-500/5" :
                    completed ? "border-green-500/20 bg-green-500/5" :
                    "border-border/30 bg-muted/20"
                  )}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm">
                    {completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : current ? (
                      <span className="text-lg">{stage.icon}</span>
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-medium", completed && "text-green-600", current && "text-brand-600")}>
                        {stage.label}
                      </span>
                      {current && <Badge className="h-3.5 text-[8px] bg-brand-500/10 text-brand-600">CURRENT</Badge>}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{stage.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {stage.href && (
                      <Button asChild variant="ghost" size="sm" className="h-6 text-[10px]">
                        <Link href={stage.href}>
                          Open <ChevronRight className="ml-0.5 h-2.5 w-2.5" />
                        </Link>
                      </Button>
                    )}
                    {current && !completed && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-[10px]"
                        onClick={() => completeStage(idx)}
                      >
                        Done
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming + Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Upcoming Conferences */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Upcoming MUNs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Globe className="mb-2 h-6 w-6 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">No upcoming conferences.</p>
                <Button asChild size="sm" variant="outline" className="mt-3 h-7 text-[10px]">
                  <Link href="/discover">Discover MUNs</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {upcoming.map((conf) => (
                  <div key={conf.id} className="flex items-center justify-between rounded-lg border border-border/30 p-2.5">
                    <div>
                      <div className="text-xs font-medium">{conf.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {conf.committee || "Committee TBD"} {conf.country ? `· ${conf.country}` : ""}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {conf.daysLeft}d
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {[
              { label: "Start Research", icon: <Search className="h-3.5 w-3.5" />, href: "/research-agent", color: "text-blue-600" },
              { label: "Open Workspace", icon: <FolderKanban className="h-3.5 w-3.5" />, href: "/workspaces", color: "text-purple-600" },
              { label: "AI Assistant", icon: <Bot className="h-3.5 w-3.5" />, href: "/assistant", color: "text-green-600" },
              { label: "My Passport", icon: <UserRound className="h-3.5 w-3.5" />, href: "/passport", color: "text-amber-600" },
              { label: "Discover MUNs", icon: <Compass className="h-3.5 w-3.5" />, href: "/discover", color: "text-pink-600" },
            ].map((action) => (
              <Button
                key={action.label}
                asChild
                variant="ghost"
                className="w-full justify-start text-xs"
              >
                <Link href={action.href}>
                  <span className={cn("mr-2", action.color)}>{action.icon}</span>
                  {action.label}
                  <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
