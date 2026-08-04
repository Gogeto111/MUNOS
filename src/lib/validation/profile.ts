import { z } from "zod";
import { ExperienceLevel, SocialPlatform } from "@/generated/prisma/browser";
import { COUNTRIES_SET } from "@/lib/constants";

const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .refine((v) => !v || z.string().url().safeParse(v).success, {
    message: "Enter a valid URL",
  });

const optionalYear = z
  .string()
  .trim()
  .max(4)
  .optional()
  .refine((v) => !v || /^\d{4}$/.test(v), { message: "Enter a year like 2025" })
  .refine((v) => !v || (Number(v) >= 1950 && Number(v) <= 2100), {
    message: "Year must be between 1950 and 2100",
  });

export const personalInfoSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  username: z
    .string()
    .trim()
    .min(3, "At least 3 characters")
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
  bio: z.string().trim().max(1000, "Must be under 1000 characters").optional(),
  school: z.string().trim().max(200).optional(),
  university: z.string().trim().max(200).optional(),
  grade: z.string().trim().max(50).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  country: z.string().trim().max(100).optional(),
  avatarUrl: optionalUrl,
  interests: z.string().trim().max(2000).optional(),
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;

export function parseInterests(raw: string | undefined): string[] {
  if (!raw) return [];
  return [
    ...new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
}

const optionalCount = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^\d{1,5}$/.test(v), { message: "Enter a whole number" })
  .refine((v) => !v || (Number(v) >= 0 && Number(v) <= 10000), {
    message: "Enter a number between 0 and 10000",
  });

export const munProfileSchema = z.object({
  experienceLevel: z.nativeEnum(ExperienceLevel),
  munsAttended: optionalCount,
  awardsWon: optionalCount,
});

export type MunProfileInput = z.infer<typeof munProfileSchema>;

export const awardSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  issuer: z.string().trim().max(200).optional(),
  category: z.string().trim().max(100).optional(),
  year: optionalYear.optional(),
  description: z.string().trim().max(1000).optional(),
});

export type AwardInput = z.infer<typeof awardSchema>;

export const committeeSchema = z.object({
  name: z.string().trim().min(1, "Committee is required").max(200),
  role: z.string().trim().min(1, "Role is required").max(100),
  conferenceName: z.string().trim().max(200).optional(),
  year: optionalYear.optional(),
  description: z.string().trim().max(1000).optional(),
});

export type CommitteeInput = z.infer<typeof committeeSchema>;

export const countrySchema = z.object({
  country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .refine((v) => COUNTRIES_SET.has(v), { message: "Pick a country from the list" }),
  conferenceName: z.string().trim().max(200).optional(),
  year: optionalYear.optional(),
});

export type CountryInput = z.infer<typeof countrySchema>;

export const socialLinkSchema = z.object({
  platform: z.nativeEnum(SocialPlatform),
  url: z.string().trim().min(1, "URL is required").max(2000),
});

export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
