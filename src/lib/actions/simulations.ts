import type { Prisma } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";

export async function getMySimulations(): Promise<
  ActionState<
    Array<{
      id: string;
      committeeName: string;
      topic: string | null;
      status: string;
      startedAt: string | null;
      endedAt: string | null;
    }>
  >
> {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in required.");

  const db = getDb();
  const list = await db.committeeSimulation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      committeeName: true,
      topic: true,
      status: true,
      startedAt: true,
      endedAt: true,
    },
  });

  return ok("Loaded.", list as unknown as Array<{ id: string; committeeName: string; topic: string | null; status: string; startedAt: string | null; endedAt: string | null }>);
}

export async function getSimulation(id: string): Promise<
  ActionState<{
    id: string;
    committeeName: string;
    topic: string | null;
    country: string | null;
    status: string;
    delegates: Array<{
      id: string;
      country: string;
      displayName: string;
      isAi: boolean;
      isChair: boolean;
    }>;
    events: Array<{
      id: string;
      type: string;
      content: string;
      delegateCountry: string | null;
      createdAt: string;
    }>;
  }>
> {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in required.");

  const db = getDb();
  const sim = await db.committeeSimulation.findFirst({
    where: { id, userId: user.id },
    include: {
      delegates: { orderBy: { createdAt: "asc" } },
      events: {
        orderBy: { createdAt: "asc" },
        take: 200,
        include: { delegate: true },
      },
    },
  });
  if (!sim) return fail("Simulation not found.");

  return ok("Loaded.", {
    id: sim.id,
    committeeName: sim.committeeName,
    topic: sim.topic,
    country: sim.country,
    status: sim.status,
    delegates: sim.delegates.map((d) => ({
      id: d.id,
      country: d.country,
      displayName: d.displayName,
      isAi: d.isAi,
      isChair: d.isChair,
    })),
    events: sim.events.map((ev) => ({
      id: ev.id,
      type: ev.type,
      content: ev.content,
      delegateCountry: ev.delegate?.country ?? null,
      createdAt: ev.createdAt.toISOString(),
    })),
  });
}

export async function addSimulationEvent(
  simulationId: string,
  event: {
    delegateId?: string;
    type: string;
    content: string;
    metadata?: Record<string, unknown>;
  },
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in required.");

  const db = getDb();
  const sim = await db.committeeSimulation.findFirst({
    where: { id: simulationId, userId: user.id },
  });
  if (!sim) return fail("Simulation not found.");

  await db.simulationEvent.create({
    data: {
      simulationId,
      delegateId: event.delegateId,
      type: event.type as never,
      content: event.content,
      metadata: (event.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });

  if (event.type === "SPEECH") {
    await db.committeeSimulation.update({
      where: { id: simulationId },
      data: { totalSpeechCount: { increment: 1 } },
    });
  }
  if (event.type === "POI_ASKED" || event.type === "POI_ANSWERED") {
    await db.committeeSimulation.update({
      where: { id: simulationId },
      data: { totalPoiCount: { increment: 1 } },
    });
  }

  return ok("Event added.");
}
