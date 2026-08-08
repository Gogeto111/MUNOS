"use server";

import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";

export async function toggleFollow(targetUserId: string): Promise<ActionState<{ following: boolean }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");
    if (user.id === targetUserId) return fail("You cannot follow yourself.");

    const db = getDb();
    const existing = await db.userFollow.findUnique({
      where: { followerId_followingId: { followerId: user.id, followingId: targetUserId } },
    });

    if (existing) {
      await db.userFollow.delete({ where: { id: existing.id } });
      return ok("Unfollowed.", { following: false });
    } else {
      await db.userFollow.create({
        data: { followerId: user.id, followingId: targetUserId },
      });
      return ok("Following.", { following: true });
    }
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to toggle follow.");
  }
}

export async function getFollowers(userId: string): Promise<
  ActionState<
    Array<{
      id: string;
      firstName: string | null;
      lastName: string | null;
      username: string | null;
      avatarUrl: string | null;
      followedAt: string;
    }>
  >
> {
  try {
    const db = getDb();
    const followers = await db.userFollow.findMany({
      where: { followingId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        follower: {
          select: { id: true, firstName: true, lastName: true, username: true, avatarUrl: true },
        },
      },
    });

    return ok(
      "Loaded.",
      followers.map((f) => ({
        id: f.follower.id,
        firstName: f.follower.firstName,
        lastName: f.follower.lastName,
        username: f.follower.username,
        avatarUrl: f.follower.avatarUrl,
        followedAt: f.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load followers.");
  }
}

export async function getFollowing(userId: string): Promise<
  ActionState<
    Array<{
      id: string;
      firstName: string | null;
      lastName: string | null;
      username: string | null;
      avatarUrl: string | null;
      followedAt: string;
    }>
  >
> {
  try {
    const db = getDb();
    const following = await db.userFollow.findMany({
      where: { followerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        following: {
          select: { id: true, firstName: true, lastName: true, username: true, avatarUrl: true },
        },
      },
    });

    return ok(
      "Loaded.",
      following.map((f) => ({
        id: f.following.id,
        firstName: f.following.firstName,
        lastName: f.following.lastName,
        username: f.following.username,
        avatarUrl: f.following.avatarUrl,
        followedAt: f.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load following.");
  }
}

export async function getFollowCounts(userId: string): Promise<
  ActionState<{ followers: number; following: number }>
> {
  try {
    const db = getDb();
    const [followers, following] = await Promise.all([
      db.userFollow.count({ where: { followingId: userId } }),
      db.userFollow.count({ where: { followerId: userId } }),
    ]);

    return ok("Loaded.", { followers, following });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load follow counts.");
  }
}

export async function isFollowing(targetUserId: string): Promise<ActionState<{ following: boolean }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return ok("Loaded.", { following: false });

    const db = getDb();
    const existing = await db.userFollow.findUnique({
      where: { followerId_followingId: { followerId: user.id, followingId: targetUserId } },
    });

    return ok("Loaded.", { following: !!existing });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to check follow status.");
  }
}
