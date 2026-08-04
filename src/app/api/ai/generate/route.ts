import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { env, isAiConfigured } from "@/lib/env";
import { isAuthConfigured } from "@/lib/public-env";
import { getDb } from "@/lib/prisma";
import {
  prepareCommitteeCall,
  preparePrepPackCall,
  type CommitteeAiFeature,
} from "@/lib/ai/prepare";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = { max: 20, windowMs: 60_000 }; // 20 requests per minute

const COMMITTEE_FEATURES: CommitteeAiFeature[] = [
  "research-brief",
  "position-paper",
  "resolution",
  "debate-strategy",
  "debate-reply",
];

const NOT_CONFIGURED_MESSAGE =
  "AI is not configured yet. Add GOOGLE_GENERATIVE_AI_API_KEY to your .env and restart the dev server.";

interface GenerateRequest {
  feature: CommitteeAiFeature | "prep-pack";
  workspaceId: string;
  committeeId?: string;
  focus?: string;
  speechContext?: string;
}

/**
 * Streaming AI generation endpoint used by the Copilot panel and the paper /
 * resolution editors. Authenticates the caller, verifies workspace ownership,
 * retrieves relevant research-library + corpus chunks, and streams the model
 * output as a plain-text SSE body.
 */
export async function POST(request: NextRequest) {
  if (!isAiConfigured) {
    return NextResponse.json({ error: NOT_CONFIGURED_MESSAGE }, { status: 503 });
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

  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON body." }, { status: 400 });
  }

  const workspaceId = String(body.workspaceId ?? "").trim();
  const feature = String(body.feature ?? "") as GenerateRequest["feature"];
  const isPrepPack = feature === "prep-pack";
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
  }
  if (!isPrepPack && !COMMITTEE_FEATURES.includes(feature as CommitteeAiFeature)) {
    return NextResponse.json({ error: "Unsupported feature." }, { status: 400 });
  }
  if (!isPrepPack && !String(body.committeeId ?? "").trim()) {
    return NextResponse.json({ error: "committeeId is required for this feature." }, { status: 400 });
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

  try {
    const call = isPrepPack
      ? await preparePrepPackCall(workspaceId)
      : await prepareCommitteeCall(feature as CommitteeAiFeature, workspaceId, body.committeeId ?? "", {
          focus: body.focus,
          speechContext: body.speechContext,
        });

    const result = streamText({
      model: google(env.AI_MODEL),
      system: call.system,
      prompt: call.prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    const status = message === "Committee not found." ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
