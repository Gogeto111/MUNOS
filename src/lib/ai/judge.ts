import "server-only";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { env } from "@/lib/env";
import { normalizeScore, type AiScoreResult } from "@/lib/ai/judge-parse";

const scoreSchema = z.object({
  overall: z.number(),
  confidence: z.number(),
  diplomacy: z.number(),
  research: z.number(),
  flow: z.number(),
  speakingTimeSec: z.number(),
  logicalFallacies: z.number(),
  suggestions: z.array(z.string()),
});

const RUBRIC = `
Scoring rubric (out of 10 unless noted):
- confidence: calm delivery, steady pace, command of the floor.
- diplomacy: respect for the house, tactful but firm framing.
- research: factual grounding, specific policy/reference depth.
- flow: structure, transitions, how well the argument builds.
- overall: 0-100 composite of substance + delivery.
- logicalFallacies: count of logical fallacies or unsubstantiated jumps.
- speakingTimeSec: estimated speech length in seconds.
- suggestions: 3-5 concrete, actionable ways to improve.`;

/**
 * Scores a spoken speech as an MUN debate judge. Returns a structured,
 * normalized score ready to persist and display.
 */
export async function judgeSpeech(input: {
  transcript: string;
  durationSec?: number;
}): Promise<AiScoreResult> {
  const duration = input.durationSec
    ? `${Math.round(input.durationSec)} seconds`
    : "not measured";
  const transcript = input.transcript.trim().slice(0, 6_000);

  const prompt =
    `You are an experienced Model United Nations debate chair judging a delegate's speech. ` +
    `Return ONLY a JSON object — no prose, no markdown — with exactly these keys: ` +
    `overall (0-100), confidence (0-10), diplomacy (0-10), research (0-10), flow (0-10), ` +
    `speakingTimeSec (number), logicalFallacies (integer count), suggestions (array of strings).\n\n` +
    `${RUBRIC}\n\n` +
    `Measured speaking time: ${duration}\n\n` +
    `The delegate's speech:\n"${transcript || "(empty speech)"}"`;

  try {
    const { object } = await generateObject({
      model: google(env.AI_MODEL),
      schema: scoreSchema,
      prompt,
    });
    return normalizeScore(object);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown judge error";
    throw new Error(`The AI judge could not score this speech: ${message}`);
  }
}
