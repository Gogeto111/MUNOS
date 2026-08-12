"use server";

import { z } from "zod";

// Define the structure for a single search result
const GoogleSearchResultSchema = z.object({
  title: z.string(),
  link: z.string(),
  snippet: z.string(),
});

// Define the structure for the search response
const GoogleSearchResponseSchema = z.object({
  items: z.array(GoogleSearchResultSchema).optional(),
  searchInformation: z.object({
    totalResults: z.string(),
    searchTime: z.string(),
  }).optional(),
});

export type GoogleSearchResult = z.infer<typeof GoogleSearchResultSchema>;

export async function performWebSearch(
  query: string,
  numResults: number = 10
): Promise<{ status: "success"; data: GoogleSearchResult[] } | { status: "error"; message: string }> {
  try {
    // Check if API keys are configured
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_CX;
    
    if (!apiKey || apiKey === "your_google_search_api_key_here") {
      return {
        status: "error",
        message: "Google Search API key is not configured. Please add GOOGLE_SEARCH_API_KEY to your .env file."
      };
    }
    
    if (!searchEngineId || searchEngineId === "your_google_search_engine_id_here") {
      return {
        status: "error",
        message: "Google Search Engine ID is not configured. Please add GOOGLE_SEARCH_CX to your .env file."
      };
    }
    
    // Validate parameters
    if (!query.trim()) {
      return { status: "error", message: "Search query cannot be empty." };
    }
    
    if (numResults < 1 || numResults > 10) {
      return { status: "error", message: "Number of results must be between 1 and 10." };
    }
    
    // Construct the Google Custom Search API URL
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("cx", searchEngineId);
    url.searchParams.set("q", query.trim());
    url.searchParams.set("num", numResults.toString());
    
    // Perform the search request
    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10_000) });
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        status: "error",
        message: `Google Search API error: ${response.status} ${response.statusText}. Details: ${errorText.substring(0, 200)}`
      };
    }
    
    // Parse the response
    const data = await response.json();
    
    // Validate the response using Zod
    const parseResult = GoogleSearchResponseSchema.safeParse(data);
    if (!parseResult.success) {
      return {
        status: "error",
        message: "Invalid response format from Google Search API."
      };
    }
    
    const searchResponse = parseResult.data;
    
    // Return the search results (empty array if no results)
    return {
      status: "success",
      data: searchResponse.items ?? []
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred during web search.";
    return { status: "error", message };
  }
}