import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";

export async function updateSpeakerList(
  simulationId: string,
  speakers: Array<{ delegateId: string; order: number }>,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in required.");

  const db = getDb();
  const sim = await db.committeeSimulation.findFirst({
    where: { id: simulationId, userId: user.id },
  });
  if (!sim) return fail("Simulation not found.");

  await db.committeeSimulation.update({
    where: { id: simulationId },
    data: { speakersListJson: speakers as never },
  });

  return ok("Speaker list updated.");
}

export async function recordSpeakingTime(
  simulationId: string,
  delegateId: string,
  seconds: number,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in required.");

  const db = getDb();
  const sim = await db.committeeSimulation.findFirst({
    where: { id: simulationId, userId: user.id },
  });
  if (!sim) return fail("Simulation not found.");

  await db.committeeSimulation.update({
    where: { id: simulationId },
    data: { totalSpeakingTimeSec: { increment: seconds } },
  });

  await db.simulationDelegate.update({
    where: { id: delegateId },
    data: { speakingCount: { increment: 1 } },
  });

  return ok("Speaking time recorded.");
}

export async function scoreDelegate(
  simulationId: string,
  score: {
    delegateId: string;
    confidence: number;
    diplomacy: number;
    research: number;
    flow: number;
    overall: number;
  },
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in required.");

  const db = getDb();
  const sim = await db.committeeSimulation.findFirst({
    where: { id: simulationId, userId: user.id },
  });
  if (!sim) return fail("Simulation not found.");

  const existingScores = (sim.delegateScores ?? []) as Array<{
    delegateId: string;
    confidence: number;
    diplomacy: number;
    research: number;
    flow: number;
    overall: number;
  }>;

  const updatedScores = existingScores.filter(
    (s) => s.delegateId !== score.delegateId,
  );
  updatedScores.push(score);

  await db.committeeSimulation.update({
    where: { id: simulationId },
    data: { delegateScores: updatedScores as never },
  });

  return ok("Score recorded.");
}

export async function getSimulationScores(
  simulationId: string,
): Promise<
  ActionState<
    Array<{
      delegateId: string;
      confidence: number;
      diplomacy: number;
      research: number;
      flow: number;
      overall: number;
    }>
  >
> {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in required.");

  const db = getDb();
  const sim = await db.committeeSimulation.findFirst({
    where: { id: simulationId, userId: user.id },
    select: { delegateScores: true },
  });
  if (!sim) return fail("Simulation not found.");

  return ok("Loaded.", (sim.delegateScores ?? []) as never);
}
