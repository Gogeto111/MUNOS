"use server";

import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";

export type SuggestedUser = {
  id: string;
  name: string;
  initials: string;
  username: string | null;
  country: string | null;
  followerCount: number;
  reason: string;
};

export async function getSuggestedUsers(): Promise<ActionState<SuggestedUser[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    const db = getDb();

    // Users the current user already follows
    const followingRows = await db.userFollow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });
    const followingIds = new Set(followingRows.map((r) => r.followingId));
    followingIds.add(user.id);

    // Candidates: same country first, then popular users
    const candidates = await db.user.findMany({
      where: {
        id: { notIn: [...followingIds] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        country: true,
        interests: true,
      },
      take: 50,
    });

    // Score each candidate
    const scored = candidates.map((c) => {
      let score = 0;
      let reason = "Popular on MUNOS";

      if (c.country && c.country === user.country) {
        score += 10;
        reason = `From ${c.country}`;
      }

      const sharedInterests = (c.interests ?? []).filter((i) =>
        user.interests.includes(i),
      );
      if (sharedInterests.length > 0) {
        score += sharedInterests.length * 5;
        reason = `Shares ${sharedInterests.length} interest${sharedInterests.length > 1 ? "s" : ""}`;
      }

      // Slight random tiebreaker so suggestions stay fresh
      score += Math.random() * 0.5;

      return { ...c, score, reason };
    });

    const top = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Batch-fetch follower counts
    const ids = top.map((t) => t.id);
    const followerCounts = await db.userFollow.groupBy({
      by: ["followingId"],
      where: { followingId: { in: ids } },
      _count: { id: true },
    });
    const countMap = new Map(
      followerCounts.map((r) => [r.followingId, r._count.id]),
    );

    return ok(
      "Loaded.",
      top.map((t) => {
        const name = [t.firstName, t.lastName].filter(Boolean).join(" ") || t.username || "Anonymous";
        const initials = [t.firstName?.[0], t.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "??";
        return {
          id: t.id,
          name,
          initials,
          username: t.username,
          country: t.country,
          followerCount: countMap.get(t.id) ?? 0,
          reason: t.reason,
        };
      }),
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load suggestions.");
  }
}
