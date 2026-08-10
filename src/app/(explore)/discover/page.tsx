import Link from "next/link";
import { CalendarSearch, Compass, X } from "lucide-react";
import { getDb } from "@/lib/prisma";
import { ConferenceCard } from "@/components/conference/conference-card";
import { DiscoverToolbar } from "@/components/explore/discover-toolbar";
import { SearchAutocomplete } from "@/components/explore/search-autocomplete";
import { InstagramDiscovery } from "@/components/explore/instagram-discovery";
import { ConferenceSubmissionForm } from "@/components/explore/conference-submission";
import { MyConferences } from "@/components/explore/my-conferences";
import { Container } from "@/components/shared/container";
import {
  parseDiscoverFilters,
  filtersToSearchParams,
  buildConferenceQuery,
  FEE_OPTIONS,
  DATE_OPTIONS,
  FORMAT_OPTIONS,
  type DiscoverFilters,
  type DiscoveryFacets,
} from "@/lib/search";
import {
  conferenceListInclude,
  deriveConference,
  difficultyLabel,
  type ConferenceCardData,
} from "@/lib/conference";
import { cn } from "@/lib/utils";
import { isUnsplashConfigured } from "@/lib/env";
import { searchConferencePhotos } from "@/lib/unsplash";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Discover conferences",
  description:
    "Search and filter the world's Model United Nations conferences — by date, location, fee, difficulty and committee.",
};

type RawParams = Record<string, string | string[] | undefined>;

function toSearchParams(raw: RawParams): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value !== undefined) {
      params.set(key, value);
    }
  }
  return params;
}

function chipHref(filters: DiscoverFilters, patch: Partial<DiscoverFilters>): string {
  const params = filtersToSearchParams({ ...filters, ...patch });
  const qs = params.toString();
  return qs ? `/discover?${qs}` : "/discover";
}

async function loadFacets(): Promise<DiscoveryFacets> {
  const db = getDb();
  const country = await db.conference.findMany({
    where: { published: true },
    select: { country: true },
    distinct: ["country"],
    orderBy: { country: "asc" },
  });
  const city = await db.conference.findMany({
    where: { published: true },
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });
  const state = await db.conference.findMany({
    where: { published: true, state: { not: null } },
    select: { state: true },
    distinct: ["state"],
    orderBy: { state: "asc" },
  });
  const school = await db.conference.findMany({
    where: { published: true, school: { not: null } },
    select: { school: true },
    distinct: ["school"],
    orderBy: { school: "asc" },
  });
  const university = await db.conference.findMany({
    where: { published: true, university: { not: null } },
    select: { university: true },
    distinct: ["university"],
    orderBy: { university: "asc" },
  });
  const committees = await db.conferenceCommittee.findMany({
    where: { conference: { published: true } },
    select: { name: true },
    distinct: ["name"],
    orderBy: { name: "asc" },
    take: 60,
  });

  const nonEmpty = (rows: { [key: string]: string | null }[], key: string) =>
    [...new Set(rows.map((r) => r[key]).filter((v): v is string => Boolean(v)))].sort((a, b) =>
      a.localeCompare(b),
    );

  return {
    countries: nonEmpty(country, "country"),
    cities: nonEmpty(city, "city"),
    states: nonEmpty(state, "state"),
    schools: nonEmpty(school, "school"),
    universities: nonEmpty(university, "university"),
    committees: nonEmpty(committees, "name"),
  };
}

interface ActiveChip {
  label: string;
  href: string;
}

function activeChips(filters: DiscoverFilters): ActiveChip[] {
  const chips: ActiveChip[] = [];
  if (filters.country)
    chips.push({ label: `Country: ${filters.country}`, href: chipHref(filters, { country: undefined, city: undefined }) });
  if (filters.city) chips.push({ label: `City: ${filters.city}`, href: chipHref(filters, { city: undefined }) });
  if (filters.state) chips.push({ label: `State: ${filters.state}`, href: chipHref(filters, { state: undefined }) });
  if (filters.school) chips.push({ label: `School: ${filters.school}`, href: chipHref(filters, { school: undefined }) });
  if (filters.university) chips.push({ label: `University: ${filters.university}`, href: chipHref(filters, { university: undefined }) });
  if (filters.committee) chips.push({ label: `Committee: ${filters.committee}`, href: chipHref(filters, { committee: undefined }) });
  if (filters.fee && filters.fee !== "all")
    chips.push({ label: `Fee: ${FEE_OPTIONS.find((o) => o.value === filters.fee)?.label}`, href: chipHref(filters, { fee: undefined }) });
  if (filters.date && filters.date !== "all")
    chips.push({ label: `Date: ${DATE_OPTIONS.find((o) => o.value === filters.date)?.label}`, href: chipHref(filters, { date: undefined }) });
  if (filters.format)
    chips.push({ label: `Format: ${FORMAT_OPTIONS.find((o) => o.value === filters.format)?.label}`, href: chipHref(filters, { format: undefined }) });
  if (filters.external === "yes") chips.push({ label: "External delegates", href: chipHref(filters, { external: undefined }) });
  if (filters.external === "no") chips.push({ label: "Invite only", href: chipHref(filters, { external: undefined }) });
  for (const level of filters.difficulty ?? [])
    chips.push({ label: difficultyLabel(level), href: chipHref(filters, { difficulty: (filters.difficulty ?? []).filter((v) => v !== level) }) });
  if (filters.regOpen) chips.push({ label: "Registration open", href: chipHref(filters, { regOpen: undefined }) });
  if (filters.upcoming) chips.push({ label: "Upcoming only", href: chipHref(filters, { upcoming: undefined }) });
  if (filters.featured) chips.push({ label: "Featured", href: chipHref(filters, { featured: undefined }) });
  return chips;
}

async function getFeaturedPhotos() {
  if (!isUnsplashConfigured) return [];
  try {
    return await searchConferencePhotos("model united nations conference", 4);
  } catch {
    return [];
  }
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}) {
  const raw = await searchParams;
  const filters = parseDiscoverFilters(toSearchParams(raw));
  const [facets, { where, orderBy }, featuredPhotos] = await Promise.all([
    loadFacets(),
    buildConferenceQuery(filters),
    getFeaturedPhotos(),
  ]);

  const conferences = (await getDb().conference.findMany({
    where,
    orderBy,
    include: conferenceListInclude,
  })) as ConferenceCardData[];

  const now = new Date();
  const chips = activeChips(filters);

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-brand-500/[0.07] via-transparent to-transparent">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[120px]" />
        <Container className="relative pt-12 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300">
              <Compass className="size-3.5" />
              Global conference database
            </span>
            <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Find your next <span className="text-brand-600 dark:text-brand-400">conference</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-pretty text-muted-foreground">
              Browse Model United Nations conferences from around the world.
              Filter by location, dates, fee, difficulty and committee — then save the ones you love.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-4xl pb-8">
            <SearchAutocomplete className="mb-6" />
            <DiscoverToolbar filters={filters} facets={facets} />
          </div>
        </Container>
      </section>

      {featuredPhotos.length > 0 && (
        <Container className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Featured Photos</h2>
              <p className="text-sm text-muted-foreground">Moments from MUN conferences around the world</p>
            </div>
            <p className="text-[11px] text-muted-foreground/60">Photos by Unsplash</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {featuredPhotos.map((photo: { id: string; thumb: string; alt: string; photographer: string; photographerUrl: string }) => (
              <div key={photo.id} className="group relative overflow-hidden rounded-xl">
                <div className="aspect-[3/2] overflow-hidden">
                  <img
                    src={photo.thumb}
                    alt={photo.alt}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2">
                  <a
                    href={`https://unsplash.com/${photo.photographerUrl}?utm_source=MUNOS&utm_medium=referral`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-medium text-white/80 hover:text-white"
                  >
                    {photo.photographer}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Container>
      )}

      <Container className="mt-8">
        {chips.length > 0 ? (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <Link
                key={chip.label}
                href={chip.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-[13px] font-medium text-brand-700 transition-colors hover:bg-brand-500/20 dark:text-brand-300"
              >
                {chip.label}
                <X className="size-3.5" />
              </Link>
            ))}
            <Link
              href="/discover"
              className="rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Clear all
            </Link>
          </div>
        ) : null}

        <p className="mb-5 text-sm text-muted-foreground">
          {conferences.length} conference{conferences.length === 1 ? "" : "s"}
          {filters.sort === "soonest" ? " · ordered by soonest start date" : ""}
        </p>

        {conferences.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {conferences.map((conference, index) => (
              <ConferenceCard
                key={conference.id}
                conference={conference}
                derived={deriveConference(conference, now)}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border/80 bg-muted/20 px-6 py-20 text-center",
            )}
          >
            <CalendarSearch className="size-12 text-muted-foreground/50" />
            <div>
              <h3 className="text-lg font-semibold">No conferences found</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                Try removing a few filters, widening your date range, or clearing the search.
              </p>
            </div>
            <Link
              href="/discover"
              className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Reset all filters
            </Link>
          </div>
        )}
      </Container>

      {/* My Conferences */}
      <Container className="mt-16">
        <MyConferences />
      </Container>

      {/* Instagram MUN Discovery */}
      <Container className="mt-16">
        <InstagramDiscovery />
      </Container>

      {/* Submit Conference */}
      <Container className="mt-16">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Know a real conference?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Submit it here and we&apos;ll add it to the database.
          </p>
        </div>
        <div className="mx-auto max-w-2xl">
          <ConferenceSubmissionForm />
        </div>
      </Container>
    </div>
  );
}
