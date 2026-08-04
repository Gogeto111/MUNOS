import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";

export async function startSimulation(simulationId: string): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return fail("You must be signed in.");

  const db = getDb();
  const sim = await db.committeeSimulation.findFirst({
    where: { id: simulationId, userId: user.id },
    include: { delegates: true },
  });
  if (!sim) return fail("Simulation not found.");

  if (sim.delegates.length < 2) return fail("Add at least one AI delegate.");

  await db.committeeSimulation.update({
    where: { id: simulationId },
    data: { status: "RUNNING", startedAt: new Date() },
  });

  const chair = sim.delegates.find((d) => d.isChair);
  if (!chair && sim.delegates.length > 0) {
    await db.simulationDelegate.update({
      where: { id: sim.delegates[0].id },
      data: { isChair: true },
    });
  }

  return ok("Simulation started.");
}

export async function pauseSimulation(simulationId: string): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return fail("You must be signed in.");

  const db = getDb();
  const sim = await db.committeeSimulation.findFirst({
    where: { id: simulationId, userId: user.id },
  });
  if (!sim) return fail("Simulation not found.");

  if (sim.status !== "RUNNING") return fail("Simulation is not running.");

  await db.committeeSimulation.update({
    where: { id: simulationId },
    data: { status: "PAUSED" },
  });

  return ok("Simulation paused.");
}

export async function finishSimulation(simulationId: string): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return fail("You must be signed in.");

  const db = getDb();
  const sim = await db.committeeSimulation.findFirst({
    where: { id: simulationId, userId: user.id },
  });
  if (!sim) return fail("Simulation not found.");

  await db.committeeSimulation.update({
    where: { id: simulationId },
    data: { status: "FINISHED", endedAt: new Date() },
  });

  return ok("Simulation finished.");
}
