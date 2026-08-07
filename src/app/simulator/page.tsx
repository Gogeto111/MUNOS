"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  Pause,
  Play,
  Square,
  Gavel,
  Trophy,
  Loader2,
  ChevronRight,
  Globe,
  MessageCircle,
  X,
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
import {
  startSimulation,
  pauseSimulation,
  finishSimulation,
} from "@/lib/actions/simulation/run";
import { generateAISpeech } from "@/lib/actions/simulation/ai";
import {
  getSimulationState,
  respondToPOI,
  addChairAnnouncement,
  addMotion,
  addVote,
} from "@/lib/actions/simulation/state";
import { awardDelegate } from "@/lib/actions/simulation/vote";

const COMMITTEES = [
  "UNSC — Security Council",
  "DISEC — Disarmament & Int. Security",
  "HRC — Human Rights Council",
  "UNHCR — Refugees",
  "WHO — World Health Organization",
  "ECOSOC — Economic & Social",
  "UN Women",
  "UNFCCC — Climate Change",
  "ICJ — International Court of Justice",
  "GST — General Speeches",
];

const COUNTRIES = [
  "USA", "China", "Russia", "France", "UK", "India", "Brazil",
  "Germany", "Japan", "Australia", "South Africa", "Nigeria",
  "Mexico", "Canada", "South Korea", "Egypt", "Saudi Arabia",
  "UAE", "Indonesia", "Turkey", "Syria", "Ukraine",
];

type SimulationEvent = {
  id: string;
  type: string;
  content: string;
  delegateId: string | null;
  speakingTimeSec: number | null;
  createdAt: Date;
};

type Delegate = {
  id: string;
  country: string;
  countryFlag: string | null;
  displayName: string;
  isAi: boolean;
  isChair: boolean;
  policyStance: string | null;
  speakingStyle: string | null;
  speakingCount: number;
  poiCount: number;
  motionCount: number;
  award: string;
};

export default function SimulatorPage() {
  const router = useRouter();
  const [step, setStep] = useState<"setup" | "running" | "finished">("setup");
  const [committee, setCommittee] = useState("");
  const [topic, setTopic] = useState("");
  const [country, setCountry] = useState("");
  const [selectedDelegates, setSelectedDelegates] = useState<string[]>([]);
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [simulationId, setSimulationId] = useState<string | null>(null);
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [speakingDelegateId, setSpeakingDelegateId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAwards, setShowAwards] = useState(false);
  const [poiTargetId, setPoiTargetId] = useState<string | null>(null);
  const [poiQuestion, setPoiQuestion] = useState("");
  const [showPoiModal, setShowPoiModal] = useState(false);
  const [showMotionModal, setShowMotionModal] = useState(false);
  const [motionType, setMotionType] = useState("moderated_caucus");
  const [motionDesc, setMotionDesc] = useState("");

  const refreshState = useCallback(async (simId: string) => {
    const result = await getSimulationState(simId);
    if (result.status === "success" && result.data) {
      setDelegates(result.data.delegates as Delegate[]);
      setEvents(result.data.events as SimulationEvent[]);
    }
  }, []);

  useEffect(() => {
    if (simulationId) {
      refreshState(simulationId);
    }
  }, [simulationId, refreshState]);

  const handleStart = async () => {
    if (!committee || !country || selectedDelegates.length < 1) return;
    setIsLoading(true);

    const result = await createSimulation({
      committeeName: committee,
      topic: topic || "General Debate",
      country,
      delegateCountries: selectedDelegates,
    });

    if (result.status === "error") {
      toast.error(result.message);
      setIsLoading(false);
      return;
    }

    const simId = (result as { status: "success"; data: { id: string } }).data.id;

    const startResult = await startSimulation(simId);
    if (startResult.status === "error") {
      toast.error(startResult.message);
      setIsLoading(false);
      return;
    }

    setSimulationId(simId);
    setStep("running");

    await addChairAnnouncement(
      simId,
      `The committee session is now in session. Agenda: ${topic || "General Debate"}. The chair recognizes all delegates.`,
    );

    await refreshState(simId);
    setIsLoading(false);
    toast.success("Simulation started!");
  };

  const handleGenerateSpeech = async (delegateId: string, delegateName: string) => {
    if (!simulationId) return;
    setSpeakingDelegateId(delegateId);
    setIsSpeaking(true);

    const result = await generateAISpeech(simulationId, delegateId);

    if (result.status === "error") {
      toast.error(result.message);
    } else {
      toast.success(`${delegateName} delivered their speech`);
    }

    await refreshState(simulationId);
    setSpeakingDelegateId(null);
    setIsSpeaking(false);
  };

  const handlePOISubmit = async () => {
    if (!simulationId || !poiTargetId || !poiQuestion.trim()) return;
    setIsSpeaking(true);
    setShowPoiModal(false);

    const result = await respondToPOI(simulationId, poiTargetId, poiQuestion);

    if (result.status === "error") {
      toast.error(result.message);
    } else {
      toast.success("POI response received");
    }

    setPoiQuestion("");
    setPoiTargetId(null);
    await refreshState(simulationId);
    setIsSpeaking(false);
  };

  const handleMotionSubmit = async () => {
    if (!simulationId || !motionDesc.trim()) return;

    const userDelegate = delegates.find((d) => !d.isAi);
    if (!userDelegate) return;

    const result = await addMotion(
      simulationId,
      userDelegate.id,
      motionType,
      motionDesc,
    );

    if (result.status === "error") {
      toast.error(result.message);
    }

    setMotionDesc("");
    setShowMotionModal(false);
    await refreshState(simulationId);
  };

  const handleVote = async (choice: string) => {
    if (!simulationId) return;
    const userDelegate = delegates.find((d) => !d.isAi);
    if (!userDelegate) return;

    await addVote(simulationId, userDelegate.id, choice, "pending");
    await refreshState(simulationId);
  };

  const handleEnd = async () => {
    if (!simulationId) return;
    setIsLoading(true);

    const result = await finishSimulation(simulationId);
    if (result.status === "error") {
      toast.error(result.message);
    }

    await refreshState(simulationId);
    setStep("finished");
    setIsLoading(false);
  };

  const handleAward = async (delegateId: string, award: string) => {
    if (!simulationId) return;

    const result = await awardDelegate(simulationId, {
      delegateId,
      award,
    });

    if (result.status === "error") {
      toast.error(result.message);
    }

    await refreshState(simulationId);
  };

  const toggleDelegate = (c: string) => {
    setSelectedDelegates((prev) =>
      prev.includes(c)
        ? prev.filter((x) => x !== c)
        : prev.length < 6
          ? [...prev, c]
          : prev,
    );
  };

  const getEventStyle = (type: string) => {
    switch (type) {
      case "CHAIR_ANNOUNCEMENT":
        return "border-brand-500/30 bg-brand-500/5";
      case "SPEECH":
        return "border-border/60 bg-muted/20";
      case "POI_ASKED":
        return "border-emerald-500/30 bg-emerald-500/5";
      case "POI_ANSWERED":
        return "border-emerald-500/30 bg-emerald-500/5";
      case "MOTION":
        return "border-amber-500/30 bg-amber-500/5";
      case "VOTE":
        return "border-orange-500/30 bg-orange-500/5";
      case "AWARD":
        return "border-purple-500/30 bg-purple-500/5";
      default:
        return "border-border/60 bg-muted/20";
    }
  };

  const runningView = () => {
    const aiDelegates = delegates.filter((d) => d.isAi);
    const userDelegate = delegates.find((d) => !d.isAi);

    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="size-5 text-brand-600" />
              {committee}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Globe className="size-3.5" /> Topic
              </div>
              <p className="text-sm font-medium">{topic || "General Debate"}</p>
            </div>
            <ScrollArea className="h-[50vh] rounded-xl border border-border/60 p-4">
              <div className="space-y-3">
                {events.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No events yet. Ask a delegate to deliver a speech.
                  </p>
                )}
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className={`rounded-lg border p-3 text-sm ${getEventStyle(ev.type)}`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase tracking-wide"
                      >
                        {delegates.find((d) => d.id === ev.delegateId)?.displayName ?? "Chair"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {ev.type.replace(/_/g, " ")}
                      </span>
                      {ev.speakingTimeSec != null && (
                        <span className="text-[10px] text-muted-foreground">
                          ({ev.speakingTimeSec}s)
                        </span>
                      )}
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{ev.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userDelegate && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Your country</p>
                <div className="flex items-center gap-2 rounded-lg bg-brand-500/10 p-2">
                  <span className="text-lg">{getFlag(userDelegate.country)}</span>
                  <span className="text-sm font-medium">{userDelegate.country}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                AI Delegates ({aiDelegates.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {aiDelegates.map((d) => (
                  <Badge key={d.id} variant="secondary" className="gap-1 text-xs">
                    {getFlag(d.country)} {d.country}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-medium text-muted-foreground">Delegate Speeches</p>
              {aiDelegates.map((d) => (
                <Button
                  key={d.id}
                  onClick={() => handleGenerateSpeech(d.id, d.displayName)}
                  disabled={isSpeaking}
                  variant="outline"
                  className="w-full gap-2 text-xs"
                >
                  {isSpeaking && speakingDelegateId === d.id ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Mic className="size-3" />
                  )}
                  {d.displayName}
                  {d.speakingCount > 0 && (
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      {d.speakingCount} speech{d.speakingCount > 1 ? "es" : ""}
                    </span>
                  )}
                </Button>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <Button
                onClick={() => {
                  if (aiDelegates.length > 0) {
                    setPoiTargetId(aiDelegates[0].id);
                    setShowPoiModal(true);
                  }
                }}
                disabled={isSpeaking || aiDelegates.length === 0}
                variant="outline"
                className="w-full gap-2"
              >
                <MessageCircle className="size-4" /> Raise POI
              </Button>
              <Button
                onClick={() => setShowMotionModal(true)}
                variant="outline"
                className="w-full gap-2"
              >
                <Gavel className="size-4" /> Motion
              </Button>
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={() => handleVote("For")}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  Vote: For
                </Button>
                <Button
                  onClick={() => handleVote("Against")}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  Vote: Against
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={() => setShowAwards(!showAwards)}
                variant="outline"
                className="flex-1 gap-2"
              >
                <Trophy className="size-4" /> Awards
              </Button>
              <Button
                onClick={handleEnd}
                disabled={isLoading}
                variant="secondary"
                className="flex-1 gap-2"
              >
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Square className="size-4" />}
                End Session
              </Button>
            </div>

            {showAwards && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Award Delegates
                </p>
                {aiDelegates.map((d) => (
                  <div key={d.id} className="flex items-center gap-2">
                    <span className="text-xs flex-1 truncate">{d.displayName}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px]"
                      disabled={d.award !== "NONE"}
                      onClick={() => handleAward(d.id, "BEST_DELEGATE")}
                    >
                      Best
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px]"
                      disabled={d.award !== "NONE"}
                      onClick={() => handleAward(d.id, "OUTSTANDING_DELEGATE")}
                    >
                      Outstanding
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px]"
                      disabled={d.award !== "NONE"}
                      onClick={() => handleAward(d.id, "HONORABLE_MENTION")}
                    >
                      Mention
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const setupView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Setup Committee</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Committee</label>
          <Select value={committee} onValueChange={setCommittee}>
            <SelectTrigger>
              <SelectValue placeholder="Select committee" />
            </SelectTrigger>
            <SelectContent>
              {COMMITTEES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Agenda Topic</label>
          <Textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Strengthening international cooperation against cyber threats"
            rows={3}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Your Country</label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {getFlag(c)} {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            AI Delegates (select up to 6)
          </label>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.filter((c) => c !== country).map((c) => (
              <button
                key={c}
                onClick={() => toggleDelegate(c)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selectedDelegates.includes(c)
                    ? "border-brand-500 bg-brand-500/10 text-brand-700"
                    : "border-border/70 hover:border-brand-500/50"
                }`}
              >
                {getFlag(c)} {c}
              </button>
            ))}
          </div>
        </div>
        <Button
          onClick={handleStart}
          disabled={!committee || !country || selectedDelegates.length < 1 || isLoading}
          className="w-full gap-2"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Play className="size-4" />
          )}
          Start Simulation
        </Button>
      </CardContent>
    </Card>
  );

  const finishedView = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="size-5 text-amber-500" /> Committee Finalized
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl bg-amber-500/5 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Committee on {topic || "the agenda"}
          </p>
          <p className="mt-1 text-2xl font-bold">{committee}</p>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Final Events ({events.length})</p>
          <ScrollArea className="h-[35vh] rounded-xl border border-border/60 p-4">
            <div className="space-y-2">
              {events.map((ev) => (
                <div key={ev.id} className="text-sm">
                  <Badge variant="outline" className="mr-2 text-xs">
                    {delegates.find((d) => d.id === ev.delegateId)?.displayName ?? "Chair"}
                  </Badge>
                  {ev.content}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setStep("setup");
              setSimulationId(null);
              setEvents([]);
              setDelegates([]);
              setShowAwards(false);
            }}
            variant="outline"
            className="flex-1"
          >
            New Simulation
          </Button>
          <Button
            onClick={() => router.push("/workspaces")}
            className="flex-1"
          >
            Back to Workspace
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const poiModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Raise Point of Information</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowPoiModal(false)}>
            <X className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={poiTargetId ?? ""} onValueChange={setPoiTargetId}>
            <SelectTrigger>
              <SelectValue placeholder="Select delegate to address" />
            </SelectTrigger>
            <SelectContent>
              {delegates
                .filter((d) => d.isAi)
                .map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {getFlag(d.country)} {d.displayName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Textarea
            value={poiQuestion}
            onChange={(e) => setPoiQuestion(e.target.value)}
            placeholder="Your question or challenge..."
            rows={3}
          />
          <Button
            onClick={handlePOISubmit}
            disabled={!poiTargetId || !poiQuestion.trim() || isSpeaking}
            className="w-full"
          >
            {isSpeaking ? <Loader2 className="size-4 animate-spin" /> : "Send POI"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const motionModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Submit Motion</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowMotionModal(false)}>
            <X className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={motionType} onValueChange={setMotionType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="moderated_caucus">Moderated Caucus</SelectItem>
              <SelectItem value="unmoderated_caucus">Unmoderated Caucus</SelectItem>
              <SelectItem value="set_the_agenda">Set the Agenda</SelectItem>
              <SelectItem value="close_debate">Close Debate</SelectItem>
              <SelectItem value="suspend_rules">Suspend Rules</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            value={motionDesc}
            onChange={(e) => setMotionDesc(e.target.value)}
            placeholder="Describe the motion..."
            rows={3}
          />
          <Button
            onClick={handleMotionSubmit}
            disabled={!motionDesc.trim()}
            className="w-full"
          >
            Submit Motion
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <button
                onClick={() => router.push("/workspaces")}
                className="hover:text-foreground"
              >
                Workspace
              </button>
              <ChevronRight className="size-3.5" />
              <span className="font-medium text-foreground">AI Simulator</span>
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              AI Committee Simulator
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Practice an entire MUN committee with AI delegates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {step === "running" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    if (simulationId) {
                      pauseSimulation(simulationId).then(() => {
                        toast.info("Simulation paused");
                      });
                    }
                  }}
                >
                  <Pause className="size-3.5" /> Pause
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleEnd}
                  disabled={isLoading}
                >
                  <Square className="size-3.5" /> End
                </Button>
              </>
            )}
          </div>
        </div>

        {step === "setup" && setupView()}
        {step === "running" && runningView()}
        {step === "finished" && finishedView()}

        {showPoiModal && poiModal()}
        {showMotionModal && motionModal()}
      </div>
    </div>
  );
}

function getFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
    .join("");
}
