"use server";

import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";

export async function getNotificationSettings(): Promise<
  ActionState<{
    eventReminders: boolean;
    emailNotifications: boolean;
    certificateUploads: boolean;
    newFeatures: boolean;
    notificationsEnabled: boolean;
  }>
> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    const db = getDb();
    const settings = await db.userSettings.findUnique({
      where: { userId: user.id },
    });

    if (!settings) {
      return ok("Loaded.", {
        eventReminders: true,
        emailNotifications: true,
        certificateUploads: true,
        newFeatures: true,
        notificationsEnabled: true,
      });
    }

    return ok("Loaded.", {
      eventReminders: settings.eventReminders,
      emailNotifications: settings.emailNotifications,
      certificateUploads: settings.certificateUploads,
      newFeatures: settings.newFeatures,
      notificationsEnabled: settings.notificationsEnabled,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load settings.");
  }
}

export async function updateNotificationSettings(settings: {
  eventReminders: boolean;
  emailNotifications: boolean;
  certificateUploads: boolean;
  newFeatures: boolean;
  notificationsEnabled: boolean;
}): Promise<ActionState<void>> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");

    const db = getDb();
    await db.userSettings.upsert({
      where: { userId: user.id },
      update: {
        eventReminders: settings.eventReminders,
        emailNotifications: settings.emailNotifications,
        certificateUploads: settings.certificateUploads,
        newFeatures: settings.newFeatures,
        notificationsEnabled: settings.notificationsEnabled,
      },
      create: {
        userId: user.id,
        eventReminders: settings.eventReminders,
        emailNotifications: settings.emailNotifications,
        certificateUploads: settings.certificateUploads,
        newFeatures: settings.newFeatures,
        notificationsEnabled: settings.notificationsEnabled,
      },
    });

    return ok("Settings saved.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to save settings.");
  }
}
