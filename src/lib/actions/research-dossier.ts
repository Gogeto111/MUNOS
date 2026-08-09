"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { isAiConfigured, isWebSearchConfigured } from "@/lib/env";
import { performWebSearch, type GoogleSearchResult } from "@/lib/actions/web-search";

// ---------------------------------------------------------------------------
// Source Hierarchy
// ---------------------------------------------------------------------------

export enum SourceTier {
  OFFICIAL = 1,    // UN, governments, official conference sites
  RESEARCH = 2,    // Universities, think tanks, IOs
  GENERAL = 3,     // News, blogs, general web
}

export interface Source {
  title: string;
  url: string;
  tier: SourceTier;
  credibility: number; // 0-100
}

// ---------------------------------------------------------------------------
// 8-Page Research Dossier Schema
// ---------------------------------------------------------------------------

const DossierSchema = z.object({
  // Page 1 — Executive Brief
  executiveBrief: z.object({
    whatIsHappening: z.string().describe("Current state of the issue"),
    whyItMatters: z.string().describe("Why this matters to the international community"),
    whatDoesUnSay: z.string().describe("What the UN has said/done about this"),
    currentSituation: z.string().describe("Current developments and status"),
  }),

  // Page 2 — Country Position
  countryPosition: z.object({
    officialPosition: z.string().describe("Country's official position on the agenda"),
    relevantPolicies: z.array(z.string()).describe("Key policies related to the topic"),
    previousStatements: z.array(z.string()).describe("Notable past statements at the UN"),
    votingBehavior: z.string().describe("How the country has voted on similar resolutions"),
    treaties: z.array(z.string()).describe("Relevant treaties the country has signed"),
    alliances: z.array(z.string()).describe("Key alliances and blocs the country belongs to"),
    regionalInterests: z.string().describe("Regional interests and dynamics"),
  }),

  // Page 3 — Agenda Deep Dive
  agendaDeepDive: z.object({
    keyIssues: z.array(z.string()).describe("Main issues within the agenda topic"),
    causes: z.array(z.string()).describe("Root causes and drivers"),
    currentDevelopments: z.array(z.string()).describe("Recent developments"),
    majorDisputes: z.array(z.string()).describe("Key points of contention between nations"),
    importantTerminology: z.array(z.object({
      term: z.string(),
      definition: z.string(),
    })).describe("Important terms delegates should know"),
  }),

  // Page 4 — Other Countries
  otherCountries: z.array(z.object({
    country: z.string(),
    position: z.string(),
    interests: z.array(z.string()),
    allies: z.array(z.string()),
    opponents: z.array(z.string()),
    vulnerabilities: z.array(z.string()),
    likelyStance: z.string(),
  })).describe("Analysis of key countries and their positions"),

  // Page 5 — UN/International Framework
  unFramework: z.object({
    resolutions: z.array(z.object({
      symbol: z.string(),
      title: z.string(),
      relevance: z.string(),
    })).describe("Relevant UN resolutions"),
    charter: z.array(z.string()).describe("Relevant UN Charter articles"),
    treaties: z.array(z.string()).describe("Key treaties and conventions"),
    agencies: z.array(z.string()).describe("Relevant UN agencies and bodies"),
    relevantArticles: z.array(z.string()).describe("Specific articles and clauses"),
  }),

  // Page 6 — MUN Application
  munApplication: z.object({
    realisticProposals: z.array(z.string()).describe("What the country can realistically propose"),
    solutions: z.array(z.string()).describe("Potential solutions"),
    clauses: z.array(z.string()).describe("Draft resolution clauses"),
    fundingMechanisms: z.array(z.string()).describe("How to fund proposed solutions"),
    implementation: z.array(z.string()).describe("Implementation mechanisms"),
    monitoring: z.array(z.string()).describe("Monitoring and evaluation frameworks"),
    cooperation: z.array(z.string()).describe("International cooperation frameworks"),
  }),

  // Page 7 — Attack Material
  attackMaterial: z.object({
    contradictions: z.array(z.string()).describe("Policy contradictions to exploit"),
    votingInconsistencies: z.array(z.string()).describe("Voting record inconsistencies"),
    treatyInconsistencies: z.array(z.string()).describe("Treaty ratification gaps"),
    implementationFailures: z.array(z.string()).describe("Past implementation failures"),
    relevantStatistics: z.array(z.string()).describe("Statistics that weaken opponents"),
    diplomaticWeaknesses: z.array(z.string()).describe("Diplomatic vulnerabilities"),
  }),

  // Page 8 — Sources
  sources: z.array(z.object({
    id: z.number(),
    title: z.string(),
    url: z.string(),
    tier: z.number().describe("1=Official, 2=Research, 3=General"),
    credibility: z.number().describe("Credibility score 0-100"),
  })).describe("All sources used with tier and credibility"),
});

export type ResearchDossier = z.infer<typeof DossierSchema>;

// ---------------------------------------------------------------------------
// Generate 8-Page Research Dossier
// ---------------------------------------------------------------------------

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
    // Perform multiple web searches for comprehensive research
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

Generate a thorough, well-sourced dossier. Be specific — use real UN resolutions, real voting records, real treaties. If you're unsure about something, note it rather than making it up.

For the sources page, classify each source:
- Tier 1 (Official): UN, government, official conference sites
- Tier 2 (Research): Universities, think tanks, IOs
- Tier 3 (General): News, blogs, general web

The attack material should be diplomatic ammunition — factual contradictions and inconsistencies, not personal attacks.`,
    });

    return { status: "success", data: result.object };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return { status: "error", message };
  }
}
