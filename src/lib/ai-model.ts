import { type LanguageModel } from "ai";
import { google } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { createGroq } from "@ai-sdk/groq";
import { env, isAiConfigured, isGroqConfigured, isOpenAiConfigured, isAnthropicConfigured, isNvidiaConfigured } from "@/lib/env";

// ---------------------------------------------------------------------------
// Shared AI model getter — Groq (fastest, free) → NVIDIA (free) → Gemini → OpenAI → Anthropic
// ---------------------------------------------------------------------------

let _groq: ReturnType<typeof createGroq> | null = null;
let _nvidia: ReturnType<typeof createOpenAI> | null = null;

function getGroq() {
  if (!_groq) _groq = createGroq({ apiKey: env.GROQ_API_KEY });
  return _groq;
}

function getNvidia() {
  if (!_nvidia) _nvidia = createOpenAI({
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKey: env.NVIDIA_API_KEY,
  });
  return _nvidia;
}

/**
 * Get the best available AI model.
 * Priority: Groq (fastest, free) → NVIDIA NIM (free) → Gemini → OpenAI → Anthropic
 */
export function getBestModel(): LanguageModel {
  if (isGroqConfigured) return getGroq()("llama-3.3-70b-versatile");
  if (isNvidiaConfigured) return getNvidia()("nvidia/llama-3.3-nemotron-super-49b-v1");
  if (isAiConfigured) return google(env.AI_MODEL || "gemini-2.5-flash");
  if (isOpenAiConfigured) return createOpenAI({ apiKey: env.OPENAI_API_KEY })("gpt-4o");
  if (isAnthropicConfigured) return anthropic("claude-sonnet-4-20250514");
  throw new Error("No AI provider configured. Add GROQ_API_KEY or NVIDIA_API_KEY to .env (both free, no credit card).");
}

/**
 * Get a specific provider model with fallback.
 */
export function getModelWithFallback(preferred: "groq" | "nvidia" | "gemini" | "openai" | "anthropic"): LanguageModel {
  const providers: Record<string, () => LanguageModel> = {
    groq: () => getGroq()("llama-3.3-70b-versatile"),
    nvidia: () => getNvidia()("nvidia/llama-3.3-nemotron-super-49b-v1"),
    gemini: () => google(env.AI_MODEL || "gemini-2.5-flash"),
    openai: () => createOpenAI({ apiKey: env.OPENAI_API_KEY })("gpt-4o"),
    anthropic: () => anthropic("claude-sonnet-4-20250514"),
  };
  try { return providers[preferred](); } catch {}
  return getBestModel();
}
