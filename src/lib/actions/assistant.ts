"use server";

import { generateObject, generateText } from "ai";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { env, isAiConfigured } from "@/lib/env";

// ---------------------------------------------------------------------------
// AI Provider with fallback
// ---------------------------------------------------------------------------

type AIProvider = "gemini" | "openai" | "anthropic" | "groq";

function getPrimaryModel() {
  if (isAiConfigured) return google(env.AI_MODEL || "gemini-2.5-flash");
  if (env.OPENAI_API_KEY) return openai("gpt-4o");
  if (env.ANTHROPIC_API_KEY) return anthropic("claude-sonnet-4-20250514");
  return null;
}

function getFallbackModel(primary: AIProvider) {
  const fallbacks: AIProvider[] = ["gemini", "openai", "anthropic", "groq"];
  for (const fb of fallbacks) {
    if (fb !== primary) {
      if (fb === "gemini" && isAiConfigured) return google(env.AI_MODEL || "gemini-2.5-flash");
      if (fb === "openai" && env.OPENAI_API_KEY) return openai("gpt-4o");
      if (fb === "anthropic" && env.ANTHROPIC_API_KEY) return anthropic("claude-sonnet-4-20250514");
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// MUN Context types
// ---------------------------------------------------------------------------

export interface MunContext {
  country?: string;
  committee?: string;
  agenda?: string;
  conference?: string;
  opposingCountries?: string[];
  experienceLevel?: string;
  previousAwards?: string[];
  strengths?: string[];
  weaknesses?: string[];
}

// ---------------------------------------------------------------------------
// GSL Builder
// ---------------------------------------------------------------------------

const GslSchema = z.object({
  hook: z.string().describe("Opening hook to grab attention"),
  diplomaticFraming: z.string().describe("Diplomatic framing of the issue"),
  countryPosition: z.string().describe("Country's official position"),
  policyProposals: z.array(z.string()).describe("2-3 specific policy proposals"),
  closingLine: z.string().describe("Memorable closing line"),
  fullSpeech: z.string().describe("Complete 60/90/120 second speech"),
  wordCount: z.number().describe("Approximate word count"),
  estimatedSeconds: z.number().describe("Estimated speaking time in seconds"),
});

export type GslResult = z.infer<typeof GslSchema>;

export async function generateGsl(
  context: MunContext,
  duration: 60 | 90 | 120 = 60,
  tone: "diplomatic" | "aggressive" | "neutral" = "diplomatic",
): Promise<{ status: "success"; data: GslResult } | { status: "error"; message: string }> {
  const model = getPrimaryModel();
  if (!model) {
    return { status: "error", message: "No AI provider configured. Add an API key to your .env." };
  }

  try {
    const result = await generateObject({
      model,
      schema: GslSchema,
      prompt: `You are an expert MUN speech writer. Generate a ${duration}-second General Speaker's List (GSL) speech.

COUNTRY: ${context.country || "Unknown"}
COMMITTEE: ${context.committee || "Unknown"}
AGENDA: ${context.agenda || "Unknown"}
DURATION: ${duration} seconds (~${Math.round(duration * 2.5)} words)
TONE: ${tone}
${context.opposingCountries?.length ? `OPPOSING COUNTRIES: ${context.opposingCountries.join(", ")}` : ""}
${context.experienceLevel ? `EXPERIENCE LEVEL: ${context.experienceLevel}` : ""}

Generate a complete, compelling GSL speech. The fullSpeech should be the complete text they would deliver. Make it sound natural, not robotic. Include specific policy proposals relevant to the country's actual position.`,
    });

    return { status: "success", data: result.object };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return { status: "error", message };
  }
}

// ---------------------------------------------------------------------------
// POI Engine
// ---------------------------------------------------------------------------

const PoisSchema = z.object({
  pois: z.array(z.object({
    text: z.string().describe("The POI question to ask"),
    type: z.enum(["strong", "aggressive", "diplomatic", "trap", "follow-up"]),
    targetCountry: z.string().describe("Which country this POI targets"),
    rationale: z.string().describe("Why this POI is effective"),
  })),
});

export type PoiResult = z.infer<typeof PoisSchema>;

export async function generatePois(
  context: MunContext,
  opponentSpeech: string,
  count: number = 5,
): Promise<{ status: "success"; data: PoiResult } | { status: "error"; message: string }> {
  const model = getPrimaryModel();
  if (!model) {
    return { status: "error", message: "No AI provider configured." };
  }

  try {
    const result = await generateObject({
      model,
      schema: PoisSchema,
      prompt: `You are an expert MUN strategist. Generate ${count} Points of Information (POIs) based on this opponent's speech.

MY COUNTRY: ${context.country || "Unknown"}
MY COMMITTEE: ${context.committee || "Unknown"}
AGENDA: ${context.agenda || "Unknown"}

OPPONENT'S SPEECH:
${opponentSpeech}

Generate POIs that:
1. Expose contradictions in the opponent's position
2. Challenge weak policy proposals
3. Highlight diplomatic inconsistencies
4. Include a mix of strong, aggressive, diplomatic, trap, and follow-up types
5. Are specific to the speech content, not generic`,
    });

    return { status: "success", data: result.object };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return { status: "error", message };
  }
}

// ---------------------------------------------------------------------------
// POI Practice (evaluate answer)
// ---------------------------------------------------------------------------

const PoiEvaluationSchema = z.object({
  overall: z.number().min(0).max(100),
  relevance: z.number().min(0).max(100),
  diplomacy: z.number().min(0).max(100),
  accuracy: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  deflection: z.number().min(0).max(100),
  timeManagement: z.number().min(0).max(100),
  feedback: z.string(),
  improvedAnswer: z.string().describe("A better version of the answer"),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
});

export type PoiEvaluation = z.infer<typeof PoiEvaluationSchema>;

export async function evaluatePoiAnswer(
  poi: string,
  answer: string,
  context: MunContext,
): Promise<{ status: "success"; data: PoiEvaluation } | { status: "error"; message: string }> {
  const model = getPrimaryModel();
  if (!model) {
    return { status: "error", message: "No AI provider configured." };
  }

  try {
    const result = await generateObject({
      model,
      schema: PoiEvaluationSchema,
      prompt: `You are an expert MUN judge evaluating a delegate's POI answer.

CONTEXT:
Country: ${context.country || "Unknown"}
Committee: ${context.committee || "Unknown"}
Agenda: ${context.agenda || "Unknown"}

POI ASKED:
${poi}

DELEGATE'S ANSWER:
${answer}

Score each dimension 0-100 and provide specific, actionable feedback. Be honest — generic "good job" feedback is useless.`,
    });

    return { status: "success", data: result.object };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return { status: "error", message };
  }
}

// ---------------------------------------------------------------------------
// Speech Coach (analyze transcript)
// ---------------------------------------------------------------------------

const SpeechAnalysisSchema = z.object({
  overall: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  diplomacy: z.number().min(0).max(100),
  structure: z.number().min(0).max(100),
  persuasiveness: z.number().min(0).max(100),
  research: z.number().min(0).max(100),
  delivery: z.number().min(0).max(100),
  speakingPace: z.string().describe("Too fast / Just right / Too slow"),
  fillerWords: z.number().describe("Estimated filler word count"),
  biggestWeakness: z.string().describe("One specific, actionable weakness"),
  strongestMoment: z.string().describe("The best part and when it occurs"),
  improvements: z.array(z.string()).describe("3 specific improvements"),
  rewrittenOpening: z.string().describe("A stronger version of the opening"),
});

export type SpeechAnalysis = z.infer<typeof SpeechAnalysisSchema>;

export async function analyzeSpeech(
  transcript: string,
  context: MunContext,
  durationSec?: number,
): Promise<{ status: "success"; data: SpeechAnalysis } | { status: "error"; message: string }> {
  const model = getPrimaryModel();
  if (!model) {
    return { status: "error", message: "No AI provider configured." };
  }

  try {
    const result = await generateObject({
      model,
      schema: SpeechAnalysisSchema,
      prompt: `You are an expert MUN speech coach. Analyze this speech transcript.

CONTEXT:
Country: ${context.country || "Unknown"}
Committee: ${context.committee || "Unknown"}
Agenda: ${context.agenda || "Unknown"}
${durationSec ? `Duration: ${durationSec} seconds` : ""}

SPEECH TRANSCRIPT:
${transcript}

Be brutally honest. The delegate needs specific, actionable feedback — not "speak confidently." Tell them EXACTLY what to fix and where.`,
    });

    return { status: "success", data: result.object };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return { status: "error", message };
  }
}

// ---------------------------------------------------------------------------
// AI Assistant Chat (the command center)
// ---------------------------------------------------------------------------

export async function chatWithAssistant(
  messages: { role: "user" | "assistant"; content: string }[],
  context: MunContext,
): Promise<{ status: "success"; data: string } | { status: "error"; message: string }> {
  const model = getPrimaryModel();
  if (!model) {
    return { status: "error", message: "No AI provider configured." };
  }

  const systemPrompt = `You are MUNOS AI, an expert Model United Nations assistant. You understand committees, resolutions, diplomatic protocol, country positions, and MUN strategy.

CURRENT CONTEXT:
Country: ${context.country || "Not set"}
Committee: ${context.committee || "Not set"}
Agenda: ${context.agenda || "Not set"}
Conference: ${context.conference || "Not set"}
${context.opposingCountries?.length ? `Opposing Countries: ${context.opposingCountries.join(", ")}` : ""}
${context.experienceLevel ? `Experience: ${context.experienceLevel}` : ""}

CAPABILITIES:
- Generate GSL speeches (60/90/120 seconds)
- Generate POIs (to ask and to answer)
- Analyze speeches and give scored feedback
- Draft resolution clauses
- Provide country-specific strategy
- Explain MUN procedures and rules
- Research topics with sourced claims

RULES:
1. Be specific and actionable — never give generic advice
2. Use the country's actual foreign policy positions
3. Reference real UN resolutions and frameworks when relevant
4. Score everything 0-100 with detailed breakdowns
5. If asked to generate something, generate it completely — don't just describe it
6. Be direct and honest — delegates need real feedback to improve`;

  try {
    const result = await generateText({
      model,
      system: systemPrompt,
      messages,
    });

    return { status: "success", data: result.text };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return { status: "error", message };
  }
}
