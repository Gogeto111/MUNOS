"use server";

import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";
import { analyzeSpeech } from "@/lib/ai/video-coach";

export async function createVideoCoachSession(input: {
  title: string;
  transcript: string;
  durationSec?: number;
}): Promise<ActionState<{ sessionId: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    if (!input.title.trim()) return fail("Title is required.");
    if (!input.transcript.trim()) return fail("Transcript is required.");
    if (input.transcript.length > 8000) return fail("Transcript is too long (max 8000 characters).");

    const analysis = await analyzeSpeech({
      transcript: input.transcript,
      durationSec: input.durationSec,
    });

    const db = getDb();
    const session = await db.videoCoachSession.create({
      data: {
        userId: user.id,
        title: input.title.trim(),
        transcript: input.transcript.trim(),
        durationSec: input.durationSec ?? null,
        overall: analysis.overall,
        confidence: analysis.confidence,
        clarity: analysis.clarity,
        persuasion: analysis.persuasion,
        structure: analysis.structure,
        suggestions: analysis.suggestions,
        rawResult: JSON.parse(JSON.stringify(analysis)),
      },
    });

    return ok("Session created.", { sessionId: session.id });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to analyze speech.");
  }
}

export async function listVideoCoachSessions(): Promise<
  ActionState<
    Array<{
      id: string;
      title: string;
      overall: number;
      confidence: number;
      clarity: number;
      persuasion: number;
      structure: number;
      durationSec: number | null;
      createdAt: string;
    }>
  >
> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    const db = getDb();
    const sessions = await db.videoCoachSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        overall: true,
        confidence: true,
        clarity: true,
        persuasion: true,
        structure: true,
        durationSec: true,
        createdAt: true,
      },
    });

    return ok(
      "Loaded.",
      sessions.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load sessions.");
  }
}

export async function getVideoCoachSession(sessionId: string): Promise<
  ActionState<{
    id: string;
    title: string;
    transcript: string | null;
    durationSec: number | null;
    overall: number;
    confidence: number;
    clarity: number;
    persuasion: number;
    structure: number;
    suggestions: string[];
    createdAt: string;
  }>
> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    const db = getDb();
    const session = await db.videoCoachSession.findFirst({
      where: { id: sessionId, userId: user.id },
    });
    if (!session) return fail("Session not found.");

    return ok("Loaded.", {
      id: session.id,
      title: session.title,
      transcript: session.transcript,
      durationSec: session.durationSec,
      overall: session.overall,
      confidence: session.confidence,
      clarity: session.clarity,
      persuasion: session.persuasion,
      structure: session.structure,
      suggestions: session.suggestions,
      createdAt: session.createdAt.toISOString(),
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load session.");
  }
}
