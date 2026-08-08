"use server";

import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";

export async function getSystemStatus(): Promise<
  ActionState<Array<{ name: string; status: string; color: string }>>
> {
  try {
    const checks: Array<{ name: string; status: string; color: string }> = [];

    // Check AI Engine
    const hasAI = !!process.env.AI_MODEL || !!process.env.GEMINI_API_KEY;
    checks.push({
      name: "AI Engine",
      status: hasAI ? "Online" : "Not configured",
      color: hasAI ? "emerald" : "red",
    });

    // Check Database
    try {
      const db = getDb();
      await db.$queryRaw`SELECT 1`;
      checks.push({ name: "Research DB", status: "Connected", color: "emerald" });
    } catch {
      checks.push({ name: "Research DB", status: "Disconnected", color: "red" });
    }

    // Check News Feeds - verify by attempting to fetch RSS
    try {
      const res = await fetch("https://news.un.org/feed/subscribe/en/news/region/africa/feed/rss.xml", {
        signal: AbortSignal.timeout(5000),
      });
      checks.push({
        name: "News Feeds",
        status: res.ok ? "Online" : "Degraded",
        color: res.ok ? "emerald" : "amber",
      });
    } catch {
      checks.push({ name: "News Feeds", status: "Unreachable", color: "amber" });
    }

    // Check Video Coach
    checks.push({
      name: "Video Coach",
      status: hasAI ? "Online" : "Not configured",
      color: hasAI ? "emerald" : "amber",
    });

    return ok("Loaded.", checks);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to check status.");
  }
}

export async function getRecentActivity(): Promise<
  ActionState<Array<{ message: string; type: string; createdAt: string }>>
> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    const db = getDb();
    const activities = await db.activity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        message: true,
        type: true,
        createdAt: true,
      },
    });

    return ok(
      "Loaded.",
      activities.map((a) => ({
        message: a.message,
        type: a.type,
        createdAt: a.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load activity.");
  }
}

export async function getDashboardStats(): Promise<
  ActionState<{
    totalWorkspaces: number;
    activeSimulations: number;
    awardsWon: number;
    upcomingConferences: number;
  }>
> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    const db = getDb();
    const [totalWorkspaces, activeSimulations, awardsWon, upcomingConferences] = await Promise.all([
      db.workspace.count({ where: { userId: user.id } }),
      db.committeeSimulation.count({
        where: { userId: user.id, status: { in: ["SETUP", "RUNNING"] } },
      }),
      db.award.count({ where: { userId: user.id } }),
      db.reminder.count({
        where: {
          userId: user.id,
          type: "CONFERENCE_STARTS",
          remindAt: { gte: new Date() },
        },
      }),
    ]);

    return ok("Loaded.", {
      totalWorkspaces,
      activeSimulations,
      awardsWon,
      upcomingConferences,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load stats.");
  }
}
