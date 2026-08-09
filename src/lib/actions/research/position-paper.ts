"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { ok, toActionError, type ActionState } from "@/lib/actions";
import { isAiConfigured, isWebSearchConfigured } from "@/lib/env";
import { performWebSearch } from "@/lib/actions/web-search";

const PositionPaperSchema = z.object({
  heading: z.string().describe("Heading: e.g., \'POSITION PAPER\'"),
  committee: z.string().describe("Committee name"),
  country: z.string().describe("Country name"),
  topic: z.string().describe("Topic title"),
  abstract: z.string().describe("A 150-250 word abstract summarizing the country\'s position"),
  background: z.string().describe("Historical context and background of the topic from the country\'s perspective"),
  pastInternationalAction: z.string().describe("Past UN and international actions related to the topic"),
  countryPolicy: z.string().describe("The country\'s current policies and justifications for its position"),
  proposedSolutions: z.string().describe("Specific policy recommendations and solutions the country proposes"),
});

export type PositionPaper = z.infer<typeof PositionPaperSchema>;

export async function generatePositionPaper(
  committee: string,
  country: string,
  topic: string,
): Promise<
  { status: "success"; data: PositionPaper } | { status: "error"; message: string }
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
          .map((result, index) => `
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
      model: google("gemini-2.5-flash"),
      schema: PositionPaperSchema,
      prompt: `You are an expert MUN (Model United Nations) assistant. Generate a formal position paper for a delegate representing ${country} in the ${committee} committee on the topic: ${topic}.

The position paper should include:
1. Heading: Clearly label it as a position paper and include committee, country, and topic.
2. Abstract: A concise 150-250 word summary of the country\'s position.
3. Background: Historical context and background of the topic from the country\'s perspective.
4. Past International Action: Past UN and international actions related to the topic.
5. Country Policy: The country\'s current policies and justifications for its position.
6. Proposed Solutions: Specific policy recommendations and solutions the country proposes.

Write in a formal, analytical style appropriate for Model United Nations. Use clear, diplomatic language. Ensure all sections are well-developed and grounded in the country\'s known stance and historical voting patterns.${searchResults}`, 
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
