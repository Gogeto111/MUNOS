"use client";

import Link from "next/link";
import { HeartCrack, Compass } from "lucide-react";
import { ConferenceCard } from "@/components/conference/conference-card";
import { useSaved } from "@/providers/saved-provider";
import type { ConferenceCardData, ConferenceDerived } from "@/lib/conference";

export function SavedConferencesList({
  items,
}: {
  items: { conference: ConferenceCardData; derived: ConferenceDerived }[];
}) {
  const { saved } = useSaved();

  const savedItems = items.filter((item) => saved.has(item.conference.id));

  if (savedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border/80 bg-muted/20 px-6 py-24 text-center">
        <HeartCrack className="size-12 text-muted-foreground/50" />
        <div>
          <h2 className="text-lg font-semibold">Nothing saved yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Tap the heart on any conference to keep it here for quick access.
          </p>
        </div>
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Compass className="size-4" />
          Explore conferences
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {savedItems.map((item, index) => (
        <ConferenceCard
          key={item.conference.id}
          conference={item.conference}
          derived={item.derived}
          index={index}
        />
      ))}
    </div>
  );
}
