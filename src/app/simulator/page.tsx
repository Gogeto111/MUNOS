"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Gavel,
  Loader2,
  Send,
  Globe,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { createSimulation } from "@/lib/actions/simulation/create";
import { startSimulation, finishSimulation } from "@/lib/actions/simulation/run";
import { generateAISpeech } from "@/lib/actions/simulation/ai";
import { getSimulationState } from "@/lib/actions/simulation/state";
import { COUNTRIES } from "@/lib/constants";
import { SpeakingTimer } from "@/components/simulator/speaking-timer";
import { POIQueue } from "@/components/simulator/poi-queue";
import { ChairPersonality, type ChairPersonalityType } from "@/components/simulator/chair-personality";
import { DebateSummaryPanel } from "@/components/simulator/debate-summary";

const COMMITTEES = [
  "UNSC — Security Council",
  "DISEC — Disarmament & Int. Security",
  "HRC — Human Rights Council",
  "UNHCR — Refugees",
  "WHO — World Health Organization",
  "ECOSOC — Economic & Social",
  "UN Women",
  "UNFCCC — Climate Change",
];

type SimEvent = {
  id: string;
  type: string;
  content: string;
  delegateId: string | null;
  createdAt: Date;
};

type Delegate = {
  id: string;
  country: string;
  displayName: string;
  isAi: boolean;
};

export default function SimulatorPage() {
  const [step, setStep] = useState<"setup" | "running" | "finished">("setup");
  const [committee, setCommittee] = useState("");
  const [topic, setTopic] = useState("");
  const [country, setCountry] = useState("");
  const [delegates, setDelegates] = useState<string[]>([]);
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [allDelegates, setAllDelegates] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState(false);
  const [simId, setSimId] = useState<string | null>(null);
  const [userMessage, setUserMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [chairPersonality, setChairPersonality] = useState<ChairPersonalityType>("moderate");
  const [currentSpeaker, setCurrentSpeaker] = useState<string | undefined>();

  const refresh = useCallback(async (id: string) => {
    const r = await getSimulationState(id);
    if (r.status === "success" && r.data) {
      setAllDelegates(r.data.delegates as Delegate[]);
      setEvents(r.data.events as SimEvent[]);
    }
  }, []);

  useEffect(() => {
    if (simId) refresh(simId);
  }, [simId, refresh]);

  const handleStart = async () => {
    if (!committee || !country || delegates.length < 1) {
      toast.error("Pick a committee, your country, and at least 1 AI delegate.");
      return;
    }
    setLoading(true);
    const r = await createSimulation({
      committeeName: committee,
      topic: topic || "General Debate",
      country,
      delegateCountries: delegates,
    });
    if (r.status === "error") { toast.error(r.message); setLoading(false); return; }

    const id = (r as { data: { id: string } }).data.id;
    const s = await startSimulation(id);
    if (s.status === "error") { toast.error(s.message); setLoading(false); return; }

    setSimId(id);
    setStep("running");
    toast.success("Simulation started!");
    setLoading(false);
    await refresh(id);
  };

  const handleSpeak = async () => {
    if (!simId || !userMessage.trim()) return;
    setSending(true);
    setUserMessage("");

    const userDel = allDelegates.find((d) => !d.isAi);
    if (userDel) {
      setEvents((prev) => [...prev, {
        id: `user-${Date.now()}`,
        type: "SPEECH",
        content: userMessage.trim(),
        delegateId: userDel.id,
        createdAt: new Date(),
      }]);
    }

    const aiDel = allDelegates.find((d) => d.isAi);
    if (aiDel) {
      const r = await generateAISpeech(simId, aiDel.id);
      if (r.status === "error") toast.error(r.message);
    }

    await refresh(simId);
    setSending(false);
  };

  const handleEnd = async () => {
    if (!simId) return;
    setLoading(true);
    const r = await finishSimulation(simId);
    if (r.status === "error") toast.error(r.message);
    await refresh(simId);
    setStep("finished");
    setLoading(false);
  };

  const toggleDelegate = (c: string) => {
    setDelegates((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : prev.length < 5 ? [...prev, c] : prev,
    );
  };

  if (step === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Committee Simulator</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Practice MUN debate with AI delegates. Pick your committee, topic, and country.
            </p>
          </div>

          <Card>
            <CardContent className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Committee</label>
                <Select value={committee} onValueChange={setCommittee}>
                  <SelectTrigger><SelectValue placeholder="Choose a committee" /></SelectTrigger>
                  <SelectContent>
                    {COMMITTEES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Topic</label>
                <Textarea
                  placeholder="e.g. Regulation of autonomous weapons systems"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Your Country</label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger><SelectValue placeholder="Choose your country" /></SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">AI Delegates (1-5 countries to debate against)</label>
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.filter((c) => c !== country).slice(0, 30).map((c) => (
                    <Badge
                      key={c}
                      variant={delegates.includes(c) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleDelegate(c)}
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{delegates.length}/5 selected</p>
              </div>

              <ChairPersonality
                selected={chairPersonality}
                onSelect={setChairPersonality}
              />

              <Button
                onClick={handleStart}
                disabled={!committee || !country || delegates.length < 1 || loading}
                className="w-full gap-2"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Gavel className="size-4" />}
                {loading ? "Starting..." : "Start Simulation"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const userDel = allDelegates.find((d) => !d.isAi);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{committee}</h1>
            <p className="text-sm text-muted-foreground">{topic || "General Debate"} • You are {country}</p>
          </div>
          <div className="flex gap-2">
            {step === "running" && (
              <Button variant="destructive" onClick={handleEnd} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Gavel className="size-4" />}
                End Session
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Gavel className="size-4" /> Committee Floor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[50vh]">
                  <div className="space-y-3">
                    {events.length === 0 && (
                      <p className="py-8 text-center text-sm text-muted-foreground">
                        The chair will open the session shortly.
                      </p>
                    )}
                    {events.map((ev) => (
                      <div
                        key={ev.id}
                        className={`rounded-lg border p-3 ${
                          ev.type === "CHAIR_ANNOUNCEMENT"
                            ? "border-brand-500/30 bg-brand-500/5"
                            : ev.type === "SPEECH"
                              ? "border-border/60 bg-muted/20"
                              : "border-emerald-500/30 bg-emerald-500/5"
                        }`}
                      >
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {ev.type === "CHAIR_ANNOUNCEMENT" ? "Chair" :
                           allDelegates.find((d) => d.id === ev.delegateId)?.country || "Unknown"}
                          {" • "}
                          {new Date(ev.createdAt).toLocaleTimeString()}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{ev.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {step === "running" && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder={`Deliver your speech as ${country}...`}
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      className="min-h-[80px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSpeak();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSpeak}
                      disabled={!userMessage.trim() || sending}
                      className="gap-2 self-end"
                    >
                      {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "finished" && simId && (
              <DebateSummaryPanel
                simulationId={simId}
                committeeName={committee}
              />
            )}
          </div>

          <div className="space-y-4">
            <SpeakingTimer
              speakerName={currentSpeaker}
              maxSeconds={120}
              onTimeUp={() => toast.warning("Time is up!")}
            />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="size-4" /> Delegates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {allDelegates.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-2 rounded-lg border border-border/60 p-2 cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => setCurrentSpeaker(d.country)}
                  >
                    <div className={`size-2 rounded-full ${d.isAi ? "bg-emerald-500" : "bg-brand-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{d.country}</p>
                      <p className="text-[10px] text-muted-foreground">{d.isAi ? "AI" : "You"}</p>
                    </div>
                    {currentSpeaker === d.country && (
                      <Badge variant="default" className="text-[9px] px-1.5 py-0">
                        Speaking
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <POIQueue
              delegates={allDelegates}
              onCallNext={(id) => {
                const del = allDelegates.find((d) => d.id === id);
                if (del) setCurrentSpeaker(del.country);
              }}
              onPOIAsked={(id) => {
                const del = allDelegates.find((d) => d.id === id);
                if (del) setCurrentSpeaker(undefined);
              }}
            />

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Gavel className="size-4" /> Chair
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="capitalize">
                  {chairPersonality}
                </Badge>
              </CardContent>
            </Card>

            {step === "finished" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="size-4 text-amber-600" /> Session Complete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    You delivered {events.filter((e) => e.type === "SPEECH" && e.delegateId === userDel?.id).length} speech(es) in this session.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => {
                      setStep("setup");
                      setSimId(null);
                      setEvents([]);
                      setAllDelegates([]);
                      setCurrentSpeaker(undefined);
                    }}
                  >
                    Start New Simulation
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
