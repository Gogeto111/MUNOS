"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { env, isAiConfigured } from "@/lib/env";

export async function generateSituationAnalysis(
  country: string,
  committee: string,
  agenda: string,
): Promise<{ status: "success"; data: string } | { status: "error"; message: string }> {
  if (!isAiConfigured) {
    return { status: "error", message: "AI not configured." };
  }

  try {
    const result = await generateText({
      model: google(env.AI_MODEL || "gemini-2.5-flash"),
      system: `You are a MUN Situation Room analyst. Generate a comprehensive situation analysis for a delegate in a committee session.

COUNTRY: ${country}
COMMITTEE: ${committee}
AGENDA: ${agenda}

Provide:
1. Breaking developments relevant to the agenda
2. Talking points the delegate can use
3. POIs they can ask other countries
4. Resolution implications

Be specific to ${country}'s actual foreign policy position. Be concise and actionable.`,
      prompt: "Generate the situation room analysis now.",
    });

    return { status: "success", data: result.text };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return { status: "error", message };
  }
}
