"use server";

import { isRestCountriesConfigured } from "@/lib/env";

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

export async function fetchRestCountryData(name: string): Promise<RestCountryData | null> {
  if (!isRestCountriesConfigured) return null;
  try {
    const res = await fetch(
      `https://api.restcountries.com/countries/v5/name/${encodeURIComponent(name)}?fields=name,capital,population,region,subregion,currencies,languages,flags,unMember,cca2`,
      { headers: { Authorization: `Bearer ${process.env.REST_COUNTRIES_API_KEY}` }, next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data[0] : null;
  } catch {
    return null;
  }
}
