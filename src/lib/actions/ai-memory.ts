"use server";

import { getDb } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export interface MemoryEntry {
  category: string;
  key: string;
  value: string;
  confidence: number;
}

// Get all personal memories for the current user
export async function getPersonalMemories(): Promise<MemoryEntry[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const memories = await getDb().userAiMemory.findMany({
    where: { userId: user.id },
    orderBy: { confidence: "desc" },
  });

  return memories.map((m) => ({
    category: m.category,
    key: m.key,
    value: m.value,
    confidence: m.confidence,
  }));
}

// Get memories by category
export async function getMemoriesByCategory(category: string): Promise<MemoryEntry[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const memories = await getDb().userAiMemory.findMany({
    where: { userId: user.id, category },
    orderBy: { confidence: "desc" },
  });

  return memories.map((m) => ({
    category: m.category,
    key: m.key,
    value: m.value,
    confidence: m.confidence,
  }));
}

// Upsert a memory
export async function upsertMemory(
  category: string,
  key: string,
  value: string,
  confidence: number = 0.5,
): Promise<{ status: "success" | "error"; message?: string }> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Not authenticated" };

  try {
    await getDb().userAiMemory.upsert({
      where: {
        userId_category_key: {
          userId: user.id,
          category,
          key,
        },
      },
      update: { value, confidence },
      create: { userId: user.id, category, key, value, confidence },
    });

    return { status: "success" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save memory";
    return { status: "error", message };
  }
}

// Delete a memory
export async function deleteMemory(
  category: string,
  key: string,
): Promise<{ status: "success" | "error"; message?: string }> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Not authenticated" };

  try {
    await getDb().userAiMemory.deleteMany({
      where: { userId: user.id, category, key },
    });

    return { status: "success" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete memory";
    return { status: "error", message };
  }
}

// Get a formatted memory context string for AI prompts
export async function getMemoryContextString(): Promise<string> {
  const memories = await getPersonalMemories();
  if (memories.length === 0) return "";

  const grouped: Record<string, MemoryEntry[]> = {};
  for (const m of memories) {
    if (!grouped[m.category]) grouped[m.category] = [];
    grouped[m.category].push(m);
  }

  let context = "\n\nDELEGATE PROFILE (from past interactions):\n";
  for (const [category, entries] of Object.entries(grouped)) {
    context += `\n${category.toUpperCase()}:\n`;
    for (const e of entries) {
      context += `- ${e.key}: ${e.value} (confidence: ${Math.round(e.confidence * 100)}%)\n`;
    }
  }

  return context;
}
