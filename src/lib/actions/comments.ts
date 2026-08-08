"use server";

import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";

export async function addComment(postId: string, content: string): Promise<ActionState<{ commentId: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");
    if (!content.trim()) return fail("Comment cannot be empty.");
    if (content.length > 1000) return fail("Comment is too long (max 1000 characters).");

    const db = getDb();
    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) return fail("Post not found.");

    const comment = await db.postComment.create({
      data: {
        postId,
        userId: user.id,
        content: content.trim(),
      },
    });

    return ok("Comment added.", { commentId: comment.id });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to add comment.");
  }
}

export async function deleteComment(commentId: string): Promise<ActionState> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    const db = getDb();
    const comment = await db.postComment.findUnique({ where: { id: commentId } });
    if (!comment) return fail("Comment not found.");
    if (comment.userId !== user.id) return fail("You can only delete your own comments.");

    await db.postComment.delete({ where: { id: commentId } });
    return ok("Comment deleted.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to delete comment.");
  }
}

export async function listComments(postId: string): Promise<
  ActionState<
    Array<{
      id: string;
      content: string;
      author: string;
      initials: string;
      userId: string;
      createdAt: string;
    }>
  >
> {
  try {
    const db = getDb();
    const comments = await db.postComment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, username: true },
        },
      },
    });

    return ok(
      "Loaded.",
      comments.map((c) => {
        const name = [c.user.firstName, c.user.lastName].filter(Boolean).join(" ") || c.user.username || "Anonymous";
        const initials = [c.user.firstName?.[0], c.user.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "??";
        return {
          id: c.id,
          content: c.content,
          author: name,
          initials,
          userId: c.userId,
          createdAt: c.createdAt.toISOString(),
        };
      }),
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load comments.");
  }
}
