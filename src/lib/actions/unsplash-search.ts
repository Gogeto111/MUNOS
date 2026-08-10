"use server";

import { searchConferencePhotos, getRandomConferencePhoto } from "@/lib/unsplash";

export async function searchPhotos(query: string) {
  return searchConferencePhotos(query, 6);
}

export async function getRandomPhoto(category?: string) {
  const queries: Record<string, string> = {
    committee: "united nations committee debate",
    conference: "model united nations conference",
    diplomacy: "diplomacy international relations",
    general: "united nations general assembly",
  };
  return getRandomConferencePhoto(queries[category || "general"]);
}
