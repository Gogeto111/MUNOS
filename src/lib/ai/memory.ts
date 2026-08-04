import "server-only";
import { getDb } from "@/lib/prisma";
import { formatMemoryContext } from "@/lib/ai/prompts";

/**
 * Loads the workspace's coach-profile memory (debate style, strengths,
 * weaknesses, goals, ...) and renders it as a prompt block. Returns "" when
 * the profile is empty so callers can skip memory injection entirely.
 */
export async function buildMemoryContext(workspaceId: string): Promise<string> {
  try {
    const entries = await getDb().aiMemory.findMany({
      where: { workspaceId },
      select: { category: true, content: true },
      orderBy: { updatedAt: "desc" },
    });
    return formatMemoryContext(entries);
  } catch {
    return "";
  }
}
