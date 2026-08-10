"use server";

import { generateObject } from "ai";
import { getBestObjectModel } from "@/lib/ai-model";
import { isAiConfigured, isWebSearchConfigured } from "@/lib/env";
import { performWebSearch, type GoogleSearchResult } from "@/lib/actions/web-search";
import type { ResearchDossier } from "@/lib/actions/research-dossier-types";
import { z } from "zod";

const DossierSchema = z.object({
  executiveBrief: z.object({
    whatIsHappening: z.string(),
    whyItMatters: z.string(),
    currentSituation: z.string(),
    whyCommitteeShouldCare: z.string(),
  }),
  agendaDeepDive: z.object({
    historicalBackground: z.string(),
    currentSituation: z.string(),
    majorCauses: z.array(z.string()),
    majorConsequences: z.array(z.string()),
    importantActors: z.array(z.string()),
    majorDisputes: z.array(z.string()),
    keyTerminology: z.array(z.object({ term: z.string(), definition: z.string() })),
  }),
  countryPosition: z.object({
    officialPosition: z.string(),
    relevantPolicies: z.array(z.string()),
    historicalInvolvement: z.array(z.string()),
    treaties: z.array(z.string()),
    relevantInternationalCommitments: z.array(z.string()),
    governmentStatements: z.array(z.string()),
    votingRecord: z.array(z.string()),
    relevantRegionalInterests: z.string(),
    economicInterests: z.string(),
    securityInterests: z.string(),
    politicalInterests: z.string(),
    likelyNegotiatingPriorities: z.array(z.string()),
  }),
  countryInterests: z.object({
    whatDoesCountryWant: z.array(z.string()),
    whatDoesCountryNeedToAvoid: z.array(z.string()),
    whatWouldBePoliticallyDifficult: z.array(z.string()),
  }),
  internationalLandscape: z.object({
    allies: z.array(z.object({ country: z.string(), why: z.string() })),
    likelyAllies: z.array(z.object({ country: z.string(), why: z.string() })),
    neutralStates: z.array(z.object({ country: z.string(), why: z.string() })),
    opposingStates: z.array(z.object({ country: z.string(), why: z.string() })),
    regionalBlocs: z.array(z.object({ name: z.string(), position: z.string() })),
    organizations: z.array(z.object({ name: z.string(), relevance: z.string() })),
  }),
  unFramework: z.object({
    charterProvisions: z.array(z.string()),
    resolutions: z.array(z.object({ symbol: z.string(), title: z.string(), relevance: z.string() })),
    treaties: z.array(z.object({ name: z.string(), relevance: z.string() })),
    conventions: z.array(z.string()),
    relevantAgencies: z.array(z.object({ name: z.string(), role: z.string() })),
  }),
  currentAffairs: z.array(z.object({
    whatHappened: z.string(),
    when: z.string(),
    whyItMatters: z.string(),
    whyItMattersToCountry: z.string(),
    source: z.string(),
  })),
  evidence: z.array(z.object({
    type: z.string(),
    content: z.string(),
    source: z.string(),
  })),
  diplomaticAmmunition: z.object({
    contradictions: z.array(z.string()),
    inconsistentPolicies: z.array(z.string()),
    implementationFailures: z.array(z.string()),
    treatyInconsistencies: z.array(z.string()),
    votingContradictions: z.array(z.string()),
    relevantHistoricalPositions: z.array(z.string()),
  }),
  poiBank: z.array(z.object({
    text: z.string(),
    type: z.string(),
    targetCountry: z.string(),
    rationale: z.string(),
  })),
  defenseBank: z.array(z.object({
    expectedAttack: z.string(),
    whyTheyMayUseIt: z.string(),
    bestResponse: z.string(),
    followUpResponse: z.string(),
  })),
  policyOptions: z.array(z.object({
    problem: z.string(),
    proposal: z.string(),
    implementation: z.string(),
    funding: z.string(),
    monitoring: z.string(),
    responsibleActors: z.array(z.string()),
    potentialObstacle: z.string(),
    howToAddressObstacle: z.string(),
  })),
  resolutionMaterial: z.object({
    preambulatoryClauses: z.array(z.string()),
    operativeClauses: z.array(z.string()),
    subclauses: z.array(z.string()),
    implementationMechanisms: z.array(z.string()),
    fundingMechanisms: z.array(z.string()),
    monitoringMechanisms: z.array(z.string()),
    timelines: z.array(z.string()),
    responsibleOrganizations: z.array(z.string()),
  }),
  gslMaterial: z.object({
    strongestOpeningHook: z.string(),
    strongestCountryPosition: z.string(),
    strongestEvidence: z.string(),
    strongestSolution: z.string(),
    strongestClosingHook: z.string(),
  }),
  takeaways: z.array(z.string()),
  sources: z.array(z.object({
    title: z.string(),
    organization: z.string(),
    date: z.string(),
    tier: z.number(),
    url: z.string(),
    supports: z.string(),
  })),
  assistantContext: z.string(),
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
      `${topic} ${country} United Nations position 2024 2025 2026`,
      `${topic} UN resolutions international law treaties`,
      `${country} foreign policy ${topic} official statement`,
      `${committee} ${topic} debate 2024 2025`,
      `${topic} current situation developments 2025 2026`,
      `${country} voting record United Nations ${topic}`,
      `${topic} organizations agencies funding implementation`,
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
      model: getBestObjectModel(),
      schema: DossierSchema,
      prompt: `You are MUNOS AI Research Agent — a specialized research system for Model United Nations.

Your purpose is to transform:

COUNTRY + COMMITTEE + AGENDA

into a comprehensive, structured, source-aware MUN research dossier.

INPUT

COUNTRY: ${country}
COMMITTEE: ${committee}
AGENDA: ${topic}

${searchContext ? `AVAILABLE WEB / RESEARCH RESULTS:${searchContext}` : ""}

PRIMARY OBJECTIVE

Give the delegate the information required to:
- understand the issue
- understand their country's position
- understand other countries
- identify allies and opposing positions
- speak accurately
- ask strong POIs
- defend their country
- propose realistic solutions
- write resolutions
- prepare for debate

Do NOT optimize for a fixed page count.
Optimize for completeness, relevance, accuracy, and usability.

SOURCE PRIORITY

TIER 1 — PRIMARY / OFFICIAL
Prioritize: United Nations, UN agencies, official government websites, official treaties, official UN resolutions, official government statements, official conference websites, official MUN brochures / background guides

TIER 2 — HIGH-QUALITY RESEARCH
Use: universities, established think tanks, international organizations, reputable research institutions, academic publications

TIER 3 — SECONDARY SOURCES
Use: established news organizations, reputable databases, general websites

Treat lower-tier sources as supporting evidence, not automatic authority.

FACTUAL ACCURACY

NEVER fabricate: statistics, resolutions, treaties, voting records, government statements, dates, quotations, diplomatic positions, historical events, URLs

If information cannot be verified, explicitly say: "Not verified from the available sources."

Distinguish:
- VERIFIED FACT
- ANALYSIS
- STRATEGIC INFERENCE
- MUN RECOMMENDATION

DOSSIER STRUCTURE

1. EXECUTIVE BRIEF
Explain: what the issue is, why it matters, what is happening now, why the committee should care

2. AGENDA DEEP DIVE
Cover: historical background, current situation, major causes, major consequences, important actors, major disputes, key terminology

3. COUNTRY POSITION
For ${country}: official position, relevant policies, historical involvement, treaties, relevant international commitments, government statements, voting record, relevant regional interests, economic/security/political interests, likely negotiating priorities

4. COUNTRY INTERESTS
Explain: WHAT DOES THIS COUNTRY WANT? WHAT DOES THIS COUNTRY NEED TO AVOID? WHAT WOULD BE POLITICALLY DIFFICULT FOR THIS COUNTRY TO SUPPORT?

5. INTERNATIONAL LANDSCAPE
Identify relevant: allies, likely allies, neutral states, opposing states, regional blocs, organizations
For major actors explain WHY their interests align or conflict.

6. UN / INTERNATIONAL FRAMEWORK
Identify relevant: UN Charter provisions, UN resolutions, treaties, conventions, international frameworks, relevant agencies
Explain their relevance rather than merely listing them.

7. CURRENT AFFAIRS
Identify important recent developments relevant to the agenda.
For each: WHAT HAPPENED? WHEN? WHY DOES IT MATTER? WHY DOES IT MATTER TO ${country}? SOURCE

8. KEY EVIDENCE
Provide useful verified: statistics, dates, examples, precedents, case studies
Each factual item should have a source where available.

9. DIPLOMATIC AMMUNITION
Provide factual material that can be used during debate: contradictions, inconsistent policies, implementation failures, treaty inconsistencies, voting contradictions, relevant historical positions
This must remain diplomatic and factual. Do NOT create personal attacks.

10. POI BANK
Generate POIs the delegate could ask. Categorize: Diplomatic, Aggressive, Trap, Contradiction, Technical, Implementation, Follow-up
Each should be based on actual researched information.

11. DEFENSE BANK
Predict attacks against ${country}. For each: EXPECTED ATTACK, WHY THEY MAY USE IT, BEST RESPONSE, FOLLOW-UP RESPONSE

12. POLICY OPTIONS
Provide realistic policy options for ${country}. For each: PROBLEM, PROPOSAL, IMPLEMENTATION, FUNDING, MONITORING, RESPONSIBLE ACTORS, POTENTIAL OBSTACLE, HOW TO ADDRESS THE OBSTACLE

13. RESOLUTION MATERIAL
Generate MUN-ready ideas for: preambulatory concepts, operative clauses, subclauses, implementation mechanisms, funding mechanisms, monitoring mechanisms, timelines, responsible organizations
Clearly label generated MUN language as GENERATED. Never present generated clauses as official UN text.

14. GSL MATERIAL
Extract: strongest opening hook, strongest country position, strongest evidence, strongest solution, strongest closing hook

15. KEY TAKEAWAYS
Give the delegate 10 things they absolutely need to know before committee.

16. SOURCE REGISTER
For every important source provide: TITLE, ORGANIZATION, DATE if available, SOURCE TIER, URL, WHAT IT SUPPORTS

RESEARCH → AI ASSISTANT

End the dossier with a structured section called "assistantContext".

This should contain the highest-value research context in a compact form that can be directly passed into the MUNOS AI Assistant.

Include:
COUNTRY POSITION, KEY FACTS, KEY ARGUMENTS, ALLIES, OPPOSITION, VULNERABILITIES, SOLUTIONS, POIs, DEFENSES, RELEVANT SOURCES

FINAL QUALITY CONTROL

Before returning the dossier:
- remove duplicate information
- remove unsupported claims
- check country-policy consistency
- check committee mandate
- distinguish facts from recommendations
- ensure sources correspond to claims
- prioritize primary sources
- identify uncertainty
- ensure the dossier is actually useful during MUN

The goal is not to produce an impressive-looking report.
The goal is to give a delegate reliable intelligence they can actually use in committee.`,
    });

    return { status: "success", data: result.object as ResearchDossier };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return { status: "error", message };
  }
}
