"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { ok, fail, toActionError, type ActionState } from "@/lib/actions";
import { isAiConfigured } from "@/lib/env";

const DebateSummarySchema = z.object({
  overview: z.string().describe("2-3 paragraph overview of the debate session"),
  keyMoments: z
    .array(
      z.object({
        description: z.string(),
        delegate: z.string().optional(),
        timestamp: z.string().optional(),
      }),
    )
    .describe("Notable turning points or memorable moments"),
  notableArguments: z
    .array(
      z.object({
        delegate: z.string(),
        country: z.string(),
        argument: z.string(),
      }),
    )
    .describe("Strongest arguments made during the debate"),
  winnerAnalysis: z.object({
    bestDelegate: z.string(),
    reasoning: z.string(),
    runnersUp: z.array(z.string()),
  }),
  improvementSuggestions: z
    .array(z.string())
    .describe("3-5 concrete suggestions for improvement"),
});

export type DebateSummary = z.infer<typeof DebateSummarySchema>;

export async function generateDebateSummary(
  simulationId: string,
): Promise<ActionState<DebateSummary>> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    if (!isAiConfigured) {
      return fail(
        "AI is not configured. Add GOOGLE_GENERATIVE_AI_API_KEY to your .env and restart the dev server.",
      );
    }

    const db = getDb();
    const sim = await db.committeeSimulation.findFirst({
      where: { id: simulationId, userId: user.id },
      include: {
        delegates: true,
        events: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!sim) return fail("Simulation not found.");

    const eventsSummary = sim.events
      .map((event) => {
        const delegate = sim.delegates.find((d) => d.id === event.delegateId);
        const name = delegate?.displayName ?? "Unknown";
        const country = delegate?.country ?? "";
        return `[${event.type}] ${name} (${country}): ${event.content.slice(0, 300)}`;
      })
      .join("\n");

    const prompt =
      `You are an expert MUN chair summarizing a committee session.\n\n` +
      `Committee: ${sim.committeeName}\n` +
      `Topic: ${sim.topic ?? "General Debate"}\n` +
      `Delegates: ${sim.delegates.map((d) => `${d.displayName} (${d.country})`).join(", ")}\n` +
      `Total speeches: ${sim.totalSpeechCount}\n` +
      `Total POIs: ${sim.totalPoiCount}\n` +
      `Total motions: ${sim.totalMotionCount}\n\n` +
      `Event log:\n${eventsSummary || "(no events recorded)"}`;

    const result = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: DebateSummarySchema,
      prompt,
    });

    return ok("Debate summary generated.", result.object);
  } catch (error) {
    return toActionError(error);
  }
}
