"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { isAiConfigured } from "@/lib/env";

const ResearchBriefSchema = z.object({
  overview: z.string().describe("A concise 2-3 paragraph overview of the topic"),
  keyArgumentsFor: z
    .array(z.object({ point: z.string(), explanation: z.string() }))
    .describe("Key arguments in favour of the position"),
  keyArgumentsAgainst: z
    .array(z.object({ point: z.string(), explanation: z.string() }))
    .describe("Key arguments against the position"),
  relevantResolutions: z
    .array(
      z.object({
        symbol: z.string().describe("UN document symbol (e.g., S/RES/2254)"),
        title: z.string().describe("Short title of the resolution"),
        relevance: z.string().describe("Why this resolution is relevant"),
      }),
    )
    .describe("Relevant past UN resolutions on this topic"),
  talkingPoints: z
    .array(z.string())
    .describe("3-5 concise talking points for debate speeches or position paper"),
  bibliography: z
    .array(z.object({ title: z.string(), source: z.string() }))
    .describe("Key sources for further research"),
});

export type ResearchBrief = z.infer<typeof ResearchBriefSchema>;

export async function generateResearchBrief(
  topic: string,
  country: string,
  committee: string,
): Promise<
  { status: "success"; data: ResearchBrief } | { status: "error"; message: string }
> {
  if (!isAiConfigured) {
    return {
      status: "error",
      message:
        "AI is not configured. Add GOOGLE_GENERATIVE_AI_API_KEY to your .env and restart the dev server.",
    };
  }

  try {
    const result = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: ResearchBriefSchema,
      prompt: `You are an expert MUN (Model United Nations) research assistant. Generate a comprehensive research brief for a delegate representing ${country} in the ${committee} committee on the following topic:

TOPIC: ${topic}

Provide a detailed, well-researched brief including:
1. An overview of the topic with historical context and current developments
2. Key arguments in favour of the country's likely position
3. Key arguments against opposing positions
4. Relevant UN resolutions that are applicable
5. Concise talking points suitable for debate speeches
6. A bibliography of key sources

Write in a formal, analytical style appropriate for a Model United Nations context. Be specific about ${country}'s known positions on this topic where possible. If the country's exact position is uncertain, note this and provide the most likely stance based on historical voting records and regional alignments.`,
    });

    return { status: "success", data: result.object };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    if (message.includes("API key") || message.includes("quota") || message.includes("rate")) {
      return {
        status: "error",
        message: "AI service is temporarily unavailable. Please try again later.",
      };
    }
    return { status: "error", message };
  }
}
