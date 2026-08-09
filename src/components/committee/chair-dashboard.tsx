"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DelegateCard, AddDelegateForm, type Delegate } from "./delegate-card";
import { SpeakingQueue } from "./speaking-queue";
import {
  MotionTracker,
  type Motion,
  type MotionType,
} from "./motion-tracker";
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Trash2,
  Users,
  Timer,
  Vote,
  BarChart3,
  Plus,
  Search,
  X,
} from "lucide-react";

let nextId = 1;
function uid(): string {
  return `d${nextId++}`;
}

function motionUid(): string {
  return `m${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const DEFAULT_SPEAKER_TIME = 120;

interface SessionLog {
  timestamp: number;
  event: string;
  details: string;
}

export function ChairDashboard() {
  // Delegates
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [delegateSearch, setDelegateSearch] = useState("");

  // Queue
  const [queue, setQueue] = useState<string[]>([]);
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(-1);

  // Timer
  const [speakerTime, setSpeakerTime] = useState(DEFAULT_SPEAKER_TIME);
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_SPEAKER_TIME);
  const [timerRunning, setTimerRunning] = useState(false);
  const [speakerTimeTotal, setSpeakerTimeTotal] = useState(DEFAULT_SPEAKER_TIME);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Motions
  const [motions, setMotions] = useState<Motion[]>([]);

  // Session
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionLog, setSessionLog] = useState<SessionLog[]>([]);

  // Stats
  const [totalSessions] = useState(0);

  // Timer logic
  useEffect(() => {
    if (timerRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timeRemaining]);

  const handleTimerEnd = useCallback(() => {
    setTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    // Log speaker time
    if (currentSpeakerIndex >= 0 && currentSpeakerIndex < queue.length) {
      const delegateId = queue[currentSpeakerIndex];
      setDelegates((prev) =>
        prev.map((d) =>
          d.id === delegateId
            ? { ...d, speakingTime: d.speakingTime + speakerTimeTotal }
            : d
        )
      );
      addLog("Speaker Finished", `${getDelegateById(delegateId)?.country} finished speaking`);
    }

    // Auto-advance to next speaker
    if (currentSpeakerIndex < queue.length - 1) {
      setCurrentSpeakerIndex((prev) => prev + 1);
      setTimeRemaining(speakerTime);
      setTimerRunning(true);
    }
  }, [currentSpeakerIndex, queue, speakerTime, speakerTimeTotal]);

  const getDelegateById = (id: string) => delegates.find((d) => d.id === id);

  const addLog = (event: string, details: string) => {
    setSessionLog((prev) => [
      { timestamp: Date.now(), event, details },
      ...prev,
    ].slice(0, 200));
  };

  // Delegate actions
  const handleAddDelegate = (country: string) => {
    const id = uid();
    setDelegates((prev) => [
      ...prev,
      {
        id,
        country,
        speakingTime: 0,
        poisReceived: 0,
        status: "present",
        queueStatus: "none",
      },
    ]);
    addLog("Delegate Added", country);
  };

  const handleRemoveDelegate = (id: string) => {
    const d = getDelegateById(id);
    setDelegates((prev) => prev.filter((d) => d.id !== id));
    setQueue((prev) => prev.filter((qid) => qid !== id));
    if (d) addLog("Delegate Removed", d.country);
  };

  const handleToggleStatus = (id: string) => {
    setDelegates((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const next =
          d.status === "absent"
            ? "present"
            : d.status === "present"
              ? "present-vote"
              : "absent";
        return { ...d, status: next };
      })
    );
  };

  // Queue actions
  const handleAddToQueue = (id: string) => {
    setQueue((prev) => [...prev, id]);
    setDelegates((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, queueStatus: "in-queue" as const } : d
      )
    );
    const d = getDelegateById(id);
    if (d) addLog("Added to Queue", d.country);
  };

  const handleRemoveFromQueue = (id: string) => {
    setQueue((prev) => prev.filter((qid) => qid !== id));
    setDelegates((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, queueStatus: "none" as const } : d
      )
    );
    const d = getDelegateById(id);
    if (d) addLog("Removed from Queue", d.country);
  };

  const handleYield = (id: string) => {
    setDelegates((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, queueStatus: "yielded" as const } : d
      )
    );
    const d = getDelegateById(id);
    if (d) addLog("Yielded", d.country);
    handleSkip();
  };

  const handleSkip = () => {
    if (currentSpeakerIndex >= 0 && currentSpeakerIndex < queue.length) {
      const prevId = queue[currentSpeakerIndex];
      setDelegates((prev) =>
        prev.map((d) =>
          d.id === prevId ? { ...d, queueStatus: "in-queue" as const } : d
        )
      );
    }
    if (currentSpeakerIndex < queue.length - 1) {
      setCurrentSpeakerIndex((prev) => prev + 1);
      setTimeRemaining(speakerTime);
    } else {
      setCurrentSpeakerIndex(-1);
      setTimerRunning(false);
    }
  };

  const handleReorder = (from: number, to: number) => {
    if (to < 0 || to >= queue.length) return;
    const newQueue = [...queue];
    const [item] = newQueue.splice(from, 1);
    newQueue.splice(to, 0, item);
    setQueue(newQueue);

    // Adjust current speaker index
    if (currentSpeakerIndex === from) {
      setCurrentSpeakerIndex(to);
    } else if (
      from < currentSpeakerIndex &&
      to >= currentSpeakerIndex
    ) {
      setCurrentSpeakerIndex((prev) => prev - 1);
    } else if (
      from > currentSpeakerIndex &&
      to <= currentSpeakerIndex
    ) {
      setCurrentSpeakerIndex((prev) => prev + 1);
    }
  };

  const handleGrantPOI = (id: string) => {
    setDelegates((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, poisReceived: d.poisReceived + 1 } : d
      )
    );
    const d = getDelegateById(id);
    if (d) addLog("POI Granted", d.country);
  };

  // Timer controls
  const startTimer = () => {
    if (currentSpeakerIndex < 0 && queue.length > 0) {
      setCurrentSpeakerIndex(0);
      setTimeRemaining(speakerTime);
    }
    setTimerRunning(true);
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeRemaining(speakerTime);
  };

  // Motion actions
  const handleCreateMotion = (
    type: MotionType,
    details: string,
    proposedBy: string,
    duration?: number
  ) => {
    const motion: Motion = {
      id: motionUid(),
      type,
      details,
      proposedBy,
      status: "active",
      votes: { for: 0, against: 0, abstain: 0 },
      totalVoters: delegates.filter((d) => d.status !== "absent").length,
      timestamp: Date.now(),
      duration,
    };
    setMotions((prev) => [motion, ...prev]);
    addLog("Motion Proposed", `${MOTION_LABELS[type]}: ${details}`);
  };

  const handleVote = (
    motionId: string,
    vote: "for" | "against" | "abstain"
  ) => {
    setMotions((prev) =>
      prev.map((m) =>
        m.id === motionId
          ? { ...m, votes: { ...m.votes, [vote]: m.votes[vote] + 1 } }
          : m
      )
    );
  };

  const handleSetStatus = (
    motionId: string,
    status: Motion["status"]
  ) => {
    setMotions((prev) =>
      prev.map((m) => (m.id === motionId ? { ...m, status } : m))
    );
    const m = motions.find((m) => m.id === motionId);
    if (m) addLog(`Motion ${status}`, MOTION_LABELS[m.type]);
  };

  // Session controls
  const handleStartSession = () => {
    setSessionActive(true);
    addLog("Session Started", "");
  };

  const handleEndSession = () => {
    setSessionActive(false);
    setTimerRunning(false);
    addLog("Session Ended", "");
  };

  const handleClearQueue = () => {
    setQueue([]);
    setCurrentSpeakerIndex(-1);
    setTimerRunning(false);
    setTimeRemaining(speakerTime);
    setDelegates((prev) =>
      prev.map((d) => ({ ...d, queueStatus: "none" as const }))
    );
    addLog("Queue Cleared", "");
  };

  const handleExportLog = () => {
    const lines = sessionLog.map(
      (l) =>
        `${new Date(l.timestamp).toISOString()} | ${l.event} | ${l.details}`
    );
    const blob = new Blob(
      [`MUN Committee Session Log\n${"=".repeat(40)}\n\n${lines.join("\n")}`],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `committee-session-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addLog("Log Exported", "");
  };

  // Stats
  const presentDelegates = delegates.filter((d) => d.status !== "absent");
  const totalSpeakingTime = delegates.reduce(
    (acc, d) => acc + d.speakingTime,
    0
  );
  const totalPOIs = delegates.reduce((acc, d) => acc + d.poisReceived, 0);
  const passedMotions = motions.filter((m) => m.status === "passed").length;

  const MOTION_LABELS: Record<MotionType, string> = {
    "moderated-caucus": "Moderated Caucus",
    "unmoderated-caucus": "Unmoderated Caucus",
    "close-debate": "Close Debate",
    "extend-debate": "Extend Debate",
    "suspend-rules": "Suspend Rules",
    "introduce-resolution": "Introduce Resolution",
    "amend-resolution": "Amend Resolution",
    "vote-resolution": "Vote on Resolution",
    other: "Other Motion",
  };

  const activeMotion = motions.find((m) => m.status === "active") ?? null;

  const filteredDelegates = delegates.filter(
    (d) =>
      d.country.toLowerCase().includes(delegateSearch.toLowerCase()) ||
      delegateSearch === ""
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Chair Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your committee session
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sessionActive && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </Badge>
          )}
          {!sessionActive ? (
            <Button onClick={handleStartSession} className="gap-1">
              <Play className="size-4" /> Start Session
            </Button>
          ) : (
            <Button
              onClick={handleEndSession}
              variant="outline"
              className="gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              End Session
            </Button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="size-4" />
            <span className="text-xs">Delegates</span>
          </div>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {presentDelegates.length}
            <span className="text-sm font-normal text-muted-foreground">
              /{delegates.length}
            </span>
          </p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Timer className="size-4" />
            <span className="text-xs">Total Time</span>
          </div>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {formatTime(totalSpeakingTime)}
          </p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="size-4" />
            <span className="text-xs">POIs</span>
          </div>
          <p className="mt-1 text-2xl font-bold tabular-nums">{totalPOIs}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Vote className="size-4" />
            <span className="text-xs">Motions Passed</span>
          </div>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {passedMotions}
          </p>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Delegate List */}
        <div className="lg:col-span-4 space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Delegate List</CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  {delegates.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <AddDelegateForm onAdd={handleAddDelegate} />
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search delegates..."
                  value={delegateSearch}
                  onChange={(e) => setDelegateSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
                {delegateSearch && (
                  <button
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    onClick={() => setDelegateSearch("")}
                  >
                    <X className="size-3 text-muted-foreground" />
                  </button>
                )}
              </div>
              <ScrollArea className="max-h-[40vh]">
                <div className="space-y-1.5">
                  {filteredDelegates.map((d) => (
                    <DelegateCard
                      key={d.id}
                      delegate={d}
                      compact
                      onAddToQueue={handleAddToQueue}
                      onRemove={handleRemoveDelegate}
                    />
                  ))}
                  {filteredDelegates.length === 0 && (
                    <p className="py-6 text-center text-xs text-muted-foreground">
                      {delegates.length === 0
                        ? "Add delegates above"
                        : "No matches"}
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Session Controls */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Session Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1"
                  onClick={handleClearQueue}
                >
                  <Trash2 className="size-3" /> Clear Queue
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1"
                  onClick={handleExportLog}
                >
                  <Download className="size-3" /> Export Log
                </Button>
              </div>

              {/* Timer Controls */}
              <div className="rounded-lg border border-border/40 p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Speaker Time
                  </span>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={speakerTime}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 60;
                        setSpeakerTime(v);
                        if (!timerRunning) setTimeRemaining(v);
                      }}
                      className="h-7 w-16 text-center text-xs font-mono"
                    />
                    <span className="text-[10px] text-muted-foreground">sec</span>
                  </div>
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      "text-4xl font-bold tabular-nums font-mono",
                      timeRemaining <= 10
                        ? "text-red-400"
                        : timeRemaining <= 30
                          ? "text-amber-400"
                          : "text-emerald-400"
                    )}
                  >
                    {formatTime(timeRemaining)}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {!timerRunning ? (
                    <Button
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={startTimer}
                    >
                      <Play className="size-3" /> Start
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                      onClick={pauseTimer}
                    >
                      <Pause className="size-3" /> Pause
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1"
                    onClick={resetTimer}
                  >
                    <RotateCcw className="size-3" /> Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Speaking Queue */}
        <div className="lg:col-span-4">
          <Card className="h-full">
            <CardContent className="p-3 h-full">
              <SpeakingQueue
                queue={queue}
                delegates={delegates}
                currentIndex={currentSpeakerIndex}
                speakerTimeRemaining={timeRemaining}
                speakerTimeTotal={speakerTime}
                onRemove={handleRemoveFromQueue}
                onYield={handleYield}
                onReorder={handleReorder}
                onSkip={handleSkip}
              />
            </CardContent>
          </Card>
        </div>

        {/* Motion Tracker */}
        <div className="lg:col-span-4">
          <MotionTracker
            motions={motions}
            activeMotion={activeMotion}
            onCreateMotion={handleCreateMotion}
            onVote={handleVote}
            onSetStatus={handleSetStatus}
            totalDelegates={presentDelegates.length}
          />
        </div>
      </div>

      {/* Session Log */}
      {sessionLog.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="size-4" /> Session Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[15vh]">
              <div className="space-y-1">
                {sessionLog.slice(0, 50).map((log, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-xs text-muted-foreground"
                  >
                    <span className="font-mono tabular-nums shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[9px] shrink-0"
                    >
                      {log.event}
                    </Badge>
                    <span className="truncate">{log.details}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
