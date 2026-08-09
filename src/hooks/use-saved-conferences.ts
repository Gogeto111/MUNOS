"use client";

import * as React from "react";
import { toast } from "sonner";
import { isAuthConfigured } from "@/lib/public-env";
import { listBookmarkedConferenceIds, toggleBookmark } from "@/lib/actions/conference";

const STORAGE_KEY = "munos.saved.conferences";
const META_KEY = "munos.saved.conferences.meta";

export interface SavedConferenceMeta {
  id: string;
  name: string;
  slug: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  website?: string;
  savedAt: number;
}

function readLocal(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeLocal(ids: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // storage unavailable (private mode) — ignore
  }
}

function readMeta(): Record<string, SavedConferenceMeta> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function writeMeta(meta: Record<string, SavedConferenceMeta>) {
  try { window.localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch {}
}

export function useSavedConferences() {
  const [saved, setSaved] = React.useState<Set<string>>(() => readLocal());
  const [pending, setPending] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (!isAuthConfigured) return;
    let cancelled = false;
    listBookmarkedConferenceIds().then((res) => {
      if (cancelled || res.status !== "success" || !res.data) return;
      setSaved((current) => {
        const next = new Set(current);
        for (const id of res.data ?? []) next.add(id);
        writeLocal(next);
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = React.useCallback(
    async (conferenceId: string, meta?: Omit<SavedConferenceMeta, "id" | "savedAt">) => {
      const wasSaved = saved.has(conferenceId);
      const optimistic = new Set(saved);
      if (wasSaved) optimistic.delete(conferenceId);
      else optimistic.add(conferenceId);

      setSaved(optimistic);
      writeLocal(optimistic);
      setPending((p) => new Set(p).add(conferenceId));

      // Store/remove metadata
      const allMeta = readMeta();
      if (!wasSaved && meta) {
        allMeta[conferenceId] = { ...meta, id: conferenceId, savedAt: Date.now() };
      } else {
        delete allMeta[conferenceId];
      }
      writeMeta(allMeta);

      if (isAuthConfigured) {
        const res = await toggleBookmark(conferenceId);
        setPending((p) => {
          const next = new Set(p);
          next.delete(conferenceId);
          return next;
        });
        if (res.status === "success" && res.data) {
          toast.success(res.data.saved ? "Saved for later" : "Removed from saved");
        } else {
          // Revert on failure.
          const revert = new Set(saved);
          if (wasSaved) revert.add(conferenceId);
          else revert.delete(conferenceId);
          setSaved(revert);
          writeLocal(revert);
          toast.error(res.message ?? "Could not update. Please try again.");
        }
      } else {
        setPending((p) => {
          const next = new Set(p);
          next.delete(conferenceId);
          return next;
        });
        toast.success(wasSaved ? "Removed from saved" : "Saved for later");
      }
    },
    [saved],
  );

  return {
    saved,
    isSaved: (id: string) => saved.has(id),
    toggle,
    isPending: (id: string) => pending.has(id),
    getSavedMeta: (): SavedConferenceMeta[] => {
      const meta = readMeta();
      return Object.values(meta).sort((a, b) => b.savedAt - a.savedAt);
    },
  };
}
