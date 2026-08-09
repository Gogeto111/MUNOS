"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { ok, toActionError, type ActionState } from "@/lib/actions";
import { isAiConfigured, isWebSearchConfigured } from "@/lib/env";
import { performWebSearch } from "../web-search";

const TopicBriefingSchema = z.object({
  executiveSummary: z.string().describe("A concise 1-2 paragraph executive summary of the topic"),
  historicalContext: z.string().describe("Key historical events and developments leading to the current situation"),
  currentStatus: z.string().describe("The current state of the issue, including recent developments"),
  keyActors: z
    .array(
      z.object({
        actor: z.string().describe("Name of the actor (country, organization, etc.)"),
        role: z.string().describe("Their role or stance on the issue"),
      }),
    )
    .describe("Key countries, organizations, and other actors involved"),
  pastResolutions: z
    .array(
      z.object({
        symbol: z.string().describe("UN document symbol (e.g., S/RES/2254)"),
        title: z.string().describe("Short title of the resolution"),
        year: z.number().describe("Year the resolution was adopted"),
        relevance: z.string().describe("Why this resolution is relevant to the current topic"),
      }),
    )
    .describe("Relevant past UN resolutions on this topic"),
  discussionQuestions: z
    .array(z.string())
    .describe("3-5 questions to guide debate and discussion"),
});

export type TopicBriefing = z.infer<typeof TopicBriefingSchema>;

export async function generateTopicBriefing(
  topic: string,
  committee: string,
): Promise<
  { status: "success"; data: TopicBriefing } | { status: "error"; message: string }
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
    const searchQuery = `${topic} ${committee} United Nations recent developments 2024 2025`;
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
      schema: TopicBriefingSchema,
      prompt: `You are an expert MUN (Model United Nations) research assistant. Generate a topic briefing for the ${committee} committee on the topic: ${topic}.

The topic briefing should include:
1. Executive Summary: A concise 1-2 paragraph overview of the topic.
2. Historical Context: Key historical events and developments leading to the current situation.
3. Current Status: The current state of the issue, including recent developments.
4. Key Actors: Key countries, organizations, and other actors involved, with their roles or stances.
5. Past Resolutions: Relevant past UN resolutions on this topic, including symbols, titles, years, and relevance.
6. Discussion Questions: 3-5 questions to guide debate and discussion.

Write in a clear, informative style appropriate for Model UN preparation. Focus on providing a balanced, factual overview that helps delegates understand the topic and prepare for negotiations.${searchResults}`, 
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
