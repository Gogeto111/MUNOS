"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AudioLines,
  Loader2,
  MessageCircleQuestion,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Square,
  Timer,
  Volume2,
} from "lucide-react";
import { streamAiGeneration } from "@/components/workspace/use-ai-stream";
import { scoreSpeech } from "@/lib/actions/ai-sources";
import type { AiScoreResult } from "@/lib/ai/judge-parse";
import { SectionCard } from "@/components/profile/section-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScoreCard } from "@/components/workspace/ai-judge-panel";
import { toast } from "sonner";
import type { WorkspaceCommittee } from "@/generated/prisma/browser";

const SPEECH_SECONDS = 90;

interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: { isFinal: boolean; transcript: string }[] }) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type VoiceState = "idle" | "speaking" | "poi";

function getRecognition(): (new () => RecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => RecognitionLike;
    webkitSpeechRecognition?: new () => RecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(
    text.replace(/[*_`#]/g, "").slice(0, 1_000),
  );
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Voice Debate Mode — practice your speech out loud: 90-second timer, live
 * speech-to-text transcript, “Point of Information” interrupts answered by the
 * AI coach in character (and read aloud), then a judge score for the round.
 */
export function VoiceDebateMode({
  workspaceId,
  committees,
}: {
  workspaceId: string;
  committees: WorkspaceCommittee[];
}) {
  const [committeeId, setCommitteeId] = useState(committees[0]?.id ?? "");
  const [state, setState] = useState<VoiceState>("idle");
  const [remaining, setRemaining] = useState(SPEECH_SECONDS);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [coachText, setCoachText] = useState("");
  const [isCoachThinking, setIsCoachThinking] = useState(false);
  const [score, setScore] = useState<AiScoreResult | null>(null);
  const [isJudging, setIsJudging] = useState(false);

  const recognitionRef = useRef<RecognitionLike | null>(null);
  const keepListeningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptRef = useRef("");
  const remainingRef = useRef(SPEECH_SECONDS);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const beginListening = useCallback(() => {
    const Recognition = getRecognition();
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let final = "";
      let partial = "";
      for (const result of event.results) {
        if (result.isFinal) final += result.transcript;
        else partial += result.transcript;
      }
      if (final) setTranscript((current) => `${current} ${final}`.trim());
      setInterim(partial);
    };
    recognition.onend = () => {
      if (keepListeningRef.current) {
        try {
          recognition.start();
        } catch {
          // Re-entry race; the next onend will retry.
        }
      }
    };
    recognition.onerror = () => {
      // Browser may deny mic permission; surface once through the button state.
    };
    recognitionRef.current = recognition;
    keepListeningRef.current = true;
    try {
      recognition.start();
    } catch {
      keepListeningRef.current = false;
    }
  }, []);

  useEffect(() => {
    return () => {
      keepListeningRef.current = false;
      recognitionRef.current?.abort();
      clearTimer();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const startTimer = () => {
    clearTimer();
    timerRef.current = setInterval(() => {
      remainingRef.current -= 1;
      if (remainingRef.current <= 0) {
        remainingRef.current = 0;
        clearTimer();
        keepListeningRef.current = false;
        recognitionRef.current?.stop();
        setState((current) => (current === "poi" ? current : "idle"));
        toast.info("Time is up!");
      }
      setRemaining(remainingRef.current);
    }, 1_000);
  };

  const handleStart = () => {
    setTranscript("");
    setInterim("");
    setCoachText("");
    setScore(null);
    transcriptRef.current = "";
    remainingRef.current = SPEECH_SECONDS;
    setRemaining(SPEECH_SECONDS);
    setState("speaking");
    startTimer();
    beginListening();
  };

  const handlePause = () => {
    clearTimer();
    keepListeningRef.current = false;
    recognitionRef.current?.stop();
    setInterim("");
    setState((current) => (current === "poi" ? "poi" : "idle"));
  };

  const handleResume = () => {
    setState("speaking");
    startTimer();
    beginListening();
  };

  const handleStop = () => {
    clearTimer();
    keepListeningRef.current = false;
    recognitionRef.current?.stop();
    setInterim("");
    setState("idle");
  };

  const handleReset = () => {
    clearTimer();
    keepListeningRef.current = false;
    recognitionRef.current?.abort();
    setRemaining(SPEECH_SECONDS);
    remainingRef.current = SPEECH_SECONDS;
    setTranscript("");
    setInterim("");
    setCoachText("");
    setScore(null);
    transcriptRef.current = "";
    setState("idle");
  };

  const askPoi = async () => {
    const speech = transcriptRef.current.trim();
    if (!speech) {
      toast.error("Speak first — the coach needs your speech to answer the POI.");
      return;
    }
    if (!committeeId) {
      toast.error("Select a committee first.");
      return;
    }
    handlePause();
    setState("poi");
    setIsCoachThinking(true);
    setCoachText("");
    try {
      let reply = "";
      const result = await streamAiGeneration(
        { feature: "debate-reply", workspaceId, committeeId, speechContext: speech },
        (text) => {
          reply = text;
          setCoachText(text);
        },
      );
      if (!result.ok) {
        reply = result.error ?? "The coach couldn't answer.";
        setCoachText(reply);
      } else {
        speak(reply);
      }
    } finally {
      setIsCoachThinking(false);
    }
  };

  const speakCoach = () => {
    if (coachText) speak(coachText);
  };

  const judgeRound = async () => {
    const speech = transcriptRef.current.trim();
    if (!speech) {
      toast.error("Nothing to judge yet — record your speech first.");
      return;
    }
    setIsJudging(true);
    try {
      const result = await scoreSpeech(workspaceId, {
        transcript: speech,
        durationSec: SPEECH_SECONDS - remainingRef.current,
      });
      if (result.status === "success" && result.data) {
        setScore(result.data.score);
        toast.success("Round scored.");
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsJudging(false);
    }
  };

  const isMicAvailable = getRecognition() !== null;

  return (
    <SectionCard
      title="Voice debate mode"
      description="Practice your speech out loud. The timer, live transcript, POI coach, and judge work together for a full mock round."
      icon={AudioLines}
    >
      <div className="space-y-4">
        {!isMicAvailable ? (
          <p className="text-sm text-muted-foreground">
            Voice recognition is not available in this browser. Use Chrome/Edge and grant
            microphone permission — you can still paste a transcript into the AI judge.
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="min-w-0">
            <Label>Committee</Label>
            <Select value={committeeId || undefined} onValueChange={setCommitteeId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a committee" />
              </SelectTrigger>
              <SelectContent>
                {committees.map((committee) => (
                  <SelectItem key={committee.id} value={committee.id}>
                    {committee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end justify-between rounded-lg border border-border/70 px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="size-4" />
              Remaining
            </div>
            <p className="text-2xl font-semibold tabular-nums">{formatTime(remaining)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {state === "idle" ? (
            <Button type="button" size="sm" onClick={() => void handleStart()}>
              <Mic className="size-4" />
              Start speaking
            </Button>
          ) : (
            <>
              <Button type="button" size="sm" variant="outline" onClick={handlePause}>
                <Pause className="size-4" />
                Pause
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => void handleResume()}>
                <Play className="size-4" />
                Resume
              </Button>
            </>
          )}
          <Button type="button" size="sm" variant="outline" onClick={handleStop} disabled={state === "idle"}>
            <Square className="size-4" />
            Stop
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void askPoi()}
            disabled={isCoachThinking || state === "idle"}
          >
            <MessageCircleQuestion className="size-4" />
            Point of Information
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void judgeRound()}
            disabled={isJudging || state === "idle"}
          >
            {isJudging ? <Loader2 className="size-4 animate-spin" /> : null}
            Judge this round
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={handleReset}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>

        {state === "poi" ? (
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm">
            <p className="font-medium">The chair recognizes your Point of Information.</p>
            <p className="mt-1 text-muted-foreground">
              The AI coach is answering in character, then you can resume.
            </p>
          </div>
        ) : null}

        {state !== "idle" || transcript ? (
          <div className="rounded-lg border border-border/70 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Live transcript
            </p>
            <p className="mt-1.5 whitespace-pre-wrap text-sm">
              {transcript}
              {interim ? (
                <span className="text-muted-foreground/70"> {interim}</span>
              ) : null}
              {!transcript && !interim ? (
                <span className="text-muted-foreground/70">Waiting for your voice…</span>
              ) : null}
            </p>
          </div>
        ) : null}

        {isCoachThinking || coachText ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                AI coach reply
              </p>
              {coachText ? (
                <Button type="button" variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs" onClick={speakCoach}>
                  <Volume2 className="size-3" />
                  Read aloud
                </Button>
              ) : null}
            </div>
            {isCoachThinking ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Thinking in character…
              </p>
            ) : (
              <div className="whitespace-pre-wrap rounded-lg border border-border/70 p-3 text-sm">{coachText}</div>
            )}
          </div>
        ) : null}

        {score ? <ScoreCard score={score} /> : null}
      </div>
    </SectionCard>
  );
}
