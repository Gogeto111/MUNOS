import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/prisma";
import { isAuthConfigured } from "@/lib/public-env";
import { isAiConfigured } from "@/lib/env";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import {
  syncLiveUnSources,
  syncOfficialSources,
  type SyncResult,
} from "@/lib/actions/ai-sources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = { max: 10, windowMs: 60_000 };

const NOT_CONFIGURED_MESSAGE =
  "AI is not configured yet. Add GOOGLE_GENERATIVE_AI_API_KEY to your .env and restart the dev server.";

/**
 * Runs the official-source crawler and/or the live UN feed sync for a
 * workspace. Returns per-source/per-feed results. Intended for on-demand
 * refresh from the Copilot panel and for the built-in scheduled job.
 */
export async function POST(request: NextRequest) {
  if (!isAiConfigured) {
    return NextResponse.json({ error: NOT_CONFIGURED_MESSAGE }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  const key = rateLimitKey("sync", ip);
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

  let body: { workspaceId?: unknown; kind?: unknown; limitPerSource?: unknown; limitPerFeed?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON body." }, { status: 400 });
  }

  const workspaceId = String(body.workspaceId ?? "").trim();
  const kind = String(body.kind ?? "both");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
  }
  if (!["official", "live", "both"].includes(kind)) {
    return NextResponse.json({ error: "kind must be 'official', 'live' or 'both'." }, { status: 400 });
  }

  if (isAuthConfigured) {
    const { userId } = await auth();
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

  try {
    const results: SyncResult[] = [];
    if (kind === "official" || kind === "both") {
      const official = await syncOfficialSources(workspaceId, {
        limitPerSource: Number(body.limitPerSource) || 3,
      });
      if (official.status === "success") results.push(...official.data?.results ?? []);
      else if (official.status === "error") throw new Error(official.message);
    }
    if (kind === "live" || kind === "both") {
      const live = await syncLiveUnSources(workspaceId, {
        limitPerFeed: Number(body.limitPerFeed) || 5,
      });
      if (live.status === "success") results.push(...live.data?.results ?? []);
      else if (live.status === "error") throw new Error(live.message);
    }
    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
