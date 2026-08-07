"use server";

import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";

export async function generateAISpeech(
  simulationId: string,
  delegateId: string,
): Promise<ActionState<{ speech: string; speakingTimeSec: number }>> {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in required.");

  const db = getDb();
  const sim = await db.committeeSimulation.findFirst({
    where: { id: simulationId, userId: user.id },
    include: { delegates: true, events: true },
  });
  if (!sim) return fail("Simulation not found.");

  const delegate = sim.delegates.find((d) => d.id === delegateId);
  if (!delegate) return fail("Delegate not found.");

  const prompt = `You are ${delegate.displayName} from ${delegate.country} in a ${sim.committeeName} committee session. Topic: ${sim.topic ?? "General Debate"}. Your policy stance: ${delegate.policyStance ?? "National interest"}. Deliver a 60-second opening speech (under 200 words) in formal UN diplomatic language. Be concise and assertive.`;

  let speech = "";
  let speakingTimeSec = 45;

  try {
    const { generateText } = await import("ai");
    const { google } = await import("@ai-sdk/google");
    const result = await generateText({
      model: google(process.env.AI_MODEL ?? "gemini-2.5-flash"),
      prompt,
      temperature: 0.7,
    });
    speech = result.text;
    speakingTimeSec = Math.max(15, Math.min(90, Math.round(speech.length / 3)));
  } catch {
    speech = `${delegate.displayName} delivers a statement on the topic. The delegation emphasizes the importance of international cooperation and calls for constructive dialogue among all member states.`;
    speakingTimeSec = 30;
  }

  await db.simulationEvent.create({
    data: {
      simulationId,
      delegateId,
      type: "SPEECH" as never,
      content: speech,
      metadata: { speakingTimeSec },
    } as never,
  });

  await db.simulationDelegate.update({
    where: { id: delegateId },
    data: { speakingCount: { increment: 1 } },
  });

  await db.committeeSimulation.update({
    where: { id: simulationId },
    data: { totalSpeechCount: { increment: 1 } },
  });

  return ok("Speech generated.", { speech, speakingTimeSec });
}