"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  Sparkles,
  CircleDot,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SaveButton } from "@/components/conference/save-button";
import { cn } from "@/lib/utils";
import type {
  ConferenceCardData,
  ConferenceDerived,
} from "@/lib/conference";
import { FORMAT_LABELS, difficultyLabel, STATUS_STYLES } from "@/lib/conference";

export function ConferenceCard({
  conference,
  derived,
  index = 0,
}: {
  conference: ConferenceCardData;
  derived: ConferenceDerived;
  index?: number;
}) {
  const image = conference.bannerUrl || conference.logoUrl;
  const isUnsplashPhoto = image?.includes("images.unsplash.com");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
    >
      <Link
        href={`/conference/${conference.slug}`}
        className="group block overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(79,70,229,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={conference.name}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="grid size-full place-items-center bg-gradient-to-br from-brand-500/30 to-brand-700/20">
              <CircleDot className="size-12 text-brand-500/60" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/20" />

          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase",
                STATUS_STYLES[derived.status],
              )}
            >
              {derived.statusLabel}
            </span>
            {conference.featured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-brand-700 backdrop-blur">
                <Sparkles className="size-3" />
                Featured
              </span>
            ) : null}
            <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              {FORMAT_LABELS[conference.format]}
            </span>
          </div>

          <div className="absolute right-3 top-3">
            <SaveButton
              conferenceId={conference.id}
              conferenceMeta={{
                name: conference.name,
                slug: conference.slug,
                country: conference.country,
                city: conference.city,
                startDate: conference.startDate.toISOString(),
                endDate: conference.endDate.toISOString(),
              }}
              className="bg-white/85 text-foreground shadow-sm backdrop-blur hover:bg-white"
              size="icon"
            />
          </div>

          <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 text-[13px] text-white">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate font-medium drop-shadow">
              {derived.locationLabel}
            </span>
            {isUnsplashPhoto && (
              <a
                href="https://unsplash.com?utm_source=MUNOS&utm_medium=referral"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto shrink-0 text-[9px] font-medium text-white/60 hover:text-white/90"
              >
                Unsplash
              </a>
            )}
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-[15px] font-semibold tracking-tight">
                {conference.name}
              </h3>
            </div>
            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
              {conference.organizer?.name ?? conference.school ?? "Organizer TBA"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {derived.dateRangeLabel}
            </span>
            {conference.capacity ? (
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" />
                {conference.capacity.toLocaleString()} delegates
              </span>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <div className="flex items-center gap-2">
              <Badge
                variant={conference.fee > 0 ? "default" : "secondary"}
                className="rounded-full font-semibold"
              >
                {derived.feeLabel}
              </Badge>
              <Badge variant="outline" className="rounded-full">
                {difficultyLabel(conference.difficulty)}
              </Badge>
            </div>
            <span className="text-xs font-medium text-brand-600 dark:text-brand-400">
              View →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
