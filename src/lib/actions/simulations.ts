"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";
import { generateObject } from "ai";
import { getBestObjectModel } from "@/lib/ai-model";

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

    const assistantContent = await generateAIResponse(
      content,
      simulation.country ?? "",
      simulation.topic ?? "",
    );
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

async function generateAIResponse(
  userMessage: string,
  country: string,
  topic: string,
): Promise<string> {
  const responseSchema = z.object({
    response: z.string().describe("The AI delegate's speech response"),
  });

  const prompt =
    `You are simulating an MUN delegate from ${country} in a committee session about "${topic}". ` +
    `The user (also a delegate) just said: "${userMessage.trim().slice(0, 2000)}"\n\n` +
    `Respond as a realistic MUN delegate from ${country}. Be specific about your country's position, ` +
    `use diplomatic language, reference relevant UN frameworks, and engage with what was said. ` +
    `Keep your response between 100-300 words. Do NOT break character.`;

  try {
    const { object } = await generateObject({
      model: getBestObjectModel(),
      schema: responseSchema,
      prompt,
    });
    return object.response;
  } catch {
    return `The delegate of ${country} acknowledges the previous statement on "${topic}" and would like to emphasize the importance of multilateral cooperation in addressing this issue. We believe that all member states must work together within the framework of the United Nations to find sustainable solutions.`;
  }
}
