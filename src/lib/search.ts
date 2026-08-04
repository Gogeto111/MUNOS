import type { Prisma } from "@/generated/prisma/client";
import type { ConferenceFormat, ExperienceLevel } from "@/generated/prisma/browser";

export interface DiscoverFilters {
  q?: string;
  date?: "all" | "this_month" | "next_3_months" | "next_6_months" | "this_year";
  fee?: "all" | "free" | "under_50" | "under_100";
  format?: ConferenceFormat;
  external?: "all" | "yes" | "no";
  difficulty?: ExperienceLevel[];
  school?: string;
  university?: string;
  country?: string;
  state?: string;
  city?: string;
  committee?: string;
  regOpen?: boolean;
  upcoming?: boolean;
  featured?: boolean;
  sort?: "newest" | "soonest" | "featured" | "fee_low" | "fee_high" | "popular";
}

export type DiscoverSort = NonNullable<DiscoverFilters["sort"]>;

export const DISCOVER_SORTS: { value: DiscoverSort; label: string }[] = [
  { value: "soonest", label: "Soonest first" },
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newly listed" },
  { value: "fee_low", label: "Lowest fee" },
  { value: "fee_high", label: "Highest fee" },
  { value: "popular", label: "Most saved" },
];

export const DATE_OPTIONS: { value: NonNullable<DiscoverFilters["date"]>; label: string }[] = [
  { value: "all", label: "Any time" },
  { value: "this_month", label: "This month" },
  { value: "next_3_months", label: "Next 3 months" },
  { value: "next_6_months", label: "Next 6 months" },
  { value: "this_year", label: "This year" },
];

export const FEE_OPTIONS: { value: NonNullable<DiscoverFilters["fee"]>; label: string }[] = [
  { value: "all", label: "Any fee" },
  { value: "free", label: "Free" },
  { value: "under_50", label: "Under $50" },
  { value: "under_100", label: "Under $100" },
];

export const FORMAT_OPTIONS: { value: ConferenceFormat; label: string }[] = [
  { value: "OFFLINE", label: "In person" },
  { value: "ONLINE", label: "Online" },
  { value: "HYBRID", label: "Hybrid" },
];

export function defaultFilters(): Required<DiscoverFilters> {
  return {
    q: "",
    date: "all",
    fee: "all",
    format: "OFFLINE",
    external: "all",
    difficulty: [],
    school: "",
    university: "",
    country: "",
    state: "",
    city: "",
    committee: "",
    regOpen: false,
    upcoming: false,
    featured: false,
    sort: "soonest",
  };
}

/** Parses raw URL search params into a typed, validated filter object. */
export function parseDiscoverFilters(params: URLSearchParams): DiscoverFilters {
  const pick = (key: string): string | undefined => {
    const value = params.get(key)?.trim();
    return value ? value : undefined;
  };

  const date = pick("date");
  const fee = pick("fee");
  const format = pick("format");
  const external = pick("external");
  const sort = pick("sort");
  const difficulty = params.getAll("difficulty").filter((v): v is ExperienceLevel =>
    ["FIRST_TIMER", "BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].includes(v),
  );

  return {
    q: pick("q"),
    date: date && DATE_OPTIONS.some((o) => o.value === date) ? (date as DiscoverFilters["date"]) : undefined,
    fee: fee && FEE_OPTIONS.some((o) => o.value === fee) ? (fee as DiscoverFilters["fee"]) : undefined,
    format:
      format && FORMAT_OPTIONS.some((o) => o.value === format)
        ? (format as ConferenceFormat)
        : undefined,
    external:
      external === "yes" || external === "no" ? external : undefined,
    difficulty: difficulty.length > 0 ? difficulty : undefined,
    school: pick("school"),
    university: pick("university"),
    country: pick("country"),
    state: pick("state"),
    city: pick("city"),
    committee: pick("committee"),
    regOpen: params.get("reg_open") === "1",
    upcoming: params.get("upcoming") === "1",
    featured: params.get("featured") === "1",
    sort: sort && DISCOVER_SORTS.some((o) => o.value === sort) ? (sort as DiscoverSort) : "soonest",
  };
}

/** Serializes filters back into a stable query string. */
export function filtersToSearchParams(filters: DiscoverFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.date && filters.date !== "all") params.set("date", filters.date);
  if (filters.fee && filters.fee !== "all") params.set("fee", filters.fee);
  if (filters.format) params.set("format", filters.format);
  if (filters.external && filters.external !== "all") params.set("external", filters.external);
  for (const d of filters.difficulty ?? []) params.append("difficulty", d);
  if (filters.school) params.set("school", filters.school);
  if (filters.university) params.set("university", filters.university);
  if (filters.country) params.set("country", filters.country);
  if (filters.state) params.set("state", filters.state);
  if (filters.city) params.set("city", filters.city);
  if (filters.committee) params.set("committee", filters.committee);
  if (filters.regOpen) params.set("reg_open", "1");
  if (filters.upcoming) params.set("upcoming", "1");
  if (filters.featured) params.set("featured", "1");
  params.set("sort", filters.sort ?? "soonest");
  return params;
}

function insensitive(value: string): Prisma.StringFilter {
  return { contains: value, mode: "insensitive" };
}

function nowRounded(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Builds a Prisma `where` + `orderBy` from the parsed filters.
 * Pure function — unit-testable without a database.
 */
export function buildConferenceQuery(
  filters: DiscoverFilters,
  now: Date = new Date(),
): { where: Prisma.ConferenceWhereInput; orderBy: Prisma.ConferenceOrderByWithRelationInput[] } {
  const and: Prisma.ConferenceWhereInput[] = [{ published: true }];

  if (filters.q) {
    const q = filters.q;
    and.push({
      OR: [
        { name: insensitive(q) },
        { tagline: insensitive(q) },
        { theme: insensitive(q) },
        { city: insensitive(q) },
        { state: insensitive(q) },
        { country: insensitive(q) },
        { school: insensitive(q) },
        { university: insensitive(q) },
        { organizer: { is: { name: insensitive(q) } } },
        { committees: { some: { name: insensitive(q) } } },
        { agenda: { some: { title: insensitive(q) } } },
      ],
    });
  }

  if (filters.committee) {
    and.push({ committees: { some: { name: insensitive(filters.committee) } } });
  }

  const today = nowRounded(now);

  if (filters.date) {
    const ranges: Record<NonNullable<DiscoverFilters["date"]>, [Date, Date] | null> = {
      all: null,
      this_month: [today, new Date(now.getFullYear(), now.getMonth() + 1, 1)],
      next_3_months: [today, new Date(now.getFullYear(), now.getMonth() + 3, 1)],
      next_6_months: [today, new Date(now.getFullYear(), now.getMonth() + 6, 1)],
      this_year: [today, new Date(now.getFullYear() + 1, 0, 1)],
    };
    const range = ranges[filters.date];
    if (range) {
      and.push({ startDate: { gte: range[0], lt: range[1] } });
    }
  }

  if (filters.fee) {
    if (filters.fee === "free") {
      and.push({ fee: 0 });
    } else if (filters.fee === "under_50") {
      and.push({ fee: { gt: 0, lte: 50 } });
    } else if (filters.fee === "under_100") {
      and.push({ fee: { gt: 0, lte: 100 } });
    }
  }

  if (filters.format) and.push({ format: filters.format });
  if (filters.external === "yes") and.push({ externalDelegates: true });
  if (filters.external === "no") and.push({ externalDelegates: false });

  if (filters.difficulty && filters.difficulty.length > 0) {
    and.push({ difficulty: { in: filters.difficulty } });
  }

  if (filters.school) and.push({ school: insensitive(filters.school) });
  if (filters.university) and.push({ university: insensitive(filters.university) });
  if (filters.country) and.push({ country: insensitive(filters.country) });
  if (filters.state) and.push({ state: insensitive(filters.state) });
  if (filters.city) and.push({ city: insensitive(filters.city) });

  if (filters.regOpen) {
    and.push({
      registrationOpen: true,
      OR: [{ registrationDeadline: null }, { registrationDeadline: { gte: now } }],
    });
  }

  if (filters.upcoming) {
    and.push({ endDate: { gte: today } });
  }

  if (filters.featured) {
    and.push({ featured: true });
  }

  const orderBy: Prisma.ConferenceOrderByWithRelationInput[] = [];
  switch (filters.sort) {
    case "newest":
      orderBy.push({ createdAt: "desc" });
      break;
    case "fee_low":
      orderBy.push({ fee: "asc" });
      break;
    case "fee_high":
      orderBy.push({ fee: "desc" });
      break;
    case "popular":
      orderBy.push({ bookmarks: { _count: "desc" } });
      break;
    case "featured":
      orderBy.push({ featured: "desc" });
      orderBy.push({ startDate: "asc" });
      break;
    case "soonest":
    default:
      orderBy.push({ startDate: "asc" });
      break;
  }
  orderBy.push({ createdAt: "desc" });

  return { where: { AND: and }, orderBy };
}

/** Distinct facet values used to populate filter dropdowns. */
export interface DiscoveryFacets {
  countries: string[];
  cities: string[];
  states: string[];
  schools: string[];
  universities: string[];
  committees: string[];
}
