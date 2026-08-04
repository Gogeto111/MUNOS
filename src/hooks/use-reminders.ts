"use client";

import * as React from "react";
import { toast } from "sonner";
import { isAuthConfigured } from "@/lib/public-env";
import {
  listReminders,
  removeReminder,
  setReminder,
} from "@/lib/actions/conference";
import type { ReminderType } from "@/generated/prisma/browser";

export interface ConferenceReminder {
  type: ReminderType;
  remindAt: string; // ISO string
  notified: boolean;
}

const STORAGE_PREFIX = "munos.reminders.";

function readLocal(conferenceId: string): ConferenceReminder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + conferenceId);
    const parsed = raw ? (JSON.parse(raw) as ConferenceReminder[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(conferenceId: string, reminders: ConferenceReminder[]) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + conferenceId, JSON.stringify(reminders));
  } catch {
    // ignore private-mode failures
  }
}

export const REMINDER_LABELS: Record<ReminderType, string> = {
  REGISTRATION_DEADLINE: "Registration deadline",
  COUNTRY_ALLOCATION: "Country allocation",
  CONFERENCE_STARTS: "Conference starts",
};

export function useReminders(conferenceId: string | null) {
  const [reminders, setReminders] = React.useState<ConferenceReminder[]>([]);
  const [permission, setPermission] = React.useState<NotificationPermission | "unsupported">(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported",
  );
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    if (!conferenceId) return;
    setReminders(readLocal(conferenceId));
    if (isAuthConfigured) {
      listReminders(conferenceId).then((res) => {
        if (res.status !== "success" || !res.data) return;
        const local = readLocal(conferenceId);
        const byType = new Map(local.map((r) => [r.type, r]));
        for (const type of res.data) {
          if (!byType.has(type)) {
            byType.set(type, { type, remindAt: new Date().toISOString(), notified: true });
          }
        }
        const merged = [...byType.values()];
        writeLocal(conferenceId, merged);
        setReminders(merged);
      });
    }
    hydrated.current = true;
  }, [conferenceId]);

  React.useEffect(() => {
    if (!conferenceId || !hydrated.current) return;
    writeLocal(conferenceId, reminders);
  }, [conferenceId, reminders]);

  const set = React.useCallback(
    async (type: ReminderType, remindAt: string) => {
      if (!conferenceId) return;
      const next = reminders.filter((r) => r.type !== type);
      next.push({ type, remindAt, notified: false });
      next.sort((a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime());
      setReminders(next);

      if (isAuthConfigured) {
        const res = await setReminder(conferenceId, { type, remindAt });
        if (res.status === "success") toast.success("Reminder set");
        else toast.error(res.message ?? "Could not set reminder.");
      } else {
        toast.success("Reminder set");
      }
    },
    [conferenceId, reminders],
  );

  const remove = React.useCallback(
    async (type: ReminderType) => {
      if (!conferenceId) return;
      setReminders((current) => current.filter((r) => r.type !== type));
      if (isAuthConfigured) {
        const res = await removeReminder(conferenceId, type);
        if (res.status !== "success") toast.error(res.message ?? "Could not remove reminder.");
      }
    },
    [conferenceId],
  );

  const requestPermission = React.useCallback(async () => {
    if (typeof Notification === "undefined") return;
    const granted = await Notification.requestPermission();
    setPermission(granted);
  }, []);

  // Fire browser notifications for reminders that have become due.
  React.useEffect(() => {
    if (!conferenceId || permission !== "granted" || reminders.length === 0) return;
    const now = Date.now();
    let changed = false;
    const next = reminders.map((r) => {
      if (!r.notified && new Date(r.remindAt).getTime() <= now) {
        changed = true;
        try {
          new Notification(REMINDER_LABELS[r.type], {
            body: "Reminder from MUNOS",
            tag: `munos-${conferenceId}-${r.type}`,
          });
        } catch {
          // some browsers require a service worker — ignore
        }
        return { ...r, notified: true };
      }
      return r;
    });
    if (changed) {
      setReminders(next);
      writeLocal(conferenceId, next);
    }
  }, [reminders, permission, conferenceId]);

  return {
    reminders,
    set,
    remove,
    permission,
    requestPermission,
  };
}
