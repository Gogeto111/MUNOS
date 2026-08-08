"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { ok, toActionError, type ActionState } from "@/lib/actions";
import { isAiConfigured } from "@/lib/env";

const CountryBriefSchema = z.object({
  foreignPolicy: z.object({
    overview: z.string().describe("Overview of the country's foreign policy doctrine"),
    priorities: z.array(z.string()).describe("Top 3-5 foreign policy priorities"),
  }),
  keyAlliances: z
    .array(
      z.object({
        group: z.string().describe("Alliance or bloc name"),
        role: z.string().describe("The country's role within this group"),
      }),
    )
    .describe("Key alliances and regional groupings"),
  votingRecord: z.object({
    generalAssembly: z.string().describe("General Assembly voting patterns"),
    securityCouncil: z.string().describe("Security Council position if applicable"),
    notableVotes: z
      .array(z.object({ resolution: z.string(), vote: z.string(), reasoning: z.string() }))
      .describe("Notable recent votes"),
  }),
  stance: z.object({
    position: z.string().describe("Likely position on this specific topic"),
    nuance: z.string().describe("Important nuances or caveats"),
  }),
  talkingPoints: z
    .array(z.string())
    .describe("5-7 ready-to-use diplomatic talking points"),
});

export type CountryBrief = z.infer<typeof CountryBriefSchema>;

export async function generateCountryBrief(
  country: string,
  committee: string,
  topic: string,
): Promise<ActionState<CountryBrief>> {
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
      schema: CountryBriefSchema,
      prompt: `You are an expert MUN diplomatic analyst. Generate a comprehensive country position brief for ${country} in the ${committee} committee on the following topic:

TOPIC: ${topic}

Provide:
1. Foreign policy overview and top priorities
2. Key alliances and regional groupings (${country}'s role in each)
3. Voting record in the General Assembly and Security Council, with 2-3 notable recent votes
4. ${country}'s likely stance on this specific topic with important nuances
5. 5-7 ready-to-use diplomatic talking points

Write in a formal, analytical style. Be specific about ${country}'s known positions. If the country's exact position on this topic is uncertain, note this and provide the most likely stance based on historical voting records and regional alignments.`,
    });

    return ok("Country brief generated.", result.object);
  } catch (error) {
    return toActionError(error);
  }
}
