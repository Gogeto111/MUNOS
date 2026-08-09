"use server";

import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { ok, fail, toActionError, type ActionState } from "@/lib/actions";

export interface NotificationItem {
  id: string;
  type: "conference_update" | "submission_status" | "achievement" | "reminder" | "system";
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
}

export async function getNotifications(): Promise<
  ActionState<{ notifications: NotificationItem[]; unreadCount: number }>
> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    const db = getDb();
    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.notification.count({
        where: { userId: user.id, read: false },
      }),
    ]);

    return ok("Loaded.", {
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type as NotificationItem["type"],
        title: n.title,
        description: n.body ?? "",
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    });
  } catch (error) {
    return toActionError(error);
  }
}

export async function markAsRead(
  notificationId: string,
): Promise<ActionState> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    const db = getDb();
    await db.notification.updateMany({
      where: { id: notificationId, userId: user.id },
      data: { read: true },
    });

    return ok("Marked as read.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function markAllAsRead(): Promise<ActionState> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    const db = getDb();
    await db.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });

    return ok("All marked as read.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteNotification(
  notificationId: string,
): Promise<ActionState> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    const db = getDb();
    await db.notification.deleteMany({
      where: { id: notificationId, userId: user.id },
    });

    return ok("Notification deleted.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function getUnreadCount(): Promise<ActionState<number>> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    const db = getDb();
    const count = await db.notification.count({
      where: { userId: user.id, read: false },
    });

    return ok("Loaded.", count);
  } catch (error) {
    return toActionError(error);
  }
}
