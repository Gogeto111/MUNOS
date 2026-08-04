import { z } from "zod";
import {
  ConferenceFormat,
  ExperienceLevel,
  SocialPlatform,
} from "@/generated/prisma/browser";

const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .or(z.literal(""))
  .refine((v) => !v || z.string().url().safeParse(v).success, {
    message: "Enter a valid URL",
  });

const optionalText = (max: number, message?: string) =>
  z.string().trim().max(max, message).optional().or(z.literal(""));

const optionalNumber = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((v) => !v || /^-?\d{1,9}(\.\d{1,2})?$/.test(v), {
    message: "Enter a valid number",
  });

const optionalCount = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((v) => !v || /^\d{1,6}$/.test(v), { message: "Enter a whole number" });

export const organizerInputSchema = z.object({
  name: z.string().trim().min(1, "Organizer name is required").max(200),
  description: optionalText(2000),
  school: optionalText(200),
  university: optionalText(200),
  website: optionalUrl,
  email: optionalText(200).refine(
    (v) => !v || z.string().email().safeParse(v).success,
    { message: "Enter a valid email" },
  ),
  instagram: optionalUrl,
  logoUrl: optionalUrl,
});
export type OrganizerInput = z.infer<typeof organizerInputSchema>;

export const venueInputSchema = z.object({
  name: z.string().trim().min(1, "Venue name is required").max(200),
  address: optionalText(300),
  city: z.string().trim().min(1, "City is required").max(100),
  state: optionalText(100),
  country: z.string().trim().min(1, "Country is required").max(100),
  latitude: optionalNumber,
  longitude: optionalNumber,
  mapsUrl: optionalUrl,
});
export type VenueInput = z.infer<typeof venueInputSchema>;

export const committeeInputSchema = z.object({
  name: z.string().trim().min(1, "Committee name is required").max(200),
  topic: optionalText(200),
  description: optionalText(2000),
  difficulty: z.nativeEnum(ExperienceLevel),
  maxDelegates: optionalCount,
});
export type CommitteeInput = z.infer<typeof committeeInputSchema>;

export const countryMatrixEntryInputSchema = z.object({
  country: z.string().trim().min(1, "Country is required").max(100),
  seats: optionalCount,
});
export type CountryMatrixEntryInput = z.infer<typeof countryMatrixEntryInputSchema>;

export const agendaItemInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: optionalText(2000),
  startAt: z.string().trim().min(1, "Start time is required"),
  endAt: optionalText(30),
  sortOrder: optionalCount,
});
export type AgendaItemInput = z.infer<typeof agendaItemInputSchema>;

export const brochureInputSchema = z.object({
  title: optionalText(200),
  fileUrl: z.string().trim().min(1, "Brochure file or URL is required").max(2000),
  fileName: optionalText(300),
  mimeType: optionalText(100),
  sizeBytes: optionalCount,
});
export type BrochureInput = z.infer<typeof brochureInputSchema>;

export const galleryImageInputSchema = z.object({
  url: z.string().trim().min(1, "Image URL is required").max(2000),
  alt: optionalText(200),
  caption: optionalText(200),
});
export type GalleryImageInput = z.infer<typeof galleryImageInputSchema>;

export const socialLinkInputSchema = z.object({
  platform: z.nativeEnum(SocialPlatform),
  url: z.string().trim().min(1, "URL is required").max(2000),
});
export type ConferenceSocialLinkInput = z.infer<typeof socialLinkInputSchema>;

export const awardInputSchema = z.object({
  name: z.string().trim().min(1, "Award name is required").max(200),
  description: optionalText(500),
});
export type ConferenceAwardInput = z.infer<typeof awardInputSchema>;

export const faqInputSchema = z.object({
  question: z.string().trim().min(1, "Question is required").max(300),
  answer: z.string().trim().min(1, "Answer is required").max(2000),
});
export type ConferenceFaqInput = z.infer<typeof faqInputSchema>;

export const secretariatInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  role: z.string().trim().min(1, "Role is required").max(200),
  photoUrl: optionalUrl,
  bio: optionalText(1000),
});
export type SecretariatInput = z.infer<typeof secretariatInputSchema>;

export const conferenceInputSchema = z.object({
  name: z.string().trim().min(1, "Conference name is required").max(300),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  tagline: optionalText(200),
  description: z.string().trim().min(1, "Description is required").max(8000),
  theme: optionalText(200),
  format: z.nativeEnum(ConferenceFormat),
  difficulty: z.nativeEnum(ExperienceLevel),
  startDate: z.string().trim().min(1, "Start date is required"),
  endDate: z.string().trim().min(1, "End date is required"),
  registrationOpen: z.boolean(),
  externalDelegates: z.boolean(),
  fee: optionalNumber,
  currency: z.string().trim().min(1).max(3).default("USD"),
  registrationDeadline: optionalText(30),
  capacity: optionalCount,
  website: optionalUrl,
  instagram: optionalUrl,
  email: optionalText(200).refine(
    (v) => !v || z.string().email().safeParse(v).success,
    { message: "Enter a valid email" },
  ),
  school: optionalText(200),
  university: optionalText(200),
  city: z.string().trim().min(1, "City is required").max(100),
  state: optionalText(100),
  country: z.string().trim().min(1, "Country is required").max(100),
  logoUrl: optionalUrl,
  bannerUrl: optionalUrl,
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});
export type ConferenceInput = z.infer<typeof conferenceInputSchema>;

/**
 * Validates the child entities of a conference draft (everything except the
 * `conference` object itself, which is validated separately so its Zod errors
 * keep mapping to the top-level form fields).
 *
 * organizer/venue override their required fields with "empty string allowed"
 * because the action treats an empty organizer name / venue name as "skip
 * this entity". Any provided fields (urls, emails, numbers) are still
 * validated, matching the action's behavior.
 */
const organizerDraftInputSchema = organizerInputSchema.extend({
  name: z.string().trim().max(200).optional().or(z.literal("")),
});

const venueDraftInputSchema = venueInputSchema.extend({
  name: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
});

export const conferenceChildrenSchema = z.object({
  organizer: organizerDraftInputSchema,
  venue: venueDraftInputSchema,
  committees: z.array(
    committeeInputSchema.extend({
      countryMatrix: z.array(countryMatrixEntryInputSchema).default([]),
    }),
  ),
  agenda: z.array(agendaItemInputSchema),
  brochures: z.array(brochureInputSchema),
  gallery: z.array(galleryImageInputSchema),
  socialLinks: z.array(socialLinkInputSchema),
  awards: z.array(awardInputSchema),
  faqs: z.array(faqInputSchema),
  secretariat: z.array(secretariatInputSchema),
});

/**
 * Full conference draft schema used by the admin form. Structurally mirrors
 * the `ConferenceDraft` type consumed by createConference/updateConference.
 */
export const conferenceDraftSchema = z
  .object({ conference: conferenceInputSchema })
  .merge(conferenceChildrenSchema);
export type ConferenceDraftInput = z.infer<typeof conferenceDraftSchema>;
export type ConferenceDraftFormValues = z.input<typeof conferenceDraftSchema>;

export const reviewInputSchema = z.object({
  rating: z.number().int().min(1, "Pick a rating").max(5),
  title: z.string().trim().max(200).optional().or(z.literal("")),
  body: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type ReviewInput = z.infer<typeof reviewInputSchema>;

export const reminderInputSchema = z.object({
  type: z.enum(["REGISTRATION_DEADLINE", "COUNTRY_ALLOCATION", "CONFERENCE_STARTS"]),
  remindAt: z.string().trim().min(1, "Reminder date is required"),
});
export type ReminderInput = z.infer<typeof reminderInputSchema>;
