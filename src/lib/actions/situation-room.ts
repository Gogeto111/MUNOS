"use server";

import { generateText } from "ai";
import { getBestModel } from "@/lib/ai-model";
import { isAiConfigured } from "@/lib/env";

export async function generateSituationAnalysis(
  country: string,
  committee: string,
  agenda: string,
  customPrompt?: string,
): Promise<{ status: "success"; data: string } | { status: "error"; message: string }> {
  if (!isAiConfigured) {
    return { status: "error", message: "AI not configured." };
  }

  try {
    const result = await generateText({
      model: getBestModel(),
      system: `You are a MUN Situation Room analyst. Generate a situation analysis for a delegate in a committee session.

COUNTRY: ${country}
COMMITTEE: ${committee}
AGENDA: ${agenda}

Be specific to ${country}'s actual foreign policy position. Be concise and actionable.`,
      prompt: customPrompt || "Generate the situation room analysis now.",
    });

    return { status: "success", data: result.text };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return { status: "error", message };
  }
}
