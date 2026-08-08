"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { ok, toActionError, type ActionState } from "@/lib/actions";
import { isAiConfigured } from "@/lib/env";

const ResearchPackSchema = z.object({
  background: z.string().describe("Historical and political background of the topic"),
  keyIssues: z
    .array(z.object({ issue: z.string(), detail: z.string() }))
    .describe("Key issues and sub-topics within the committee's mandate"),
  countryPosition: z.object({
    stance: z.string().describe("The country's official or likely stance"),
    history: z.string().describe("Voting history and past statements on this topic"),
    alliances: z.string().describe("Key allies and coalitions on this issue"),
  }),
  relevantResolutions: z
    .array(
      z.object({
        symbol: z.string().describe("UN document symbol"),
        title: z.string(),
        relevance: z.string(),
      }),
    )
    .describe("Relevant past UN resolutions"),
  speakingPoints: z
    .array(z.string())
    .describe("5-7 ready-to-use speaking points for debate"),
  bibliography: z
    .array(z.object({ title: z.string(), source: z.string() }))
    .describe("Key sources for further research"),
});

export type ResearchPack = z.infer<typeof ResearchPackSchema>;

export async function generateResearchPack(
  committeeName: string,
  topic: string,
  country: string,
): Promise<ActionState<ResearchPack>> {
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
      schema: ResearchPackSchema,
      prompt: `You are an expert MUN research assistant. Generate a comprehensive research pack for a delegate representing ${country} in the ${committeeName} committee.

TOPIC: ${topic}

Provide:
1. Historical and political background of the topic
2. Key issues and sub-topics within the committee's mandate
3. ${country}'s likely position, voting history, and key alliances
4. Relevant past UN resolutions with document symbols
5. 5-7 ready-to-use speaking points for debate
6. A bibliography of key sources

Write in a formal, analytical style appropriate for Model United Nations. Be specific about ${country}'s known positions where possible. If the country's exact position is uncertain, note this and provide the most likely stance based on historical voting records and regional alignments.`,
    });

    return ok("Research pack generated.", result.object);
  } catch (error) {
    return toActionError(error);
  }
}
