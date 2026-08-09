"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { isAiConfigured } from "@/lib/env";
import { getDb } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// ---------------------------------------------------------------------------
// MUN Scoring Schema
// ---------------------------------------------------------------------------

const MunScoreSchema = z.object({
  // Core scoring dimensions (0-100)
  speaking: z.number().min(0).max(100).describe("Quality of speeches delivered"),
  research: z.number().min(0).max(100).describe("Depth and accuracy of research"),
  diplomacy: z.number().min(0).max(100).describe("Diplomatic courtesy and foreign policy"),
  leadership: z.number().min(0).max(100).describe("Leadership in committee"),
  documentation: z.number().min(0).max(100).describe("Resolution and position paper quality"),
  collaboration: z.number().min(0).max(100).describe("Working with other delegates"),

  // Activity tracking
  speechCount: z.number().describe("Number of speeches delivered"),
  poiCount: z.number().describe("Number of POIs asked/answered"),
  substantiveCount: z.number().describe("Number of substantive comments"),
  motionCount: z.number().describe("Number of motions filed"),

  // Overall
  overall: z.number().min(0).max(100).describe("Weighted overall score"),
  rank: z.string().describe("Estimated ranking: Top 10%, Top 25%, Top 50%, Below Average"),

  // Specific feedback
  biggestOpportunity: z.string().describe("The delegate's biggest scoring opportunity"),
  strengths: z.array(z.string()).describe("Top 3 strengths"),
  improvements: z.array(z.string()).describe("Top 3 areas for improvement"),
  actionableAdvice: z.array(z.object({
    area: z.string(),
    advice: z.string(),
    impact: z.string().describe("Expected impact on score"),
  })).describe("Specific actionable advice"),
});

export type MunScore = z.infer<typeof MunScoreSchema>;

// ---------------------------------------------------------------------------
// Score a delegate's performance
// ---------------------------------------------------------------------------

export async function scoreDelegatePerformance(
  speeches: string[],
  pois: string[],
  substantives: string[],
  context: {
    country?: string;
    committee?: string;
    agenda?: string;
    conferenceName?: string;
  },
): Promise<{ status: "success"; data: MunScore } | { status: "error"; message: string }> {
  if (!isAiConfigured) {
    return { status: "error", message: "AI not configured." };
  }

  try {
    const result = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: MunScoreSchema,
      prompt: `You are an expert MUN scoring judge. Evaluate this delegate's performance.

CONTEXT:
Country: ${context.country || "Unknown"}
Committee: ${context.committee || "Unknown"}
Agenda: ${context.agenda || "Unknown"}
${context.conferenceName ? `Conference: ${context.conferenceName}` : ""}

SPEECHES DELIVERED:
${speeches.map((s, i) => `[Speech ${i + 1}]: ${s}`).join("\n\n") || "No speeches recorded"}

POIs ASKED/ANSWERED:
${pois.map((p, i) => `[POI ${i + 1}]: ${p}`).join("\n\n") || "No POIs recorded"}

SUBSTANTIVE COMMENTS:
${substantives.map((s, i) => `[Substantive ${i + 1}]: ${s}`).join("\n\n") || "No substantive comments recorded"}

Score each dimension 0-100. Be specific and honest. The delegate needs actionable feedback to improve their MUN score at actual conferences.`,
    });

    return { status: "success", data: result.object };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return { status: "error", message };
  }
}

// ---------------------------------------------------------------------------
// Get delegate's historical performance
// ---------------------------------------------------------------------------

export async function getDelegatePerformanceHistory(): Promise<{
  averageScores: Record<string, number>;
  totalSessions: number;
  trend: "improving" | "declining" | "stable";
  topStrength: string;
  topWeakness: string;
} | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const sessions = await getDb().videoCoachSession.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  if (sessions.length === 0) {
    return {
      averageScores: {},
      totalSessions: 0,
      trend: "stable",
      topStrength: "No data yet",
      topWeakness: "No data yet",
    };
  }

  const avg = (field: string) => {
    const values = sessions.map((s) => Number((s as Record<string, unknown>)[field]) || 0);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  const averageScores = {
    overall: avg("overall"),
    confidence: avg("confidence"),
    clarity: avg("clarity"),
    persuasion: avg("persuasion"),
    structure: avg("structure"),
  };

  // Determine trend
  const recent = sessions.slice(0, 5);
  const older = sessions.slice(5, 10);
  const recentAvg = recent.reduce((a, s) => a + s.overall, 0) / recent.length;
  const olderAvg = older.length > 0 ? older.reduce((a, s) => a + s.overall, 0) / older.length : recentAvg;
  const trend = recentAvg > olderAvg + 5 ? "improving" : recentAvg < olderAvg - 5 ? "declining" : "stable";

  // Find strengths and weaknesses
  const entries = Object.entries(averageScores).filter(([k]) => k !== "overall");
  const sorted = entries.sort((a, b) => b[1] - a[1]);

  return {
    averageScores,
    totalSessions: sessions.length,
    trend,
    topStrength: sorted[0]?.[0] || "N/A",
    topWeakness: sorted[sorted.length - 1]?.[0] || "N/A",
  };
}
