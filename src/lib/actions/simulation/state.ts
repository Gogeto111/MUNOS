"use server";

import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";

export type SimulationState = {
  id: string;
  committeeName: string;
  topic: string | null;
  country: string | null;
  userRole: string;
  status: string;
  speakingTimeLimitSec: number;
  totalSpeechCount: number;
  totalPoiCount: number;
  totalMotionCount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delegateScores: any;
  delegates: Array<{
    id: string;
    country: string;
    countryFlag: string | null;
    displayName: string;
    isAi: boolean;
    isChair: boolean;
    policyStance: string | null;
    speakingStyle: string | null;
    speakingCount: number;
    poiCount: number;
    motionCount: number;
    award: string | null;
  }>;
  events: Array<{
    id: string;
    type: string;
    content: string;
    delegateId: string | null;
    speakingTimeSec: number | null;
    createdAt: Date;
  }>;
};

export async function getSimulationState(
  simulationId: string,
): Promise<ActionState<SimulationState>> {
  const user = await getCurrentUser();
  if (!user) return fail("You must be signed in.");

  const db = getDb();
  const sim = await db.committeeSimulation.findFirst({
    where: { id: simulationId, userId: user.id },
    include: {
      delegates: true,
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!sim) return fail("Simulation not found.");

  const state: SimulationState = {
    id: sim.id,
    committeeName: sim.committeeName,
    topic: sim.topic,
    country: sim.country,
    userRole: sim.userRole,
    status: sim.status,
    speakingTimeLimitSec: sim.speakingTimeLimitSec,
    totalSpeechCount: sim.totalSpeechCount,
    totalPoiCount: sim.totalPoiCount,
    totalMotionCount: sim.totalMotionCount,
    delegateScores: sim.delegateScores as SimulationState["delegateScores"],
    delegates: sim.delegates.map((d) => ({
      id: d.id,
      country: d.country,
      countryFlag: d.countryFlag,
      displayName: d.displayName,
      isAi: d.isAi,
      isChair: d.isChair,
      policyStance: d.policyStance,
      speakingStyle: d.speakingStyle,
      speakingCount: d.speakingCount,
      poiCount: d.poiCount,
      motionCount: d.motionCount,
      award: d.award,
    })),
    events: sim.events.map((e) => ({
      id: e.id,
      type: e.type,
      content: e.content,
      delegateId: e.delegateId,
      speakingTimeSec: e.speakingTimeSec,
      createdAt: e.createdAt,
    })),
  };

  return ok("Loaded.", state);
}

export async function respondToPOI(
  simulationId: string,
  targetDelegateId: string,
  question: string,
): Promise<ActionState<{ response: string; speakingTimeSec: number }>> {
  const user = await getCurrentUser();
  if (!user) return fail("You must be signed in.");

  const db = getDb();
  const sim = await db.committeeSimulation.findFirst({
    where: { id: simulationId, userId: user.id },
    include: { delegates: true, events: { orderBy: { createdAt: "desc" }, take: 10 } },
  });
  if (!sim) return fail("Simulation not found.");

  const target = sim.delegates.find((d) => d.id === targetDelegateId);
  if (!target) return fail("Delegate not found.");

  const recentEvents = sim.events
    .slice(0, 10)
    .map((e) => `[${e.type}] ${e.content}`)
    .join("\n");

  const prompt = `You are ${target.displayName} from ${target.country} in a Model UN committee session.
Committee: ${sim.committeeName}
Topic: ${sim.topic ?? "General Debate"}
Your policy stance: ${target.policyStance ?? "National interest"}

Recent committee events:
${recentEvents}

A delegate has raised a Point of Information directed at you. Their question:
"${question}"

Respond in character as the delegate for ${target.country}. Keep your response concise (under 80 words), diplomatic, and in-character. Use formal UN language.`;

  let response = "";
  let speakingTimeSec = 20;

  try {
    const { generateText } = await import("ai");
    const { google } = await import("@ai-sdk/google");
    const result = await generateText({
      model: google(process.env.AI_MODEL ?? "gemini-2.5-flash"),
      prompt,
      temperature: 0.7,
    });
    response = result.text;
    speakingTimeSec = Math.max(10, Math.min(30, Math.round(response.length / 3)));
  } catch {
    response = `${target.displayName} responds: "We appreciate the question. Our position on this matter is guided by our commitment to multilateral cooperation and national interest."`;
    speakingTimeSec = 15;
  }

  await db.simulationEvent.create({
    data: {
      simulationId,
      delegateId: targetDelegateId,
      type: "POI_ANSWERED" as never,
      content: response,
      metadata: { question },
      speakingTimeSec,
    } as never,
  });

  await db.simulationDelegate.update({
    where: { id: targetDelegateId },
    data: { poiCount: { increment: 1 } },
  });

  await db.committeeSimulation.update({
    where: { id: simulationId },
    data: { totalPoiCount: { increment: 1 } },
  });

  return ok("POI response generated.", { response, speakingTimeSec });
}

export async function addChairAnnouncement(
  simulationId: string,
  content: string,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return fail("You must be signed in.");

  const db = getDb();
  const sim = await db.committeeSimulation.findFirst({
    where: { id: simulationId, userId: user.id },
  });
  if (!sim) return fail("Simulation not found.");

  const chair = await db.simulationDelegate.findFirst({
    where: { simulationId, isChair: true },
  });

  await db.simulationEvent.create({
    data: {
      simulationId,
      delegateId: chair?.id ?? null,
      type: "CHAIR_ANNOUNCEMENT" as never,
      content,
    } as never,
  });

  return ok("Announcement recorded.");
}

export async function addMotion(
  simulationId: string,
  delegateId: string,
  motionType: string,
  description: string,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return fail("You must be signed in.");

  const db = getDb();
  const sim = await db.committeeSimulation.findFirst({
    where: { id: simulationId, userId: user.id },
  });
  if (!sim) return fail("Simulation not found.");

  await db.simulationEvent.create({
    data: {
      simulationId,
      delegateId,
      type: "MOTION" as never,
      content: description,
      metadata: { motionType },
      motionType,
    } as never,
  });

  await db.simulationDelegate.update({
    where: { id: delegateId },
    data: { motionCount: { increment: 1 } },
  });

  await db.committeeSimulation.update({
    where: { id: simulationId },
    data: { totalMotionCount: { increment: 1 } },
  });

  return ok("Motion recorded.");
}

export async function addVote(
  simulationId: string,
  delegateId: string,
  choice: string,
  motionType: string,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return fail("You must be signed in.");

  const db = getDb();
  const sim = await db.committeeSimulation.findFirst({
    where: { id: simulationId, userId: user.id },
  });
  if (!sim) return fail("Simulation not found.");

  await db.simulationEvent.create({
    data: {
      simulationId,
      delegateId,
      type: "VOTE" as never,
      content: `${choice} vote on ${motionType} motion.`,
      metadata: { choice, motionType },
      voteChoice: choice,
      motionType,
    } as never,
  });

  await db.committeeSimulation.update({
    where: { id: simulationId },
    data: { totalVoteCount: { increment: 1 } },
  });

  return ok("Vote recorded.");
}
