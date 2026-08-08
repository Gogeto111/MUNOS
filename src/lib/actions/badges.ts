"use server";

import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";
import type { BadgeType } from "@/generated/prisma/client";

const BADGE_INFO: Record<BadgeType, { badgeName: string; description: string }> = {
  FIRST_POST: { badgeName: "First Post", description: "Published your first post on MUNOS." },
  FIRST_SIMULATION: { badgeName: "Simulation Starter", description: "Completed your first AI committee simulation." },
  TEN_AWARDS: { badgeName: "Award Collector", description: "Logged 10 or more MUN awards." },
  CONFERENCE_VETERAN: { badgeName: "Conference Veteran", description: "Attended 5 or more conferences." },
  AI_MASTER: { badgeName: "AI Master", description: "Completed 10 or more AI simulations." },
  RESEARCHER: { badgeName: "Researcher", description: "Created 5 or more workspace notes." },
  DELEGATE_EXCELLENCE: { badgeName: "Delegate Excellence", description: "Won Best Delegate in a simulation." },
};

export async function awardBadge(userId: string, badgeType: BadgeType): Promise<ActionState<{ badgeId: string }>> {
  try {
    const db = getDb();
    const info = BADGE_INFO[badgeType];

    const existing = await db.achievementBadge.findUnique({
      where: { userId_badgeType: { userId, badgeType } },
    });

    if (existing) {
      return ok("Badge already earned.", { badgeId: existing.id });
    }

    const badge = await db.achievementBadge.create({
      data: {
        userId,
        badgeType,
        badgeName: info.badgeName,
        description: info.description,
      },
    });

    return ok(`Badge awarded: ${info.badgeName}.`, { badgeId: badge.id });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to award badge.");
  }
}

export async function getUserBadges(userId: string): Promise<
  ActionState<
    Array<{
      id: string;
      badgeType: BadgeType;
      badgeName: string;
      description: string;
      earnedAt: string;
    }>
  >
> {
  try {
    const db = getDb();
    const badges = await db.achievementBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: "desc" },
    });

    return ok(
      "Loaded.",
      badges.map((b) => ({
        id: b.id,
        badgeType: b.badgeType,
        badgeName: b.badgeName,
        description: b.description,
        earnedAt: b.earnedAt.toISOString(),
      })),
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load badges.");
  }
}

export async function checkAndAwardBadges(userId: string): Promise<ActionState<string[]>> {
  try {
    const db = getDb();
    const awarded: string[] = [];

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        posts: { select: { id: true } },
        badges: { select: { badgeType: true } },
        munProfile: true,
      },
    });

    if (!user) return fail("User not found.");

    const earnedTypes = new Set(user.badges.map((b) => b.badgeType));

    const postCount = user.posts.length;
    const awardCount = user.munProfile?.awardsWon ?? 0;
    const simulationCount = await db.committeeSimulation.count({ where: { userId, status: "FINISHED" } });

    const workspaceNoteCount = await db.note.count({
      where: { workspace: { userId } },
    });

    const hasBestDelegateSim = await db.simulationDelegate.findFirst({
      where: {
        simulation: { userId },
        award: "BEST_DELEGATE",
      },
    });

    const checks: Array<{ type: BadgeType; eligible: boolean }> = [
      { type: "FIRST_POST", eligible: postCount >= 1 },
      { type: "FIRST_SIMULATION", eligible: simulationCount >= 1 },
      { type: "TEN_AWARDS", eligible: awardCount >= 10 },
      { type: "CONFERENCE_VETERAN", eligible: false },
      { type: "AI_MASTER", eligible: simulationCount >= 10 },
      { type: "RESEARCHER", eligible: workspaceNoteCount >= 5 },
      { type: "DELEGATE_EXCELLENCE", eligible: !!hasBestDelegateSim },
    ];

    for (const check of checks) {
      if (check.eligible && !earnedTypes.has(check.type)) {
        const info = BADGE_INFO[check.type];
        await db.achievementBadge.create({
          data: {
            userId,
            badgeType: check.type,
            badgeName: info.badgeName,
            description: info.description,
          },
        });
        awarded.push(info.badgeName);
      }
    }

    return ok(
      awarded.length > 0 ? `Awarded ${awarded.length} badge(s).` : "No new badges to award.",
      awarded,
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to check badges.");
  }
}
