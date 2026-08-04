import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";

export async function voteOnMotion(
  simulationId: string,
  vote: {
    delegateId: string;
    motionType: string;
    choice: string;
  },
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in required.");

  const db = getDb();
  const sim = await db.committeeSimulation.findFirst({
    where: { id: simulationId, userId: user.id },
    include: { delegates: true },
  });
  if (!sim) return fail("Simulation not found.");

  await db.simulationEvent.create({
    data: {
      simulationId,
      delegateId: vote.delegateId,
      type: "VOTE" as never,
      content: `${vote.choice} vote on ${vote.motionType} motion.`,
      metadata: { motionType: vote.motionType, choice: vote.choice },
    } as never,
  });

  await db.committeeSimulation.update({
    where: { id: simulationId },
    data: { totalMotionCount: { increment: 1 } },
  });

  return ok("Vote recorded.");
}

export async function awardDelegate(
  simulationId: string,
  award: {
    delegateId: string;
    award: string;
  },
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in required.");

  const db = getDb();
  const sim = await db.committeeSimulation.findFirst({
    where: { id: simulationId, userId: user.id },
    include: { delegates: true },
  });
  if (!sim) return fail("Simulation not found.");

  const delegate = sim.delegates.find((d) => d.id === award.delegateId);
  if (!delegate) return fail("Delegate not found.");

  await db.simulationDelegate.update({
    where: { id: award.delegateId },
    data: { award: award.award as never },
  });

  await db.simulationEvent.create({
    data: {
      simulationId,
      delegateId: award.delegateId,
      type: "AWARD" as never,
      content: `${delegate.displayName} awarded ${award.award}.`,
      metadata: { award: award.award },
    } as never,
  });

  return ok("Award recorded.");
}
