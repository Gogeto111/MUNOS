"use server";

import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";

export type CreateSimulationInput = {
  committeeName: string;
  topic?: string;
  country?: string;
  userRole?: string;
  delegateCountries: string[];
};

export async function createSimulation(
  input: CreateSimulationInput,
): Promise<ActionState<{ id: string }>> {
  const user = await getCurrentUser();
  if (!user) return fail("You must be signed in.");

  const db = getDb();

const sim = await db.committeeSimulation.create({
    data: {
      userId: user.id,
      committeeName: input.committeeName,
      topic: input.topic,
      country: input.country,
      userRole: input.userRole ?? "DELEGATE",
      status: "SETUP",
      speakersListJson: [],
      delegates: {
        create: [
          {
            country: input.country ?? "Observer",
            displayName: user.firstName
              ? `${user.firstName} (You)`
              : "You",
            isAi: false,
            isChair: false,
            speakingStyle: "delegate",
          },
          ...input.delegateCountries.map((country) => ({
            country,
            displayName: getDefaultDelegateName(country),
            isAi: true,
            policyStance: getDefaultStance(country),
          })),
        ],
      },
    },
    select: { id: true },
  });

  return ok("Simulation created.", { id: sim.id });
}

function getDefaultDelegateName(country: string): string {
  return `${country} Delegate`;
}

function getDefaultStance(country: string): string {
  const stances: Record<string, string> = {
    USA: "Pro-market, interventionist when interests are threatened.",
    China: "Non-interference, multilateralism, economic sovereignty.",
    Russia: "National sovereignty, multipolar order, regional spheres.",
    France: "Multilateralism, human rights, EU coordination.",
    UK: "Special relationship, Atlanticism, pragmatic multilateralism.",
    India: "Non-alignment, developmental priorities, regional stability.",
    Brazil: "Non-intervention, South-South cooperation, sovereignty.",
    Germany: 'Rules-based order, EU leadership, "never again" principle.',
    Japan: "Peaceful development, alliance architecture, economic security.",
    Australia: "Rules-based order, Pacific engagement, alliance partnerships.",
  };
  return (
    stances[country] ??
    "Advocates for national interest while engaging constructively in multilateral dialogue."
  );
}
