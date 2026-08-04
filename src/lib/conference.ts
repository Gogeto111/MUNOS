import type { Prisma } from "@/generated/prisma/client";
import type {
  Conference,
  ConferenceFormat,
  ExperienceLevel,
  Venue,
} from "@/generated/prisma/browser";
import { format, isBefore, isSameDay } from "date-fns";
import { formatDate } from "@/lib/format";
import { EXPERIENCE_LEVELS } from "@/lib/constants";

export const STATUS_STYLES: Record<ConferenceStatus, string> = {
  upcoming: "bg-foreground/85 text-background backdrop-blur",
  open: "bg-emerald-500/90 text-white backdrop-blur",
  closing: "bg-amber-500/90 text-white backdrop-blur",
  ongoing: "bg-brand-500/90 text-white backdrop-blur",
  past: "bg-muted-foreground/80 text-background backdrop-blur",
};

export type ConferenceStatus = "upcoming" | "open" | "closing" | "ongoing" | "past";

export interface ConferenceDerived {
  status: ConferenceStatus;
  statusLabel: string;
  daysUntilStart: number;
  daysUntilDeadline: number | null;
  deadlinePassed: boolean;
  registrationOpen: boolean;
  dateRangeLabel: string;
  feeLabel: string;
  locationLabel: string;
}

const STATUS_LABELS: Record<ConferenceStatus, string> = {
  upcoming: "Upcoming",
  open: "Registration open",
  closing: "Closing soon",
  ongoing: "Ongoing",
  past: "Ended",
};

export function conferenceStatus(
  conference: Pick<
    Conference,
    "startDate" | "endDate" | "registrationOpen" | "registrationDeadline"
  >,
  now: Date = new Date(),
): ConferenceStatus {
  if (isBefore(conference.endDate, now)) return "past";
  if (!isBefore(conference.startDate, now)) {
    const deadline = conference.registrationDeadline;
    if (deadline && isBefore(deadline, now)) return "open";
    if (deadline && isBefore(deadline, new Date(now.getTime() + 7 * 86_400_000)))
      return "closing";
    return "upcoming";
  }
  return "ongoing";
}

export function statusLabel(status: ConferenceStatus): string {
  return STATUS_LABELS[status];
}

export function daysUntil(
  date: Date | null | undefined,
  now: Date = new Date(),
): number | null {
  if (!date) return null;
  return Math.max(0, Math.ceil((date.getTime() - now.getTime()) / 86_400_000));
}

export function deriveConference(
  conference: Pick<
    Conference,
    "startDate" | "endDate" | "registrationOpen" | "registrationDeadline" | "fee" | "currency"
  > & { venue?: Pick<Venue, "city" | "state" | "country"> | null },
  now: Date = new Date(),
): ConferenceDerived {
  const status = conferenceStatus(conference, now);
  const daysUntilStart = Math.max(
    0,
    Math.ceil((conference.startDate.getTime() - now.getTime()) / 86_400_000),
  );
  const deadline = conference.registrationDeadline;

  return {
    status,
    statusLabel: statusLabel(status),
    daysUntilStart,
    daysUntilDeadline: daysUntil(deadline, now),
    deadlinePassed: deadline ? isBefore(deadline, now) : false,
    registrationOpen: conference.registrationOpen && !deadlinePassed(conference, now),
    dateRangeLabel: conferenceDateRange(conference.startDate, conference.endDate),
    feeLabel: formatFee(conference.fee, conference.currency),
    locationLabel: formatLocation(conference.venue),
  };
}

function deadlinePassed(
  conference: Pick<Conference, "registrationDeadline">,
  now: Date,
): boolean {
  return conference.registrationDeadline
    ? isBefore(conference.registrationDeadline, now)
    : false;
}

export function conferenceDateRange(
  startDate: Date,
  endDate: Date,
): string {
  if (isSameDay(startDate, endDate)) {
    return formatDate(startDate);
  }
  if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
    return `${format(startDate, "MMM d")} – ${formatDate(endDate)}`;
  }
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

export function formatFee(fee: number, currency: string): string {
  if (!fee || fee <= 0) return "Free";
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    AED: "AED ",
    SGD: "S$",
    MYR: "RM ",
  };
  const prefix = symbols[currency.toUpperCase()] ?? `${currency.toUpperCase()} `;
  const amount = fee.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return `${prefix}${amount}`;
}

export function formatLocation(
  venue: Pick<Venue, "city" | "state" | "country"> | null | undefined,
  fallbackCity?: string | null,
): string {
  if (venue) {
    return [venue.city, venue.state, venue.country].filter(Boolean).join(", ");
  }
  return [fallbackCity].filter(Boolean).join(", ") || "TBA";
}

export const FORMAT_LABELS: Record<ConferenceFormat, string> = {
  ONLINE: "Online",
  OFFLINE: "In person",
  HYBRID: "Hybrid",
};

export const DIFFICULTY_ORDER: ExperienceLevel[] = EXPERIENCE_LEVELS.map((level) => level.value);

export const DIFFICULTY_LABELS: Record<ExperienceLevel, string> = EXPERIENCE_LEVELS.reduce(
  (acc, level) => {
    acc[level.value] = level.label;
    return acc;
  },
  {} as Record<ExperienceLevel, string>,
);

export function difficultyLabel(level: ExperienceLevel): string {
  return DIFFICULTY_LABELS[level] ?? level;
}

/** Single source of truth for which relations the list endpoints include. */
export const conferenceListInclude = {
  venue: true,
  organizer: true,
  committees: { take: 3, orderBy: { createdAt: "asc" as const } },
  socialLinks: true,
} satisfies Record<string, unknown>;

/** Relations used by the detail page. */
export const conferenceDetailInclude = {
  venue: true,
  organizer: true,
  committees: { include: { countryMatrix: { orderBy: { country: "asc" as const } } }, orderBy: { createdAt: "asc" as const } },
  agenda: { orderBy: { sortOrder: "asc" as const } },
  brochures: { orderBy: { createdAt: "desc" as const } },
  gallery: { orderBy: { sortOrder: "asc" as const } },
  socialLinks: true,
  reviews: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } }, orderBy: { createdAt: "desc" as const } },
  faqs: { orderBy: { sortOrder: "asc" as const } },
  secretariat: { orderBy: { sortOrder: "asc" as const } },
  awards: { orderBy: { sortOrder: "asc" as const } },
  _count: { select: { bookmarks: true, reviews: true } },
} satisfies Record<string, unknown>;

/** Shape shared by the conference card grid. */
export interface ConferenceCardData {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string;
  theme: string | null;
  format: ConferenceFormat;
  difficulty: ExperienceLevel;
  startDate: Date;
  endDate: Date;
  registrationOpen: boolean;
  externalDelegates: boolean;
  fee: number;
  currency: string;
  registrationDeadline: Date | null;
  capacity: number | null;
  city: string;
  state: string | null;
  country: string;
  school: string | null;
  university: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  featured: boolean;
  published: boolean;
  venue: { city: string; state: string | null; country: string } | null;
  organizer: { name: string; school: string | null; university: string | null } | null;
  committees: { name: string; topic: string | null }[];
}

export type ConferenceWithDetail = Prisma.ConferenceGetPayload<{
  include: typeof conferenceDetailInclude;
}>;

export function conferenceShareUrl(
  baseUrl: string,
  slug: string,
): string {
  return `${baseUrl.replace(/\/$/, "")}/conference/${slug}`;
}

export function conferenceShareText(name: string, startDate: Date, endDate: Date): string {
  return `${name} · ${conferenceDateRange(startDate, endDate)} — discover it on MUNOS`;
}
