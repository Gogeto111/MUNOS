"use server";

import { getDb } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, toActionError, type ActionState } from "@/lib/actions";
import type { AiScoreResult } from "@/lib/ai/judge-parse";

interface SpeechRecord {
  id: string;
  createdAt: Date;
  feature: string;
  transcript: string | null;
  durationSec: number | null;
  result: AiScoreResult;
}

interface SpeechStats {
  totalSpeeches: number;
  avgScore: number;
  bestScore: number;
  avgConfidence: number;
  avgDiplomacy: number;
  avgResearch: number;
  avgFlow: number;
}

function normalizeStoredScore(raw: unknown): AiScoreResult {
  const obj =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const suggestions = Array.isArray(obj.suggestions)
    ? obj.suggestions.map((item) => String(item))
    : [];
  return {
    overall: Number(obj.overall ?? 0),
    confidence: Number(obj.confidence ?? 0),
    diplomacy: Number(obj.diplomacy ?? 0),
    research: Number(obj.research ?? 0),
    flow: Number(obj.flow ?? 0),
    speakingTimeSec: Number(obj.speakingTimeSec ?? 0),
    logicalFallacies: Number(obj.logicalFallacies ?? 0),
    suggestions,
  };
}

export async function getSpeechHistory(): Promise<
  ActionState<{ speeches: SpeechRecord[] }>
> {
  try {
    const user = await requireUser();

    const scores = await getDb().aiScore.findMany({
      where: { workspace: { userId: user.id } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        feature: true,
        transcript: true,
        durationSec: true,
        result: true,
      },
    });

    return ok("Speech history loaded.", {
      speeches: scores.map((score) => ({
        id: score.id,
        createdAt: score.createdAt,
        feature: score.feature,
        transcript: score.transcript,
        durationSec: score.durationSec,
        result: normalizeStoredScore(score.result),
      })),
    });
  } catch (error) {
    return toActionError(error);
  }
}

export async function getSpeechStats(): Promise<ActionState<SpeechStats>> {
  try {
    const user = await requireUser();

    const scores = await getDb().aiScore.findMany({
      where: { workspace: { userId: user.id } },
      select: { result: true },
    });

    if (scores.length === 0) {
      return ok("No speeches yet.", {
        totalSpeeches: 0,
        avgScore: 0,
        bestScore: 0,
        avgConfidence: 0,
        avgDiplomacy: 0,
        avgResearch: 0,
        avgFlow: 0,
      });
    }

    const parsed = scores.map((s) => normalizeStoredScore(s.result));
    const total = parsed.length;

    return ok("Stats loaded.", {
      totalSpeeches: total,
      avgScore: Math.round(parsed.reduce((sum, s) => sum + s.overall, 0) / total),
      bestScore: Math.max(...parsed.map((s) => s.overall)),
      avgConfidence: Number(
        (parsed.reduce((sum, s) => sum + s.confidence, 0) / total).toFixed(1),
      ),
      avgDiplomacy: Number(
        (parsed.reduce((sum, s) => sum + s.diplomacy, 0) / total).toFixed(1),
      ),
      avgResearch: Number(
        (parsed.reduce((sum, s) => sum + s.research, 0) / total).toFixed(1),
      ),
      avgFlow: Number(
        (parsed.reduce((sum, s) => sum + s.flow, 0) / total).toFixed(1),
      ),
    });
  } catch (error) {
    return toActionError(error);
  }
}
