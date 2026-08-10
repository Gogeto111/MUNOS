"use server";

import { generateObject, generateText, type LanguageModel } from "ai";
import { z } from "zod";
import { getBestModel, getBestObjectModel } from "@/lib/ai-model";
import { getMemoryContextString } from "@/lib/actions/ai-memory";

async function withFallback<T>(
  fn: (model: LanguageModel) => Promise<T>,
): Promise<T> {
  return fn(getBestModel());
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
  assistantContext?: string;
}

// ---------------------------------------------------------------------------
// AI Assistant Chat (the command center)
// ---------------------------------------------------------------------------

export async function chatWithAssistant(
  messages: { role: "user" | "assistant"; content: string }[],
  context: MunContext,
): Promise<{ status: "success"; data: string } | { status: "error"; message: string }> {
  try {
    const memoryContext = await getMemoryContextString();
    const result = await withFallback((model) =>
      generateText({
        model,
        system: buildSystemPrompt(context, memoryContext || undefined),
        messages,
      }),
    );
    return { status: "success", data: result.text };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return { status: "error", message };
  }
}

// Debate Practice Mode - AI plays as opposing delegate
export async function debateWithOpponent(
  messages: { role: "user" | "assistant"; content: string }[],
  context: MunContext,
): Promise<{ status: "success"; data: string } | { status: "error"; message: string }> {
  try {
    const memoryContext = await getMemoryContextString();
    const result = await withFallback((model) =>
      generateText({
        model,
        system: `You are an experienced MUN delegate from an OPPOSING country in a committee debate. 

YOUR COUNTRY: ${context.opposingCountries?.[0] || "a country with opposing interests"}
THEIR COUNTRY: ${context.country || "Unknown"}
COMMITTEE: ${context.committee || "Unknown"}
AGENDA: ${context.agenda || "Unknown"}

RULES:
1. Stay in character as this country's delegate at ALL times.
2. Use real foreign policy positions, voting records, and treaties for YOUR assigned country.
3. Challenge the other delegate's arguments with specific counterpoints.
4. Ask pointed POIs (Points of Information) when they make weak claims.
5. Propose alternative solutions that favor YOUR country's interests.
6. Reference real UN resolutions, treaties, and international law.
7. Be diplomatically aggressive — push back hard but stay respectful.
8. Score their performance 0-100 after each exchange with specific feedback.
9. Point out logical flaws, unsupported claims, and strategic weaknesses.
10. Never break character or reveal you are an AI.

STYLE: Sound like a well-prepared, competitive MUN delegate. Be sharp, specific, and strategic.${memoryContext || ""}`,
        messages,
      }),
    );
    return { status: "success", data: result.text };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return { status: "error", message };
  }
}

function buildSystemPrompt(context: MunContext, memoryContext?: string) {
  return `You are MUNOS AI Assistant — a specialized MUN preparation and performance system.

CURRENT DELEGATE CONTEXT:
Country: ${context.country || "Not set — ask for it"}
Committee: ${context.committee || "Not set — ask for it"}
Agenda: ${context.agenda || "Not set — ask for it"}
Conference: ${context.conference || "Not set"}
${context.opposingCountries?.length ? `Opposing Countries: ${context.opposingCountries.join(", ")}` : ""}
${context.experienceLevel ? `Experience: ${context.experienceLevel}` : ""}
${context.assistantContext ? `\nRESEARCH CONTEXT FROM RESEARCH AGENT:\n${context.assistantContext}` : ""}
${memoryContext || ""}

CORE PRINCIPLES:
1. NEVER give generic MUN advice when delegate-specific advice is possible.
2. ALWAYS consider the delegate's country, committee, agenda, conference, and available context.
3. NEVER invent foreign-policy positions, voting records, treaties, UN resolutions, statistics, events, or quotations.
4. Clearly distinguish verified facts from analysis, strategic inference, and generated MUN content.
5. Generate COMPLETE usable outputs rather than merely explaining what the delegate could write.
6. Be strategically honest. If an argument is weak, say so and explain how to fix it.
7. Understand actual MUN procedure and distinguish procedure from strategy.
8. When the user requests a modification, modify the existing output precisely.
9. Never fabricate citations to make an answer look researched.
10. When context is missing, ask only for the minimum information required.

MUN STRATEGY: country interests, committee mandate, agenda relevance, allies, opposing blocs, political feasibility, implementation, funding, enforcement, diplomatic positioning, negotiation strategy, likely counterarguments.

GSL STRUCTURE: HOOK → CONTEXT → COUNTRY POSITION → EVIDENCE → PROPOSALS → CLOSING HOOK

POI TYPES: Diplomatic, Aggressive, Trap, Contradiction, Follow-up, Technical, Policy-based, Implementation-based

OUTPUT: 0-100 scoring with breakdowns. YOUR BIGGEST WEAKNESS. YOUR STRONGEST MOMENT. ONE THING TO FIX NEXT.

STYLE: Sound like an experienced MUN strategist. Be precise, direct, calm, and human. No robotic phrases.`;
}

// Re-export for backward compat
export { buildSystemPrompt as systemPrompt };

// ---------------------------------------------------------------------------
// GSL Builder
// ---------------------------------------------------------------------------

const GslSchema = z.object({
  hook: z.string().describe("Opening hook to grab attention"),
  context: z.string().describe("Why this agenda matters right now"),
  countryPosition: z.string().describe("Country's official position supported by research"),
  evidence: z.string().describe("Verified evidence: statistic, resolution, real-world example"),
  solutions: z.array(z.object({
    proposal: z.string().describe("Specific solution"),
    implementation: z.string().describe("How it could actually work"),
    funding: z.string().describe("How it is funded"),
    monitoring: z.string().describe("How it is monitored"),
  })).describe("2-3 specific solutions with implementation details"),
  closing: z.string().describe("Memorable closing line"),
  fullSpeech: z.string().describe("Complete ready-to-speak GSL speech with timing markers"),
  wordCount: z.number().describe("Approximate word count"),
  estimatedSeconds: z.number().describe("Estimated speaking time in seconds"),
  keyStrategicIdea: z.string().describe("The core strategic idea of this speech"),
});

export type GslResult = z.infer<typeof GslSchema>;

export async function generateGsl(
  context: MunContext,
  duration: 60 | 90 | 120 = 60,
  tone: "diplomatic" | "aggressive" | "neutral" = "diplomatic",
): Promise<{ status: "success"; data: GslResult } | { status: "error"; message: string }> {
  try {
    const result = await generateObject({
      model: getBestObjectModel(),
      schema: GslSchema,
      prompt: `You are MUNOS GSL Builder. Generate a ${duration}-second GSL speech.

Country: ${context.country || "Unknown"}
Committee: ${context.committee || "Unknown"}
Agenda: ${context.agenda || "Unknown"}
Duration: ${duration} seconds (~${Math.round(duration * 2.5)} words)
Tone: ${tone}
${context.assistantContext ? `\nRESEARCH CONTEXT:\n${context.assistantContext}` : ""}

RULES:
1. Use the country's ACTUAL foreign policy. Reference real UN voting records, treaties, alliances, statistics.
2. NEVER invent statistics, resolutions, treaties, voting records, or government positions.
3. If a factual claim cannot be verified, omit it or mark it for verification.
4. Solutions must fall within committee mandate, be specific and actionable.
5. Do not begin with "Honourable Chair" unless requested.
6. Do not use "in conclusion" or robotic transitions.
7. Respect the requested duration.
8. Make it sound like a human delegate, not AI.

STRUCTURE: HOOK → CONTEXT → COUNTRY POSITION → EVIDENCE → 2-3 SOLUTIONS → IMPLEMENTATION → CLOSING

OPENING: shocking statistic, striking fact, provocative question, or real-world event.
EVIDENCE: one statistic, one UN resolution/treaty, one real example.
SOLUTIONS: specific, actionable, with WHO implements, HOW funded, HOW monitored.
CLOSING: memorable one-liner.
TONE: ${tone === "aggressive" ? "Direct, confrontational" : tone === "diplomatic" ? "Warm but firm" : "Balanced, factual"}

Add [TIMING] markers every 15-20 seconds. Provide GSL, WORD COUNT, ESTIMATED TIME, KEY STRATEGIC IDEA.`,
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
    type: z.enum(["diplomatic", "aggressive", "trap", "contradiction", "follow-up", "technical", "policy-based", "implementation-based"]),
    targetCountry: z.string().describe("Which country this POI targets"),
    rationale: z.string().describe("Why this POI works"),
    expectedResponse: z.string().describe("What response to expect"),
    followUp: z.string().describe("Follow-up POI if they dodge"),
  })),
});

export type PoiResult = z.infer<typeof PoisSchema>;

export async function generatePois(
  context: MunContext,
  opponentSpeech: string,
  count: number = 5,
): Promise<{ status: "success"; data: PoiResult } | { status: "error"; message: string }> {
  try {
    const result = await generateObject({
      model: getBestObjectModel(),
      schema: PoisSchema,
      prompt: `Generate ${count} POIs based on this speech.

MY COUNTRY: ${context.country || "Unknown"}
MY COMMITTEE: ${context.committee || "Unknown"}
AGENDA: ${context.agenda || "Unknown"}

OPPONENT'S SPEECH:
${opponentSpeech}

Generate POIs that expose contradictions, challenge weak proposals, highlight inconsistencies. Mix types: diplomatic, aggressive, trap, contradiction, follow-up, technical, policy-based, implementation-based. For each: WHY IT WORKS, WHAT RESPONSE TO EXPECT, FOLLOW-UP if they dodge.`,
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
  biggestWeakness: z.string().describe("The single biggest weakness"),
  strongestMoment: z.string().describe("The strongest moment and when it occurs"),
  oneThingToFix: z.string().describe("One thing to fix next"),
});

export type PoiEvaluation = z.infer<typeof PoiEvaluationSchema>;

export async function evaluatePoiAnswer(
  poi: string,
  answer: string,
  context: MunContext,
): Promise<{ status: "success"; data: PoiEvaluation } | { status: "error"; message: string }> {
  try {
    const result = await generateObject({
      model: getBestObjectModel(),
      schema: PoiEvaluationSchema,
      prompt: `Score this POI answer 0-100.

Country: ${context.country || "Unknown"}
Committee: ${context.committee || "Unknown"}
POI: ${poi}
ANSWER: ${answer}

Score: overall, relevance, diplomacy, accuracy, confidence, deflection, timeManagement. Be honest. Identify BIGGEST WEAKNESS, STRONGEST MOMENT, ONE THING TO FIX NEXT.`,
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
  oneThingToFix: z.string().describe("One thing to fix next"),
  improvements: z.array(z.string()).describe("3 specific improvements"),
  rewrittenOpening: z.string().describe("A stronger version of the opening"),
});

export type SpeechAnalysis = z.infer<typeof SpeechAnalysisSchema>;

export async function analyzeSpeech(
  transcript: string,
  context: MunContext,
  durationSec?: number,
): Promise<{ status: "success"; data: SpeechAnalysis } | { status: "error"; message: string }> {
  try {
    const result = await generateObject({
      model: getBestObjectModel(),
      schema: SpeechAnalysisSchema,
      prompt: `Analyze this speech transcript.

Country: ${context.country || "Unknown"}
Committee: ${context.committee || "Unknown"}
Agenda: ${context.agenda || "Unknown"}
${durationSec ? `Duration: ${durationSec}s` : ""}

SPEECH:
${transcript}

Score 0-100: overall, clarity, confidence, diplomacy, structure, persuasiveness, research, delivery. speakingPace, fillerWords count. Identify BIGGEST WEAKNESS, STRONGEST MOMENT, ONE THING TO FIX NEXT. Provide 3 improvements and rewritten opening.`,
    });
    return { status: "success", data: result.object };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return { status: "error", message };
  }
}
