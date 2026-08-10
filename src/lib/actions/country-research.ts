"use server";

import { generateObject } from "ai";
import { getBestObjectModel } from "@/lib/ai-model";
import { z } from "zod";
import { ok, toActionError, type ActionState } from "@/lib/actions";
import { env, isAiConfigured, isRestCountriesConfigured } from "@/lib/env";

const CountryProfileSchema = z.object({
  name: z.string().describe("Full country name"),
  flag: z.string().describe("Flag emoji for the country"),
  capital: z.string().describe("Capital city"),
  population: z.string().describe("Population as a readable string (e.g., '67.8 million')"),
  region: z.string().describe("UN region (e.g., Africa, Americas, Asia, Europe, Oceania)"),
  subRegion: z.string().describe("Sub-region (e.g., Western Africa, Southeast Asia)"),
  government: z.string().describe("Type of government"),
  leader: z.string().describe("Current head of state or government"),
  unMember: z.string().describe("Date of UN membership (e.g., '24 October 1945')"),
  economy: z.object({
    gdp: z.string().describe("GDP (nominal) estimate"),
    currency: z.string().describe("Currency name and code"),
    majorExports: z.array(z.string()).describe("Top 3-5 major exports"),
    tradeBloc: z.array(z.string()).describe("Key trade agreements or blocs"),
  }),
  foreignPolicy: z.object({
    overview: z.string().describe("One-paragraph foreign policy overview"),
    keyAlliances: z.array(z.string()).describe("Key alliances and partnerships"),
    unVoting: z.string().describe("General Assembly voting pattern summary"),
    nonAligned: z.boolean().describe("Whether the country is non-aligned"),
  }),
  keyIssues: z.array(z.string()).describe("3-5 key issues relevant to MUN debates"),
  recentDevelopments: z.array(z.string()).describe("2-3 recent notable developments"),
});

export type CountryProfile = z.infer<typeof CountryProfileSchema>;

export interface RestCountryData {
  name: { common: string; official: string };
  capital?: string[];
  population: number;
  region: string;
  subregion: string;
  currencies?: Record<string, { name: string; symbol: string }>;
  languages?: Record<string, string>;
  flags?: { png: string; svg: string; alt: string };
  unMember: boolean;
  cca2: string;
}

async function fetchRestCountryData(name: string): Promise<RestCountryData | null> {
  if (!isRestCountriesConfigured) return null;
  try {
    const res = await fetch(
      `https://api.restcountries.com/countries/v5/name/${encodeURIComponent(name)}?fields=name,capital,population,region,subregion,currencies,languages,flags,unMember,cca2`,
      { headers: { Authorization: `Bearer ${env.REST_COUNTRIES_API_KEY}` }, next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data[0] : null;
  } catch {
    return null;
  }
}

function formatPopulation(pop: number): string {
  if (pop >= 1_000_000_000) return `${(pop / 1_000_000_000).toFixed(1)} billion`;
  if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)} million`;
  if (pop >= 1_000) return `${(pop / 1_000).toFixed(1)} thousand`;
  return pop.toString();
}

function formatCurrency(currencies?: Record<string, { name: string; symbol: string }>): string {
  if (!currencies) return "Unknown";
  return Object.values(currencies)
    .map((c) => `${c.name} (${c.symbol})`)
    .join(", ");
}

function formatLanguages(languages?: Record<string, string>): string {
  if (!languages) return "Unknown";
  return Object.values(languages).join(", ");
}

function buildRestContext(data: RestCountryData): string {
  return `
REAL COUNTRY DATA FROM REST COUNTRIES API:
- Official name: ${data.name.official}
- Common name: ${data.name.common}
- Capital: ${data.capital?.join(", ") || "N/A"}
- Population: ${formatPopulation(data.population)}
- Region: ${data.region}
- Sub-region: ${data.subregion || "N/A"}
- Currency: ${formatCurrency(data.currencies)}
- Languages: ${formatLanguages(data.languages)}
- UN Member: ${data.unMember ? "Yes" : "No"}
- Country code: ${data.cca2}
- Flag image: ${data.flags?.png || "N/A"}

Use this data as the foundation for the profile. Generate the remaining fields (government, leader, economy details, foreign policy, key issues, recent developments) using your knowledge, but ensure the basic facts match the real data above.
`;
}

export async function generateCountryProfile(
  country: string,
): Promise<ActionState<CountryProfile>> {
  if (!isAiConfigured) {
    return {
      status: "error",
      message:
        "AI is not configured. Add GOOGLE_GENERATIVE_AI_API_KEY to your .env and restart the dev server.",
    };
  }

  try {
    const restData = await fetchRestCountryData(country);
    const restContext = restData ? buildRestContext(restData) : "";

    const result = await generateObject({
      model: getBestObjectModel(),
      schema: CountryProfileSchema,
      prompt: `You are an expert MUN diplomatic analyst. Generate a comprehensive country profile briefing for ${country}.

${restContext}

Provide accurate, factual information about:
1. Basic facts: capital, population, region, government type, current leader
2. UN membership date
3. Economy: GDP, currency, major exports, trade blocs
4. Foreign policy: overview, key alliances, UN voting pattern, non-alignment status
5. Key issues relevant to Model United Nations debates
6. Recent notable developments

Write in a concise, analytical briefing style. Be specific and factual. If the country is small or less well-known, provide whatever accurate information is available.`,
    });

    return ok("Country profile generated.", result.object);
  } catch (error) {
    return toActionError(error);
  }
}
