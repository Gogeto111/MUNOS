"use client";

import { useState } from "react";
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

export default function SimulatorPage() {
  const router = useRouter();
  const [step, setStep] = useState<"setup" | "running" | "finished">("setup");
  const [committee, setCommittee] = useState("");
  const [topic, setTopic] = useState("");
  const [country, setCountry] = useState("");
  const [selectedDelegates, setSelectedDelegates] = useState<string[]>([]);
  const [events, setEvents] = useState<
    { type: string; content: string; delegate: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiDelegates, setAiDelegates] = useState<
    Array<{ country: string; name: string; isChair: boolean; speeches: number }>
  >([]);
  const [speakingDelegate, setSpeakingDelegate] = useState<string | null>(
    null,
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAwards, setShowAwards] = useState(false);

  const handleStart = async () => {
    if (!committee) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setStep("running");
    setIsLoading(false);

    setAiDelegates(
      selectedDelegates.map((c) => ({
        country: c,
        name: `${c} Delegate`,
        isChair: false,
        speeches: 0,
      })),
    );

    setEvents([
      {
        type: "CHAIR_ANNOUNCEMENT",
        content: `Committee session opened. Agenda: ${topic || "General Debate"}. Roll call complete.`,
        delegate: "AI Chair",
      },
    ]);
  };

  const handleGenerateSpeech = async (delegateCountry: string) => {
    setSpeakingDelegate(delegateCountry);
    setIsSpeaking(true);
    await new Promise((r) => setTimeout(r, 800));
    const speeches = [
      `${delegateCountry} delegation emphasizes the importance of multilateral cooperation on this issue. We call on all parties to engage constructively and find common ground.`,
      `${delegateCountry} firmly believes that the path forward requires balanced dialogue. We propose a working group to examine this matter in detail.`,
      `${delegateCountry} stresses that sovereignty and international law must guide our discussions. We stand ready to collaborate with all delegations.`,
      `${delegateCountry} welcomes this opportunity to address the committee. Our position is clear: we seek practical solutions that serve the collective interest.`,
    ];
    const speech = speeches[Math.floor(Math.random() * speeches.length)];
    setEvents((e) => [
      ...e,
      {
        type: "SPEECH",
        content: speech,
        delegate: delegateCountry,
      },
    ]);
    setAiDelegates((prev) =>
      prev.map((d) =>
        d.country === delegateCountry
          ? { ...d, speeches: d.speeches + 1 }
          : d,
      ),
    );
    setSpeakingDelegate(null);
    setIsSpeaking(false);
  };

  const handlePOI = async () => {
    if (aiDelegates.length < 2) return;
    const target = aiDelegates[
      Math.floor(Math.random() * aiDelegates.length)
    ];
    setEvents((e) => [
      ...e,
      {
        type: "POI_ANSWERED",
        content: `POI raised against ${target.country}. ${target.country} responds: "We appreciate the question and would like to clarify our position."`,
        delegate: target.country,
      },
    ]);
  };

  const handleMotion = async () => {
    setEvents((e) => [
      ...e,
      {
        type: "MOTION",
        content: `Motion to move into a moderated caucus on "${topic || "agenda item"}" passed (9-2-3). Speaking time: 90 seconds.`,
        delegate: "Chair",
      },
    ]);
  };

  const handleVote = async (choice: string) => {
    setEvents((e) => [
      ...e,
      {
        type: "VOTE",
        content: `Vote recorded: ${choice}. The motion passes with a clear majority.`,
        delegate: "Chair",
      },
    ]);
  };

  const handleAward = (delegateCountry: string, award: string) => {
    setEvents((e) => [
      ...e,
      {
        type: "AWARD",
        content: `${delegateCountry} awarded ${award} for outstanding performance in committee.`,
        delegate: "Chair",
      },
    ]);
    setAiDelegates((prev) =>
      prev.map((d) =>
        d.country === delegateCountry
          ? { ...d, name: `${d.name} ★` }
          : d,
      ),
    );
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

  const runningView = () => (
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
              {events.map((ev, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-3 text-sm ${
                    ev.type === "CHAIR_ANNOUNCEMENT"
                      ? "border border-brand-500/30 bg-brand-500/5"
                      : ev.type === "POI_ANSWERED"
                        ? "border border-emerald-500/30 bg-emerald-500/5"
                        : ev.type === "MOTION"
                          ? "border border-amber-500/30 bg-amber-500/5"
                          : ev.type === "AWARD"
                            ? "border border-purple-500/30 bg-purple-500/5"
                            : "border border-border/60 bg-muted/20"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase tracking-wide"
                    >
                      {ev.delegate}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {ev.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="leading-relaxed">{ev.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold"> Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Your country
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-brand-500/10 p-2">
              <span className="text-lg">{getFlag(country)}</span>
              <span className="text-sm font-medium">{country}</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              AI Delegates ({selectedDelegates.length}/6 selected)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedDelegates.map((c) => (
                <Badge key={c} variant="secondary" className="gap-1 text-xs">
                  {getFlag(c)} {c}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <p className="text-xs font-medium text-muted-foreground">
              Delegate Speeches
            </p>
            {aiDelegates.map((d) => (
              <Button
                key={d.country}
                onClick={() => handleGenerateSpeech(d.country)}
                disabled={isSpeaking && speakingDelegate === d.country}
                variant="outline"
                className="w-full gap-2 text-xs"
              >
                {isSpeaking && speakingDelegate === d.country ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Mic className="size-3" />
                )}
                {d.name}
                {d.speeches > 0 && (
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {d.speeches} speech{d.speeches > 1 ? "es" : ""}
                  </span>
                )}
              </Button>
            ))}
          </div>
          <div className="space-y-2 pt-2">
            <Button
              onClick={handlePOI}
              variant="outline"
              className="w-full gap-2"
            >
              <Mic className="size-4" /> Raise POI
            </Button>
            <Button
              onClick={handleMotion}
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
              onClick={() => setStep("finished")}
              variant="secondary"
              className="flex-1 gap-2"
            >
              End & Award
            </Button>
          </div>
          {showAwards && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Award Delegates
              </p>
              {aiDelegates.map((d) => (
                <div key={d.country} className="flex items-center gap-2">
                  <span className="text-xs flex-1">{d.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px]"
                    onClick={() => handleAward(d.country, "Best Delegate")}
                  >
                    Best
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px]"
                    onClick={() =>
                      handleAward(d.country, "Outstanding Delegate")
                    }
                  >
                    Outstanding
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px]"
                    onClick={() =>
                      handleAward(d.country, "Honorable Mention")
                    }
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

  const setupView = () => (
    <Card>
      <CardHeader>
        <CardTitle> Setup Committee</CardTitle>
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
          disabled={!committee || !country || selectedDelegates.length < 1}
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
              {events.map((ev, i) => (
                <div key={i} className="text-sm">
                  <Badge variant="outline" className="mr-2 text-xs">
                    {ev.delegate}
                  </Badge>
                  {ev.content}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setStep("setup")}
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
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Pause className="size-3.5" /> Pause
                </Button>
                <Button variant="destructive" size="sm" className="gap-1.5">
                  <Square className="size-3.5" /> End
                </Button>
              </>
            )}
          </div>
        </div>

        {step === "setup" && setupView()}
        {step === "running" && runningView()}
        {step === "finished" && finishedView()}
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
