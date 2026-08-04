import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { isAiConfigured } from "@/lib/env";
import { buildSimulationPrompt } from "@/lib/ai/simulation-prompts";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

const RATE_LIMIT = { max: 15, windowMs: 60_000 }; // 15 requests per minute

export async function POST(req: NextRequest) {
  if (!isAiConfigured) {
    return NextResponse.json(
      { error: "AI is not configured. Add GOOGLE_GENERATIVE_AI_API_KEY to .env." },
      { status: 400 },
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");
  const key = rateLimitKey(user.id, ip);
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

  const body = await req.json();
  const { simulationId, action, context } = body as {
    simulationId: string;
    action: string;
    context?: Record<string, unknown>;
  };

  const db = getDb();
  const sim = await db.committeeSimulation.findFirst({
    where: { id: simulationId, userId: user.id },
    include: { delegates: true, events: { orderBy: { createdAt: "desc" }, take: 20 } },
  });

  if (!sim) {
    return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
  }

  const prompt = buildSimulationPrompt(
    {
      committeeName: sim.committeeName,
      topic: sim.topic,
      country: sim.country,
      userRole: sim.userRole,
      status: sim.status,
      delegates: sim.delegates.map((d) => ({
        id: d.id,
        country: d.country,
        displayName: d.displayName,
        isAi: d.isAi,
        isChair: d.isChair,
        policyStance: d.policyStance ?? null,
        speakingStyle: d.speakingStyle ?? null,
      })),
      events: sim.events.map((e) => ({
        id: e.id,
        type: e.type as never,
        content: e.content,
        delegateId: e.delegateId,
        createdAt: e.createdAt,
      })),
    },
    action,
    context ?? {},
  );

  const result = await generateText({
    model: google(process.env.AI_MODEL ?? "gemini-2.5-flash"),
    prompt,
    temperature: 0.8,
  });

  return NextResponse.json({ text: result.text });
}