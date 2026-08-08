import "server-only";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const analysisSchema = z.object({
  overall: z.number().min(0).max(100),
  confidence: z.number().min(0).max(10),
  clarity: z.number().min(0).max(10),
  persuasion: z.number().min(0).max(10),
  structure: z.number().min(0).max(10),
  suggestions: z.array(z.string()).min(3).max(6),
  summary: z.string(),
});

const RUBRIC = `
You are an expert MUN (Model United Nations) speech coach. Analyze the following speech transcript and provide detailed, actionable feedback.

Scoring rubric:
- overall (0-100): Composite score of substance, delivery cues, and rhetoric.
- confidence (0-10): Tone, assertiveness, commanding presence inferred from word choice and phrasing.
- clarity (0-10): How clearly the argument is structured, sentences are formed, and ideas are conveyed.
- persuasion (0-10): Rhetorical devices, emotional appeal, logical progression, ability to convince.
- structure (0-10): Opening hook, clear thesis, body organization, transitions, and closing call to action.
- suggestions: 3-6 specific, actionable tips the delegate can use immediately to improve.
- summary: A 2-3 sentence constructive summary of the speech's strengths and areas for growth.
`;

export async function analyzeSpeech(input: {
  transcript: string;
  durationSec?: number;
}): Promise<z.infer<typeof analysisSchema>> {
  const duration = input.durationSec
    ? `${Math.round(input.durationSec)} seconds`
    : "not measured";
  const transcript = input.transcript.trim().slice(0, 8_000);

  const prompt =
    `${RUBRIC}\n\n` +
    `Speaking time: ${duration}\n\n` +
    `Speech transcript:\n"${transcript || "(empty speech)"}"`;

  try {
    const { object } = await generateObject({
      model: google(process.env.AI_MODEL ?? "gemini-2.5-flash"),
      schema: analysisSchema,
      prompt,
    });
    return object;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown analysis error";
    throw new Error(`AI analysis failed: ${message}`);
  }
}
