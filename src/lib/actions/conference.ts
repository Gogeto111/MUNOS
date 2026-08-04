"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { isAuthConfigured } from "@/lib/public-env";
import { ok, fail, toActionError, type ActionState } from "@/lib/actions";
import { slugify } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";
import { ReminderType } from "@/generated/prisma/client";
import type {
  ConferenceFormat,
  ExperienceLevel,
  SocialPlatform,
} from "@/generated/prisma/browser";
import {
  conferenceInputSchema,
  conferenceChildrenSchema,
  reviewInputSchema,
  reminderInputSchema,
  type ReviewInput,
  type ReminderInput,
} from "@/lib/validation/conference";

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------

export async function toggleBookmark(conferenceId: string): Promise<ActionState<{ saved: boolean }>> {
  try {
    const user = await requireUser();
    const existing = await getDb().bookmark.findUnique({
      where: { userId_conferenceId: { userId: user.id, conferenceId } },
    });

    if (existing) {
      await getDb().bookmark.delete({ where: { id: existing.id } });
      revalidatePath("/saved");
      return ok("Removed from saved.", { saved: false });
    }

    await getDb().bookmark.create({ data: { userId: user.id, conferenceId } });
    revalidatePath("/saved");
    return ok("Saved for later.", { saved: true });
  } catch (error) {
    return toActionError(error);
  }
}

export async function listBookmarkedConferenceIds(): Promise<ActionState<string[]>> {
  try {
    const user = await requireUser();
    const bookmarks = await getDb().bookmark.findMany({
      where: { userId: user.id },
      select: { conferenceId: true },
    });
    return ok("ok", bookmarks.map((b) => b.conferenceId));
  } catch (error) {
    return toActionError(error);
  }
}

// ---------------------------------------------------------------------------
// Reminders
// ---------------------------------------------------------------------------

export async function setReminder(
  conferenceId: string,
  input: ReminderInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = reminderInputSchema.parse(input);
    const remindAt = new Date(parsed.remindAt);
    if (Number.isNaN(remindAt.getTime())) {
      return { status: "error", message: "Pick a valid reminder date." };
    }

    await getDb().reminder.upsert({
      where: {
        userId_conferenceId_type: {
          userId: user.id,
          conferenceId,
          type: parsed.type as ReminderType,
        },
      },
      create: {
        userId: user.id,
        conferenceId,
        type: parsed.type as ReminderType,
        remindAt,
      },
      update: { remindAt },
    });

    return ok("Reminder set.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function removeReminder(
  conferenceId: string,
  type: ReminderType,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await getDb().reminder.deleteMany({
      where: { userId: user.id, conferenceId, type },
    });
    return ok("Reminder removed.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function listReminders(conferenceId: string): Promise<ActionState<ReminderType[]>> {
  try {
    const user = await requireUser();
    const reminders = await getDb().reminder.findMany({
      where: { userId: user.id, conferenceId },
      select: { type: true },
    });
    return ok("ok", reminders.map((r) => r.type));
  } catch (error) {
    return toActionError(error);
  }
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export async function submitReview(
  conferenceId: string,
  input: ReviewInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = reviewInputSchema.parse(input);

    await getDb().review.upsert({
      where: { userId_conferenceId: { userId: user.id, conferenceId } },
      create: {
        userId: user.id,
        conferenceId,
        rating: parsed.rating,
        title: parsed.title || null,
        body: parsed.body || null,
      },
      update: {
        rating: parsed.rating,
        title: parsed.title || null,
        body: parsed.body || null,
      },
    });

    revalidatePath(`/conference/[slug]`);
    return ok("Thanks! Your review was published.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteReview(conferenceId: string): Promise<ActionState> {
  try {
    const user = await requireUser();
    await getDb().review.deleteMany({ where: { userId: user.id, conferenceId } });
    revalidatePath(`/conference/[slug]`);
    return ok("Review removed.");
  } catch (error) {
    return toActionError(error);
  }
}

// ---------------------------------------------------------------------------
// Admin — authorization + conference CRUD
// ---------------------------------------------------------------------------

export interface ConferenceDraft {
  conference: {
    name: string;
    slug: string;
    tagline?: string;
    description: string;
    theme?: string;
    format: ConferenceFormat;
    difficulty: ExperienceLevel;
    startDate: string;
    endDate: string;
    registrationOpen: boolean;
    externalDelegates: boolean;
    fee?: string;
    currency: string;
    registrationDeadline?: string;
    capacity?: string;
    website?: string;
    instagram?: string;
    email?: string;
    school?: string;
    university?: string;
    city: string;
    state?: string;
    country: string;
    logoUrl?: string;
    bannerUrl?: string;
    featured: boolean;
    published: boolean;
  };
  organizer: {
    name: string;
    description?: string;
    school?: string;
    university?: string;
    website?: string;
    email?: string;
    instagram?: string;
    logoUrl?: string;
  };
  venue: {
    name: string;
    address?: string;
    city: string;
    state?: string;
    country: string;
    latitude?: string;
    longitude?: string;
    mapsUrl?: string;
  };
  committees: {
    name: string;
    topic?: string;
    description?: string;
    difficulty: ExperienceLevel;
    maxDelegates?: string;
    countryMatrix: { country: string; seats?: string }[];
  }[];
  agenda: { title: string; description?: string; startAt: string; endAt?: string; sortOrder?: string }[];
  brochures: { title?: string; fileUrl: string; fileName?: string; mimeType?: string; sizeBytes?: string }[];
  gallery: { url: string; alt?: string; caption?: string }[];
  socialLinks: { platform: SocialPlatform; url: string }[];
  awards: { name: string; description?: string }[];
  faqs: { question: string; answer: string }[];
  secretariat: { name: string; role: string; photoUrl?: string; bio?: string }[];
}

function toNullableString(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toNullableNumber(value: string | undefined): number | null {
  if (!value || value.trim() === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function toNullableDate(value: string | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function requireAdmin() {
  // Without auth configured (local/dev), the hidden admin panel is unlocked.
  if (!isAuthConfigured) return null;
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("ADMIN_REQUIRED");
  }
  return user;
}

function buildConferenceData(draft: ConferenceDraft) {
  const c = draft.conference;
  return {
    name: c.name.trim(),
    slug: c.slug.trim() || slugify(c.name),
    tagline: toNullableString(c.tagline),
    description: c.description.trim(),
    theme: toNullableString(c.theme),
    format: c.format,
    difficulty: c.difficulty,
    startDate: new Date(c.startDate),
    endDate: new Date(c.endDate),
    registrationOpen: c.registrationOpen,
    externalDelegates: c.externalDelegates,
    fee: toNullableNumber(c.fee) ?? 0,
    currency: c.currency.trim() || "USD",
    registrationDeadline: toNullableDate(c.registrationDeadline),
    capacity: toNullableNumber(c.capacity),
    website: toNullableString(c.website),
    instagram: toNullableString(c.instagram),
    email: toNullableString(c.email),
    school: toNullableString(c.school),
    university: toNullableString(c.university),
    city: c.city.trim(),
    state: toNullableString(c.state),
    country: c.country.trim(),
    logoUrl: toNullableString(c.logoUrl),
    bannerUrl: toNullableString(c.bannerUrl),
    featured: c.featured,
    published: c.published,
  } satisfies Prisma.ConferenceCreateInput;
}

/** Nested child creates shared by createConference and updateConference. */
function buildNestedChildren(draft: ConferenceDraft) {
  return {
    committees: {
      create: draft.committees.map((committee, index) => ({
        name: committee.name.trim(),
        topic: toNullableString(committee.topic),
        description: toNullableString(committee.description),
        difficulty: committee.difficulty,
        maxDelegates: toNullableNumber(committee.maxDelegates),
        countryMatrix: {
          create: (committee.countryMatrix ?? []).map((entry) => ({
            country: entry.country.trim(),
            seats: toNullableNumber(entry.seats) ?? 1,
          })),
        },
        createdAt: new Date(Date.now() + index),
      })),
    },
    agenda: {
      create: draft.agenda.map((item) => ({
        title: item.title.trim(),
        description: toNullableString(item.description),
        startAt: new Date(item.startAt),
        endAt: toNullableDate(item.endAt),
        sortOrder: toNullableNumber(item.sortOrder) ?? 0,
      })),
    },
    brochures: {
      create: draft.brochures.map((brochure) => ({
        title: toNullableString(brochure.title),
        fileName: brochure.fileName?.trim() || "brochure.pdf",
        mimeType: brochure.mimeType?.trim() || "application/pdf",
        sizeBytes: toNullableNumber(brochure.sizeBytes) ?? 0,
        fileUrl: brochure.fileUrl.trim(),
      })),
    },
    gallery: {
      create: draft.gallery.map((image, index) => ({
        url: image.url.trim(),
        alt: toNullableString(image.alt),
        caption: toNullableString(image.caption),
        sortOrder: index,
      })),
    },
    socialLinks: {
      create: draft.socialLinks.map((link) => ({
        platform: link.platform,
        url: link.url.trim(),
      })),
    },
    awards: {
      create: draft.awards.map((award, index) => ({
        name: award.name.trim(),
        description: toNullableString(award.description),
        sortOrder: index,
      })),
    },
    faqs: {
      create: draft.faqs.map((faq, index) => ({
        question: faq.question.trim(),
        answer: faq.answer.trim(),
        sortOrder: index,
      })),
    },
    secretariat: {
      create: draft.secretariat.map((member, index) => ({
        name: member.name.trim(),
        role: member.role.trim(),
        photoUrl: toNullableString(member.photoUrl),
        bio: toNullableString(member.bio),
        sortOrder: index,
      })),
    },
  };
}

export async function createConference(
  draft: ConferenceDraft,
): Promise<ActionState<{ slug: string }>> {
  try {
    await requireAdmin();
    conferenceInputSchema.parse(draft.conference);
    conferenceChildrenSchema.parse(draft);

    const existing = await getDb().conference.findUnique({
      where: { slug: draft.conference.slug.trim() },
      select: { id: true },
    });
    if (existing) {
      return {
        status: "error",
        message: "That slug is already used by another conference.",
        fieldErrors: { slug: ["This slug is taken."] },
      };
    }

    const organizerName = draft.organizer?.name?.trim();
    let organizerId: string | null = null;
    if (organizerName) {
      const organizer = await getDb().organizer.create({
        data: {
          name: organizerName,
          description: toNullableString(draft.organizer.description),
          school: toNullableString(draft.organizer.school),
          university: toNullableString(draft.organizer.university),
          website: toNullableString(draft.organizer.website),
          email: toNullableString(draft.organizer.email),
          instagram: toNullableString(draft.organizer.instagram),
          logoUrl: toNullableString(draft.organizer.logoUrl),
        },
      });
      organizerId = organizer.id;
    }

    const conference = await getDb().conference.create({
      data: {
        ...buildConferenceData(draft),
        organizerId,
        venue: draft.venue?.name?.trim()
          ? {
              create: {
                name: draft.venue.name.trim(),
                address: toNullableString(draft.venue.address),
                city: draft.venue.city.trim(),
                state: toNullableString(draft.venue.state),
                country: draft.venue.country.trim(),
                latitude: toNullableNumber(draft.venue.latitude),
                longitude: toNullableNumber(draft.venue.longitude),
                mapsUrl: toNullableString(draft.venue.mapsUrl),
              },
            }
          : undefined,
        ...buildNestedChildren(draft),
      },
    });

    revalidatePath("/discover");
    revalidatePath("/admin/conferences");
    return ok("Conference created.", { slug: conference.slug });
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateConference(
  id: string,
  draft: ConferenceDraft,
): Promise<ActionState<{ slug: string }>> {
  try {
    await requireAdmin();
    conferenceInputSchema.parse(draft.conference);
    conferenceChildrenSchema.parse(draft);

    const existing = await getDb().conference.findUnique({ where: { id } });
    if (!existing) {
      return { status: "error", message: "Conference not found." };
    }

    const slug = draft.conference.slug.trim() || slugify(draft.conference.name);
    if (slug !== existing.slug) {
      const taken = await getDb().conference.findUnique({ where: { slug } });
      if (taken) {
        return {
          status: "error",
          message: "That slug is already used by another conference.",
          fieldErrors: { slug: ["This slug is taken."] },
        };
      }
    }

    const conference = await getDb().$transaction(async (tx) => {
      const organizerName = draft.organizer?.name?.trim();
      let organizerId: string | null = existing.organizerId;
      if (organizerName) {
        if (existing.organizerId) {
          await tx.organizer.update({
            where: { id: existing.organizerId },
            data: {
              name: organizerName,
              description: toNullableString(draft.organizer.description),
              school: toNullableString(draft.organizer.school),
              university: toNullableString(draft.organizer.university),
              website: toNullableString(draft.organizer.website),
              email: toNullableString(draft.organizer.email),
              instagram: toNullableString(draft.organizer.instagram),
              logoUrl: toNullableString(draft.organizer.logoUrl),
            },
          });
        } else {
          const organizer = await tx.organizer.create({
            data: {
              name: organizerName,
              description: toNullableString(draft.organizer.description),
              school: toNullableString(draft.organizer.school),
              university: toNullableString(draft.organizer.university),
              website: toNullableString(draft.organizer.website),
              email: toNullableString(draft.organizer.email),
              instagram: toNullableString(draft.organizer.instagram),
              logoUrl: toNullableString(draft.organizer.logoUrl),
            },
          });
          organizerId = organizer.id;
        }
      }

      const data = buildConferenceData(draft) as unknown as Prisma.ConferenceUpdateInput;
      data.organizer = organizerId ? { connect: { id: organizerId } } : { disconnect: true };
      data.venue = draft.venue?.name?.trim()
        ? {
            upsert: {
              create: {
                name: draft.venue.name.trim(),
                address: toNullableString(draft.venue.address),
                city: draft.venue.city.trim(),
                state: toNullableString(draft.venue.state),
                country: draft.venue.country.trim(),
                latitude: toNullableNumber(draft.venue.latitude),
                longitude: toNullableNumber(draft.venue.longitude),
                mapsUrl: toNullableString(draft.venue.mapsUrl),
              },
              update: {
                name: draft.venue.name.trim(),
                address: toNullableString(draft.venue.address),
                city: draft.venue.city.trim(),
                state: toNullableString(draft.venue.state),
                country: draft.venue.country.trim(),
                latitude: toNullableNumber(draft.venue.latitude),
                longitude: toNullableNumber(draft.venue.longitude),
                mapsUrl: toNullableString(draft.venue.mapsUrl),
              },
            },
          }
        : { delete: true };

      await tx.conferenceCommittee.deleteMany({ where: { conferenceId: id } });
      await tx.agendaItem.deleteMany({ where: { conferenceId: id } });
      await tx.brochure.deleteMany({ where: { conferenceId: id } });
      await tx.galleryImage.deleteMany({ where: { conferenceId: id } });
      await tx.conferenceSocialLink.deleteMany({ where: { conferenceId: id } });
      await tx.conferenceAward.deleteMany({ where: { conferenceId: id } });
      await tx.conferenceFaq.deleteMany({ where: { conferenceId: id } });
      await tx.secretariat.deleteMany({ where: { conferenceId: id } });

      return tx.conference.update({
        where: { id },
        data: {
          ...data,
          slug,
          ...buildNestedChildren(draft),
        },
      });
    });

    revalidatePath("/discover");
    revalidatePath(`/conference/${slug}`);
    revalidatePath("/admin/conferences");
    return ok("Conference updated.", { slug: conference.slug });
  } catch (error) {
    return toActionError(error);
  }
}

export async function toggleConferencePublished(id: string): Promise<ActionState<{ published: boolean }>> {
  try {
    await requireAdmin();
    const conference = await getDb().conference.findUnique({
      where: { id },
      select: { published: true },
    });
    if (!conference) return fail("Conference not found.");
    const published = !conference.published;
    await getDb().conference.update({ where: { id }, data: { published } });
    revalidatePath("/discover");
    revalidatePath("/admin/conferences");
    return ok(published ? "Conference published." : "Conference moved to draft.", { published });
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteConference(id: string): Promise<ActionState> {
  try {
    await requireAdmin();
    await getDb().conference.delete({ where: { id } });
    revalidatePath("/discover");
    revalidatePath("/admin/conferences");
    return ok("Conference deleted.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function listOrganizers(): Promise<ActionState<{ id: string; name: string }[]>> {
  try {
    const organizers = await getDb().organizer.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return ok("ok", organizers);
  } catch (error) {
    return toActionError(error);
  }
}
