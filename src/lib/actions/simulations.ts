"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";

const SimulationInputSchema = z.object({
  conferenceId: z.string().min(1),
  committeeId: z.string().min(1),
  topic: z.string().min(1).max(200),
  country: z.string().min(2).max(100),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
});

export type SimulationInput = z.infer<typeof SimulationInputSchema>;

export async function startSimulation(input: SimulationInput): Promise<ActionState<{ id: string }>> {
  try {
    const parsed = SimulationInputSchema.safeParse(input);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input.");

    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    const db = getDb();

    const conference = await db.conference.findFirst({ where: { id: parsed.data.conferenceId } });
    if (!conference) return fail("Conference not found.");

    const simulation = await db.committeeSimulation.create({
      data: {
        userId: user.id,
        committeeName: `${parsed.data.topic} — ${parsed.data.country}`,
        topic: parsed.data.topic,
        country: parsed.data.country,
        userRole: "DELEGATE",
        status: "SETUP",
      },
    });

    return ok("Simulation started.", { id: simulation.id });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to start simulation.");
  }
}

export async function sendMessage(
  simulationId: string,
  content: string,
): Promise<ActionState<{ role: string; content: string; score: number }>> {
  try {
    if (!content.trim()) return fail("Message cannot be empty.");

    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    const db = getDb();

    const simulation = await db.committeeSimulation.findFirst({ where: { id: simulationId } });
    if (!simulation) return fail("Simulation not found.");
    if (simulation.userId !== user.id) return fail("Not your simulation.");
    if (simulation.status !== "RUNNING") return fail("Simulation is not active.");

    const assistantContent = generateMockResponse(content, simulation.country ?? "", simulation.topic ?? "", "intermediate");
    const newScore = Math.min(100, simulation.totalSpeechCount + 1);

    await db.committeeSimulation.update({
      where: { id: simulationId },
      data: { totalSpeechCount: { increment: 1 } },
    });

    return ok("Sent.", { role: "assistant", content: assistantContent, score: newScore });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to send message.");
  }
}

export async function getSimulation(
  simulationId: string,
): Promise<ActionState<{ score: number; status: string; topic: string; country: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    const db = getDb();

    const simulation = await db.committeeSimulation.findFirst({ where: { id: simulationId } });
    if (!simulation) return fail("Simulation not found.");
    if (simulation.userId !== user.id) return fail("Not your simulation.");

    return ok("Loaded.", {
      score: simulation.totalSpeechCount,
      status: simulation.status,
      topic: simulation.topic ?? "",
      country: simulation.country ?? "",
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load simulation.");
  }
}

function generateMockResponse(
  userMessage: string,
  country: string,
  topic: string,
  difficulty: string,
): string {
  const responses: Record<string, string[]> = {
    beginner: [
      `Thank you for that statement. As the delegate of ${country}, we believe that cooperation is essential for addressing ${topic}.`,
      `The delegate of ${country} would like to respond to the previous point. We think further discussion is needed on this matter.`,
      `As ${country}, we support the general consensus on ${topic} but urge the committee to consider all perspectives.`,
    ],
    intermediate: [
      `The delegation of ${country} recognizes the complexity of ${topic}. We propose that the committee establish a working group to address the specific challenges raised.`,
      `Building on the previous statement, ${country} would like to emphasize that multilateral cooperation is the only viable path forward for ${topic}.`,
      `${country} strongly advocates for a resolution that balances national sovereignty with collective action on ${topic}.`,
    ],
    advanced: [
      `The distinguished delegation of ${country} would like to address the procedural point raised. Under Rule 38, we believe the committee should consider amendments to the draft resolution before proceeding to a vote on ${topic}.`,
      `${country}'s position on ${topic} is grounded in Article 2(4) of the UN Charter. We propose an amendment that establishes a monitoring framework with quarterly reviews.`,
      `The delegate of ${country} motions for a moderated caucus under the topic ${topic}. We believe this is essential before the committee proceeds to voting procedure.`,
    ],
  };

  const pool = responses[difficulty] ?? responses.intermediate;
  return pool[Math.floor(Math.random() * pool.length)]!;
}
