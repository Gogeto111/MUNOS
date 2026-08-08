"use server";

import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";

export async function createPost(content: string, imageUrl?: string): Promise<ActionState<{ postId: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");
    if (!content.trim()) return fail("Post cannot be empty.");
    if (content.length > 2000) return fail("Post is too long (max 2000 characters).");

    const db = getDb();
    const post = await db.post.create({
      data: {
        userId: user.id,
        content: content.trim(),
        imageUrl: imageUrl || null,
        visibility: "public",
      },
    });

    return ok("Posted.", { postId: post.id });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to create post.");
  }
}

export type PostItem = {
  id: string;
  content: string;
  imageUrl: string | null;
  author: string;
  initials: string;
  createdAt: string;
  likes: number;
  likedByMe: boolean;
};

const PAGE_SIZE = 10;

export async function listPosts(cursor?: string, topic?: string): Promise<
  ActionState<{ posts: PostItem[]; nextCursor: string | null }>
> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    const db = getDb();
    const where = topic
      ? { content: { contains: topic, mode: "insensitive" as const } }
      : {};

    const posts = await db.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1,
      ...(cursor
        ? { skip: 1, cursor: { id: cursor } }
        : {}),
      include: {
        user: {
          select: { firstName: true, lastName: true, username: true },
        },
        likes: {
          select: { userId: true },
        },
      },
    });

    let nextCursor: string | null = null;
    if (posts.length > PAGE_SIZE) {
      const last = posts.pop()!;
      nextCursor = last.id;
    }

    return ok(
      "Loaded.",
      {
        posts: posts.map((p) => {
          const name = [p.user.firstName, p.user.lastName].filter(Boolean).join(" ") || p.user.username || "Anonymous";
          const initials = [p.user.firstName?.[0], p.user.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "??";
          return {
            id: p.id,
            content: p.content,
            imageUrl: p.imageUrl,
            author: name,
            initials,
            createdAt: p.createdAt.toISOString(),
            likes: p.likes.length,
            likedByMe: p.likes.some((l) => l.userId === user.id),
          };
        }),
        nextCursor,
      },
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load posts.");
  }
}

export async function togglePostLike(postId: string): Promise<ActionState<{ liked: boolean; likes: number }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    const db = getDb();
    const existing = await db.postLike.findUnique({
      where: { postId_userId: { postId, userId: user.id } },
    });

    if (existing) {
      await db.postLike.delete({ where: { id: existing.id } });
      const count = await db.postLike.count({ where: { postId } });
      return ok("Unliked.", { liked: false, likes: count });
    } else {
      await db.postLike.create({ data: { postId, userId: user.id } });
      const count = await db.postLike.count({ where: { postId } });
      return ok("Liked.", { liked: true, likes: count });
    }
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to toggle like.");
  }
}

export async function getSocialStats(): Promise<
  ActionState<{ postCount: number; totalLikes: number; memberSince: string }>
> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    const db = getDb();
    const [postCount, totalLikes, userData] = await Promise.all([
      db.post.count({ where: { userId: user.id } }),
      db.postLike.count({
        where: { post: { userId: user.id } },
      }),
      db.user.findUnique({
        where: { id: user.id },
        select: { createdAt: true },
      }),
    ]);

    return ok("Loaded.", {
      postCount,
      totalLikes,
      memberSince: userData?.createdAt.toISOString() ?? new Date().toISOString(),
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load stats.");
  }
}

export type TrendingTopic = {
  tag: string;
  count: number;
};

export async function getTrendingTopics(): Promise<ActionState<TrendingTopic[]>> {
  try {
    const db = getDb();
    const recentPosts = await db.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { content: true },
    });

    const tagCounts = new Map<string, number>();
    for (const post of recentPosts) {
      const matches = post.content.match(/#[\w\u00C0-\u024F]+/g);
      if (matches) {
        for (const tag of matches) {
          const lower = tag.toLowerCase();
          tagCounts.set(lower, (tagCounts.get(lower) ?? 0) + 1);
        }
      }
    }

    const topics = [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return ok("Loaded.", topics);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load trending topics.");
  }
}

export type UserSearchResult = {
  id: string;
  name: string;
  initials: string;
  username: string | null;
  country: string | null;
};

export async function searchUsers(query: string): Promise<ActionState<UserSearchResult[]>> {
  try {
    if (!query.trim()) return ok("Loaded.", []);

    const db = getDb();
    const users = await db.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 8,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        country: true,
      },
    });

    return ok(
      "Loaded.",
      users.map((u) => {
        const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || "Anonymous";
        const initials = [u.firstName?.[0], u.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "??";
        return {
          id: u.id,
          name,
          initials,
          username: u.username,
          country: u.country,
        };
      }),
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to search users.");
  }
}
