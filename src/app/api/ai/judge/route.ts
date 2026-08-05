import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/prisma";
import { isAuthConfigured } from "@/lib/public-env";
import { judgeSpeech } from "@/lib/ai/judge";
import { normalizeScore } from "@/lib/ai/judge-parse";
import type { Prisma } from "@/generated/prisma/client";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { trackAiUsage } from "@/lib/ai-usage";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = { max: 10, windowMs: 60_000 }; // 10 requests per minute

const MAX_TRANSCRIPT = 6_000;

/**
 * Non-streaming AI judge endpoint. Accepts a debate transcript (+ optional
 * duration), verifies workspace ownership, scores it, persists it to the
 * workspace's score history, and returns the structured score.
 */
export async function POST(request: NextRequest) {
  let body: { workspaceId?: unknown; transcript?: unknown; durationSec?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON body." }, { status: 400 });
  }

  // Rate limiting
  let userId: string | null = null;
  if (isAuthConfigured) {
    const authResult = await auth();
    userId = authResult.userId;
  }
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  const key = rateLimitKey(userId, ip);
  const rl = checkRateLimit(key, RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT.max),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
        },
      },
    );
  }

  const workspaceId = String(body.workspaceId ?? "").trim();
  const transcript = String(body.transcript ?? "").trim();
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
  }
  if (!transcript) {
    return NextResponse.json({ error: "Nothing to score — record a speech first." }, { status: 400 });
  }

  if (isAuthConfigured) {
    if (!userId) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }
    const owner = await getDb().user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });
    const workspace = owner
      ? await getDb().workspace.findFirst({
          where: { id: workspaceId, userId: owner.id },
          select: { id: true },
        })
      : null;
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 403 });
    }
  }

  const durationSec =
    typeof body.durationSec === "number" && Number.isFinite(body.durationSec)
      ? Math.max(0, body.durationSec)
      : undefined;

  try {
    const score = normalizeScore(
      await judgeSpeech({ transcript: transcript.slice(0, MAX_TRANSCRIPT), durationSec }),
    );

    await getDb().aiScore.create({
      data: {
        workspaceId,
        feature: "debate",
        transcript: transcript.slice(0, MAX_TRANSCRIPT),
        durationSec: durationSec ?? null,
        result: score as unknown as Prisma.InputJsonValue,
      },
    });

    // Track usage
    if (userId) {
      trackAiUsage(userId, "judge", 0); // Token count not available from generateObject
    }

    return NextResponse.json({ score });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    logger.error("[ai/judge] Error", { message, workspaceId });
    // Graceful fallback — return a basic score instead of crashing
    if (message.includes("API key") || message.includes("quota") || message.includes("rate")) {
      return NextResponse.json(
        {
          error: "AI judge is temporarily unavailable. Please try again later.",
          degraded: true,
          fallback: {
            confidence: 50,
            diplomacy: 50,
            research: 50,
            flow: 50,
            overall: 50,
            suggestions: ["AI judge is temporarily unavailable. Score is estimated."],
          },
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
