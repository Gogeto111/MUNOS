"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { isAiConfigured, isWebSearchConfigured } from "@/lib/env";
import { performWebSearch, type GoogleSearchResult } from "@/lib/actions/web-search";
import type { ResearchDossier } from "@/lib/actions/research-dossier-types";

const DossierSchema = z.object({
  executiveBrief: z.object({
    whatIsHappening: z.string(),
    whyItMatters: z.string(),
    whatDoesUnSay: z.string(),
    currentSituation: z.string(),
  }),
  countryPosition: z.object({
    officialPosition: z.string(),
    relevantPolicies: z.array(z.string()),
    previousStatements: z.array(z.string()),
    votingBehavior: z.string(),
    treaties: z.array(z.string()),
    alliances: z.array(z.string()),
    regionalInterests: z.string(),
  }),
  agendaDeepDive: z.object({
    keyIssues: z.array(z.string()),
    causes: z.array(z.string()),
    currentDevelopments: z.array(z.string()),
    majorDisputes: z.array(z.string()),
    importantTerminology: z.array(z.object({ term: z.string(), definition: z.string() })),
  }),
  otherCountries: z.array(z.object({
    country: z.string(),
    position: z.string(),
    interests: z.array(z.string()),
    allies: z.array(z.string()),
    opponents: z.array(z.string()),
    vulnerabilities: z.array(z.string()),
    likelyStance: z.string(),
  })),
  unFramework: z.object({
    resolutions: z.array(z.object({ symbol: z.string(), title: z.string(), relevance: z.string() })),
    charter: z.array(z.string()),
    treaties: z.array(z.string()),
    agencies: z.array(z.string()),
    relevantArticles: z.array(z.string()),
  }),
  munApplication: z.object({
    realisticProposals: z.array(z.string()),
    solutions: z.array(z.string()),
    clauses: z.array(z.string()),
    fundingMechanisms: z.array(z.string()),
    implementation: z.array(z.string()),
    monitoring: z.array(z.string()),
    cooperation: z.array(z.string()),
  }),
  attackMaterial: z.object({
    contradictions: z.array(z.string()),
    votingInconsistencies: z.array(z.string()),
    treatyInconsistencies: z.array(z.string()),
    implementationFailures: z.array(z.string()),
    relevantStatistics: z.array(z.string()),
    diplomaticWeaknesses: z.array(z.string()),
  }),
  sources: z.array(z.object({
    id: z.number(),
    title: z.string(),
    url: z.string(),
    tier: z.number(),
    credibility: z.number(),
  })),
});

export async function generateResearchDossier(
  topic: string,
  country: string,
  committee: string,
): Promise<
  { status: "success"; data: ResearchDossier } | { status: "error"; message: string }
> {
  if (!isAiConfigured) {
    return {
      status: "error",
      message: "AI is not configured. Add GOOGLE_GENERATIVE_AI_API_KEY to your .env.",
    };
  }

  try {
    const searches = [
      `${topic} ${country} United Nations position 2024 2025`,
      `${topic} UN resolutions international law`,
      `${country} foreign policy ${topic}`,
      `${committee} ${topic} debate 2024`,
    ];

    let searchContext = "";

    if (isWebSearchConfigured) {
      for (const query of searches) {
        const result = await performWebSearch(query, 5);
        if (result.status === "success") {
          const formatted = result.data
            .map((r: GoogleSearchResult, i: number) => `[${i + 1}] ${r.title}\n${r.link}\n${r.snippet}`)
            .join("\n\n");
          searchContext += `\n\nSEARCH: "${query}"\n${formatted}`;
        }
      }
    }

    const result = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: DossierSchema,
      prompt: `You are an expert MUN research analyst. Generate a comprehensive 8-page research dossier for:

COUNTRY: ${country}
COMMITTEE: ${committee}
AGENDA: ${topic}

${searchContext ? `WEB SEARCH RESULTS:${searchContext}` : ""}

Generate a thorough, well-sourced dossier. Be specific — use real UN resolutions, real voting records, real treaties.

For the sources page, classify each source:
- Tier 1 (Official): UN, government, official conference sites
- Tier 2 (Research): Universities, think tanks, IOs
- Tier 3 (General): News, blogs, general web

The attack material should be diplomatic ammunition — factual contradictions and inconsistencies, not personal attacks.`,
    });

    return { status: "success", data: result.object as ResearchDossier };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return { status: "error", message };
  }
}
