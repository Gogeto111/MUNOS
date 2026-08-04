import type { SimulationEventType } from "@/generated/prisma/client";

export function buildSimulationPrompt(
  sim: {
    committeeName: string;
    topic: string | null;
    country: string | null;
    userRole: string;
    status: string;
    delegates: Array<{
      id: string;
      country: string;
      displayName: string;
      isAi: boolean;
      isChair: boolean;
      policyStance: string | null;
      speakingStyle: string | null;
    }>;
    events: Array<{
      id: string;
      type: SimulationEventType;
      content: string;
      delegateId: string | null;
      createdAt: Date;
    }>;
  },
  action: string,
  context: Record<string, unknown>,
): string {
  const delegateList = sim.delegates
    .map((d) => `- ${d.displayName} (${d.country}): ${d.policyStance ?? "No stance defined"}`)
    .join("\n");

  const recentEvents = sim.events
    .slice(-10)
    .map((e) => `[${e.type}] ${e.content}`)
    .join("\n");

  return `You are an AI delegate in a Model UN committee simulation.

Committee: ${sim.committeeName}
Topic: ${sim.topic ?? "General Debate"}
Your country: ${sim.country ?? "Observer"}
Your role: ${sim.userRole}

Delegates in committee:
${delegateList}

Recent events:
${recentEvents}

Current action: ${action}
Context: ${JSON.stringify(context)}

Respond in character as the delegate for ${sim.country ?? "Observer"}. Keep your response concise (under 150 words), diplomatic, and in-character. Use formal UN language.`;
}
