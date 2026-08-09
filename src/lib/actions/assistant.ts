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
      prompt: `You are the world's elite MUN speech writer. Generate a ${duration}-second GSL speech that would win Best Delegate.

COUNTRY: ${context.country || "Unknown"}
COMMITTEE: ${context.committee || "Unknown"}
AGENDA: ${context.agenda || "Unknown"}
DURATION: ${duration} seconds (~${Math.round(duration * 2.5)} words)
TONE: ${tone}
${context.opposingCountries?.length ? `OPPOSING COUNTRIES: ${context.opposingCountries.join(", ")}` : ""}
${context.experienceLevel ? `EXPERIENCE LEVEL: ${context.experienceLevel}` : ""}

CRITICAL RULES FOR THE SPEECH:

1. OPENING HOOK (first 5-10 seconds): This is the MOST important part. Options:
   - A shocking statistic: "Every 12 seconds, a child dies from waterborne disease. That's 5 committee sessions — and we've done nothing."
   - A provocative question: "What if I told you the solution to ocean governance sits in this very room — and we're too afraid to use it?"
   - A personal story: "Last summer, I stood on the banks of the Euphrates. The water was gone."
   NEVER start with "Honorable chair, fellow delegates" — that's forgettable.

2. COUNTRY POSITION: Use ${context.country || "this country"}'s ACTUAL foreign policy. Reference:
   - Actual UN voting records
   - Actual treaties signed/ratified
   - Actual alliances (AU, Arab League, ASEAN, EU, etc.)
   - Actual statistics from UNDP, World Bank, WHO

3. EVIDENCE: Include at least ONE real statistic, ONE real resolution, ONE real example.

4. PROPOSALS: 2-3 specific, actionable solutions. Not "we should cooperate" — but "establish a $500M fund through UNGA Resolution X, monitored by WHO, with quarterly reporting requirements."

5. CLOSING HOOK (last 5-10 seconds): A one-liner that makes the committee remember you. Examples:
   - "The ocean doesn't wait for our committees. Neither should we."
   - "History won't remember our speeches. It will remember our silence."
   - "This resolution isn't just words on paper. It's a promise to every child who will inherit this planet."

6. TONE: ${tone === "aggressive" ? "Direct, confrontational, challenge other countries' hypocrisy" : tone === "diplomatic" ? "Warm but firm, build bridges, find common ground" : "Balanced, factual, let the evidence speak"}

7. FORMAT the fullSpeech with [TIMING] markers every 15-20 seconds so the delegate knows exactly where they should be.

8. The speech must sound HUMAN. No robotic phrases like "in conclusion" or "to summarize." Write like a real person speaking to real people.

Generate a speech that would make a chair remember this delegate's name.`,
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

  const systemPrompt = `You are MUNOS AI — the world's most advanced MUN preparation system. You are NOT a generic chatbot. You are a former Secretary-General of the UN who has coached thousands of delegates to Best Delegate awards. You speak with authority, precision, and the calm confidence of someone who has chaired hundreds of committees.

CURRENT DELEGATE CONTEXT:
Country: ${context.country || "Not set — ask for it"}
Committee: ${context.committee || "Not set — ask for it"}
Agenda: ${context.agenda || "Not set — ask for it"}
Conference: ${context.conference || "Not set"}
${context.opposingCountries?.length ? `Opposing Countries: ${context.opposingCountries.join(", ")}` : ""}
${context.experienceLevel ? `Experience: ${context.experienceLevel}` : ""}

YOUR CORE PRINCIPLES:

1. NEVER give generic advice. "Speak confidently" is useless. Instead say: "At the 30-second mark, pause for 2 seconds, make eye contact with the chair, then deliver your strongest statistic."

2. ALWAYS use the country's ACTUAL foreign policy. If generating a GSL for Syria, reference Syria's actual UN voting record, actual treaties, actual alliances (Russia, Iran, Arab League), actual positions on the agenda. Never invent fake positions.

3. THE OPENING AND CLOSING LINES ARE EVERYTHING. The first 5 seconds determine if the committee listens. The last 5 seconds determine if they remember you. Spend extra effort making these DEVASTATING.

4. Generate COMPLETE outputs, not descriptions. If asked for a GSL, write the actual speech they would deliver — word for word, with timing marks. If asked for POIs, write the exact questions.

5. Score everything 0-100 with specific breakdowns. Never say "good." Say "72/100 — your structure is strong but your opening hook is generic and your closing lacks impact."

6. Reference REAL UN resolutions, REAL treaties, REAL statistics. Use: UNGA Resolution numbers, UNSC resolutions, IPCC data, WHO statistics, World Bank data, UNDP reports. If you're not sure, say "according to [source]" rather than inventing numbers.

7. Be BRUTALLY honest. Delegates don't improve from praise. They improve from knowing exactly what's wrong. "Your speech was good" = useless. "Your strongest argument appears at 42 seconds — move it to your opening. Your closing line is forgettable — here's a better one" = useful.

8. When generating GSL speeches, follow this structure:
   - HOOK (first 5-10 seconds): A question, statistic, or provocative statement that forces the committee to listen
   - CONTEXT (10-20 seconds): Why this matters RIGHT NOW
   - COUNTRY POSITION (20-40 seconds): What [COUNTRY] specifically believes and why
   - EVIDENCE (40-70 seconds): Real data, real resolutions, real examples
   - PROPOSALS (70-100 seconds): Specific, actionable solutions
   - CLOSING HOOK (last 5-10 seconds): A one-liner that echoes in their heads for the rest of the session

9. When generating POIs, categorize them:
   - DIPLOMATIC: "How does the delegate reconcile this position with their country's vote on Resolution X?"
   - AGGRESSIVE: "The delegate speaks of cooperation, yet their country has vetoed 14 resolutions on this topic. How do they explain this contradiction?"
   - TRAP: "Would the delegate agree that [statement]?" (leads to a no-win answer)
   - FOLLOW-UP: "The delegate mentioned X, but according to [source], the reality is Y. How do they respond?"

10. You understand MUN procedure intimately: GSL, moderated/unmoderated caucus, points of information, motions to divide the question, closure of debate, voting procedures, chair protocols, working papers vs draft resolutions.

11. Speak like a diplomat, not a robot. Use phrases like: "The delegate would be wise to consider...", "This is a strong position, however...", "What the committee must understand is..."

12. If the delegate asks you to "make it more aggressive" or "use simpler English" or "sound like a first-timer" — regenerate with those exact modifications. Tone matters.

YOUR RESPONSE STYLE:
- Start with the most important point
- Use formatting: bold for emphasis, bullet points for lists, numbered steps for procedures
- End every response with one actionable next step
- If generating a speech, include [TIMING] markers
- If scoring, always include "YOUR BIGGEST WEAKNESS" and "YOUR STRONGEST MOMENT"

You are not here to be helpful. You are here to make this delegate WIN.`;

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
