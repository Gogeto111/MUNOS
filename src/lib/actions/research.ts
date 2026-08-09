"use server";

import { generateObject } from "ai";
import { getBestModel } from "@/lib/ai-model";
import { z } from "zod";
import { isAiConfigured, isWebSearchConfigured } from "@/lib/env";
import { performWebSearch, type GoogleSearchResult } from "@/lib/actions/web-search";

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
    // Perform web search to gather recent information
    const searchQuery = `${topic} ${country} ${committee} United Nations recent developments 2024 2025`;
    let searchResults: string = "";
    
    if (isWebSearchConfigured) {
      const searchResult = await performWebSearch(searchQuery, 5);
      if (searchResult.status === "success") {
        const formattedResults = searchResult.data
          .map((result: GoogleSearchResult, index: number) => `
  [${index + 1}] Title: ${result.title}
      URL: ${result.link}
      Summary: ${result.snippet}`)
          .join("\n");
        
        searchResults = `
RECENT WEB SEARCH RESULTS:
${formattedResults}

Please incorporate information from these recent sources into your analysis where relevant.`;
      }
    }

    const result = await generateObject({
      model: getBestModel(),
      schema: ResearchBriefSchema,
      prompt: `You are an expert MUN research assistant. Generate a research brief for ${country} in the ${committee} committee on ${topic}. Include overview, arguments for/against, relevant resolutions, talking points, and bibliography.${searchResults}`
    });

    return { status: "success", data: result.object };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    if (message.includes("API key") || message.includes("quota") || message.includes("rate")) {
      return { status: "error", message: "AI service is temporarily unavailable. Please try again later." };
    }
    return { status: "error", message };
  }
}
