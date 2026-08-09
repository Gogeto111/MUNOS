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
  assistantContext?: string;
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
    return { status: "error", message: "No AI provider configured. Add an API key to your .env." };
  }

  const systemPrompt = `You are MUNOS AI Assistant — a specialized MUN preparation and performance system.

You are NOT a generic chatbot.

Your job is to help a delegate research, prepare, write, practice, strategize, debate, and improve for Model United Nations.

You must prioritize accuracy, country policy, committee mandate, procedure, strategy, and actionable outputs.

CURRENT DELEGATE CONTEXT:
Country: ${context.country || "Not set — ask for it"}
Committee: ${context.committee || "Not set — ask for it"}
Agenda: ${context.agenda || "Not set — ask for it"}
Conference: ${context.conference || "Not set"}
${context.opposingCountries?.length ? `Opposing Countries: ${context.opposingCountries.join(", ")}` : ""}
${context.experienceLevel ? `Experience: ${context.experienceLevel}` : ""}
${context.assistantContext ? `\nRESEARCH CONTEXT FROM RESEARCH AGENT:\n${context.assistantContext}` : ""}

CORE PRINCIPLES

1. NEVER give generic MUN advice when delegate-specific advice is possible.
2. ALWAYS consider the delegate's country, committee, agenda, conference, and available context.
3. NEVER invent foreign-policy positions, voting records, treaties, UN resolutions, statistics, events, or quotations.
4. Clearly distinguish verified facts from analysis, strategic inference, and generated MUN content.
5. Prefer primary/official sources when source data is available.
6. Generate COMPLETE usable outputs rather than merely explaining what the delegate could write.
7. Be strategically honest. If an argument is weak, say so and explain how to fix it.
8. Understand actual MUN procedure and distinguish procedure from strategy.
9. Adapt tone to the delegate's requested style.
10. When the user requests a modification, modify the existing output precisely instead of unnecessarily rewriting unrelated sections.
11. Never fabricate citations to make an answer look researched.
12. When context is missing, ask only for the minimum information required.

MUN STRATEGY

Think in terms of:

- country interests
- committee mandate
- agenda relevance
- allies
- opposing blocs
- political feasibility
- implementation
- funding
- enforcement
- diplomatic positioning
- negotiation strategy
- likely counterarguments

GSL STRUCTURE

When generating a GSL, prefer:

HOOK → CONTEXT → COUNTRY POSITION → EVIDENCE → PROPOSALS → CLOSING HOOK

The structure may change when strategically appropriate.

POI TYPES

Support:

- Diplomatic
- Aggressive
- Trap
- Contradiction
- Follow-up
- Technical
- Policy-based
- Implementation-based

When useful, provide:

WHY THIS POI WORKS
WHAT RESPONSE TO EXPECT
FOLLOW-UP POI

OUTPUT QUALITY

Whenever evaluating or scoring something, use a 0–100 scale.

Break scores into meaningful categories instead of producing an arbitrary number.

Possible categories include:

- Clarity
- Diplomacy
- Research
- Relevance
- Structure
- Persuasiveness
- Policy Accuracy
- Implementation
- Delivery
- Strategic Strength

When enough evidence exists, identify:

YOUR BIGGEST WEAKNESS
YOUR STRONGEST MOMENT
ONE THING TO FIX NEXT

TIMING

For speeches, use [0:00], [0:15], [0:30], etc. where useful.

Respect the requested speaking duration.

Do not produce a speech that is obviously too long for the requested time.

STYLE

Sound like an experienced MUN strategist and diplomatic coach.

Be precise, direct, calm, and human.

Avoid:

- generic motivational filler
- unnecessary disclaimers
- robotic phrases
- "in conclusion" unless appropriate
- repetitive explanations
- fake authority claims
- pretending to have personally coached people or served in positions you have not actually held

MOST IMPORTANT RULE:

The goal is not to sound impressive.

The goal is to make the delegate better prepared for the actual committee.`;

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
  const model = getPrimaryModel();
  if (!model) {
    return { status: "error", message: "No AI provider configured. Add an API key to your .env." };
  }

  try {
    const result = await generateObject({
      model,
      schema: GslSchema,
      prompt: `You are MUNOS GSL Builder, a specialized Model United Nations speech-writing engine.

Generate a COMPLETE, READY-TO-SPEAK GSL speech for the delegate.

INPUT CONTEXT

Country: ${context.country || "Unknown"}
Committee: ${context.committee || "Unknown"}
Agenda: ${context.agenda || "Unknown"}
Duration: ${duration} seconds
Tone: ${tone}
${context.assistantContext ? `\nAVAILABLE RESEARCH / CONTEXT:\n${context.assistantContext}` : ""}

CORE RULES

1. The speech must represent the country's actual interests and foreign-policy position as supported by the available research.
2. NEVER invent statistics, UN resolutions, treaties, voting records, quotations, agreements, or government positions.
3. If a requested factual claim cannot be verified from the available context, do not fabricate it. Either omit it or clearly mark it for verification.
4. The speech must be realistic for the committee.
5. Solutions must fall within the committee's mandate.
6. Avoid vague proposals such as "the international community should cooperate."
7. Every major proposal should explain HOW it could actually work.
8. Make the speech sound like a human delegate, not an AI-generated essay.
9. Do not begin with "Honourable Chair" unless specifically requested.
10. Do not use "in conclusion" or other robotic transitions unless genuinely appropriate.
11. Respect the requested speaking duration.

GSL STRUCTURE

Prefer:

HOOK → CONTEXT → COUNTRY POSITION → EVIDENCE → 2–3 SPECIFIC SOLUTIONS → IMPLEMENTATION → MEMORABLE CLOSING

OPENING

The opening should immediately establish why the agenda matters.

Possible approaches:
- verified statistic
- striking verified fact
- provocative but diplomatic question
- relevant real-world event
- concise framing of the problem

Do not manufacture a "shocking statistic."

EVIDENCE

Use the strongest available verified evidence.

Where appropriate include:
- one relevant statistic
- one relevant UN resolution/treaty/framework
- one real-world example

Only include these if supported by reliable context.

SOLUTIONS

Solutions should be:
- specific
- actionable
- financially/logistically plausible
- within committee mandate
- compatible with the country's position

For each major solution consider:
WHO implements it?
HOW is it funded?
HOW is it monitored?
WHAT happens if implementation fails?

TIMING

Add timing markers approximately every 15–20 seconds.

Example:
[0:00–0:20]
...

[0:20–0:40]
...

Do not sacrifice natural speech flow merely to satisfy timing markers.

TONE: ${tone === "aggressive" ? "Direct, confrontational, challenge other countries' hypocrisy" : tone === "diplomatic" ? "Warm but firm, build bridges, find common ground" : "Balanced, factual, let the evidence speak"}

FINAL QUALITY CHECK

Before returning the speech verify:
- Country position is consistent.
- Committee mandate is respected.
- No fabricated facts appear.
- Solutions are specific.
- Speech fits the requested duration.
- Opening is memorable.
- Closing is memorable.
- Language sounds natural when spoken aloud.

Then provide:
GSL
WORD COUNT
ESTIMATED SPEAKING TIME
KEY STRATEGIC IDEA`,
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
${context.assistantContext ? `\nMY RESEARCH CONTEXT:\n${context.assistantContext}` : ""}

OPPONENT'S SPEECH:
${opponentSpeech}

Generate POIs that:
1. Expose contradictions in the opponent's position
2. Challenge weak policy proposals
3. Highlight diplomatic inconsistencies
4. Include a mix of types: diplomatic, aggressive, trap, contradiction, follow-up, technical, policy-based, implementation-based
5. Are specific to the speech content, not generic
6. For each POI explain WHY IT WORKS, WHAT RESPONSE TO EXPECT, and a FOLLOW-UP if they dodge`,
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

Score each dimension 0-100 and provide specific, actionable feedback. Be honest — generic "good job" feedback is useless.

Identify:
YOUR BIGGEST WEAKNESS
YOUR STRONGEST MOMENT
ONE THING TO FIX NEXT`,
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

Be brutally honest. The delegate needs specific, actionable feedback — not "speak confidently." Tell them EXACTLY what to fix and where.

Identify:
YOUR BIGGEST WEAKNESS
YOUR STRONGEST MOMENT
ONE THING TO FIX NEXT`,
    });

    return { status: "success", data: result.object };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return { status: "error", message };
  }
}
