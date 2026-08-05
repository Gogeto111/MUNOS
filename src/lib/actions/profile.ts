"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, toActionError, type ActionState } from "@/lib/actions";
import { ActivityType } from "@/generated/prisma/client";
import {
  awardSchema,
  committeeSchema,
  countrySchema,
  munProfileSchema,
  parseInterests,
  personalInfoSchema,
  socialLinkSchema,
  type AwardInput,
  type CommitteeInput,
  type CountryInput,
  type MunProfileInput,
  type PersonalInfoInput,
  type SocialLinkInput,
} from "@/lib/validation/profile";

async function recordActivity(
  userId: string,
  type: ActivityType,
  message: string,
) {
  await getDb().activity
    .create({ data: { userId, type, message } })
    .catch(() => undefined);
}

function normalizeEmptyString(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function updatePersonalInfo(
  input: PersonalInfoInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = personalInfoSchema.parse(input);

    if (parsed.username !== user.username) {
      const taken = await getDb().user.findUnique({
        where: { username: parsed.username },
        select: { id: true },
      });
      if (taken) {
        return {
          status: "error",
          message: "That username is already taken.",
          fieldErrors: { username: ["That username is already taken."] },
        };
      }
    }

    await getDb().user.update({
      where: { id: user.id },
      data: {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        username: parsed.username,
        bio: normalizeEmptyString(parsed.bio),
        school: normalizeEmptyString(parsed.school),
        university: normalizeEmptyString(parsed.university),
        grade: normalizeEmptyString(parsed.grade),
        city: normalizeEmptyString(parsed.city),
        state: normalizeEmptyString(parsed.state),
        country: normalizeEmptyString(parsed.country),
        avatarUrl: normalizeEmptyString(parsed.avatarUrl),
        interests: parseInterests(parsed.interests),
      },
    });

    await recordActivity(user.id, "PROFILE_UPDATED", "Updated personal information");
    revalidatePath("/profile");
    return ok("Personal info saved.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateMunProfile(
  input: MunProfileInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = munProfileSchema.parse(input);

    await getDb().munProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        experienceLevel: parsed.experienceLevel,
        munsAttended: parsed.munsAttended ? Number(parsed.munsAttended) : 0,
        awardsWon: parsed.awardsWon ? Number(parsed.awardsWon) : 0,
      },
      update: {
        experienceLevel: parsed.experienceLevel,
        munsAttended: parsed.munsAttended ? Number(parsed.munsAttended) : 0,
        awardsWon: parsed.awardsWon ? Number(parsed.awardsWon) : 0,
      },
    });

    await recordActivity(user.id, "MUN_PROFILE_UPDATED", "Updated MUN profile");
    revalidatePath("/profile");
    return ok("MUN profile saved.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function addAward(input: AwardInput): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = awardSchema.parse(input);

    await getDb().award.create({
      data: {
        userId: user.id,
        title: parsed.title,
        issuer: normalizeEmptyString(parsed.issuer),
        category: normalizeEmptyString(parsed.category),
        year: parsed.year ? Number(parsed.year) : null,
        description: normalizeEmptyString(parsed.description),
      },
    });

    await recordActivity(user.id, "AWARD_ADDED", `Added award: ${parsed.title}`);
    revalidatePath("/profile");
    return ok("Award added.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteAward(id: string): Promise<ActionState> {
  try {
    const user = await requireUser();
    await getDb().award.deleteMany({
      where: { id, userId: user.id },
    });
    await recordActivity(user.id, "AWARD_REMOVED", "Removed an award");
    revalidatePath("/profile");
    return ok("Award removed.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function addCommittee(input: CommitteeInput): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = committeeSchema.parse(input);

    await getDb().committee.create({
      data: {
        userId: user.id,
        name: parsed.name,
        role: parsed.role,
        conferenceName: normalizeEmptyString(parsed.conferenceName),
        year: parsed.year ? Number(parsed.year) : null,
        description: normalizeEmptyString(parsed.description),
      },
    });

    await recordActivity(user.id, "COMMITTEE_ADDED", `Added committee: ${parsed.name}`);
    revalidatePath("/profile");
    return ok("Committee added.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteCommittee(id: string): Promise<ActionState> {
  try {
    const user = await requireUser();
    await getDb().committee.deleteMany({
      where: { id, userId: user.id },
    });
    await recordActivity(user.id, "COMMITTEE_REMOVED", "Removed a committee");
    revalidatePath("/profile");
    return ok("Committee removed.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function addCountry(input: CountryInput): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = countrySchema.parse(input);

    await getDb().countryRepresented.create({
      data: {
        userId: user.id,
        country: parsed.country,
        conferenceName: normalizeEmptyString(parsed.conferenceName),
        year: parsed.year ? Number(parsed.year) : null,
      },
    });

    await recordActivity(user.id, "COUNTRY_ADDED", `Represented: ${parsed.country}`);
    revalidatePath("/profile");
    return ok("Country added.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteCountry(id: string): Promise<ActionState> {
  try {
    const user = await requireUser();
    await getDb().countryRepresented.deleteMany({
      where: { id, userId: user.id },
    });
    await recordActivity(user.id, "COUNTRY_REMOVED", "Removed a country");
    revalidatePath("/profile");
    return ok("Country removed.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function addSocialLink(
  input: SocialLinkInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = socialLinkSchema.parse(input);

    await getDb().socialLink.create({
      data: { userId: user.id, platform: parsed.platform, url: parsed.url },
    });

    await recordActivity(user.id, "SOCIAL_LINK_UPDATED", "Added a social link");
    revalidatePath("/profile");
    return ok("Social link added.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteSocialLink(id: string): Promise<ActionState> {
  try {
    const user = await requireUser();
    await getDb().socialLink.deleteMany({
      where: { id, userId: user.id },
    });
    await recordActivity(user.id, "SOCIAL_LINK_UPDATED", "Removed a social link");
    revalidatePath("/profile");
    return ok("Social link removed.");
  } catch (error) {
    return toActionError(error);
  }
}

export interface SettingsInput {
  theme?: string;
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  certificateUploads?: boolean;
  newFeatures?: boolean;
  eventReminders?: boolean;
  profilePublic?: boolean;
  showAwards?: boolean;
  showCertificates?: boolean;
  showStats?: boolean;
}

export async function updateSettings(
  input: SettingsInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await getDb().userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...input,
      },
      update: input,
    });
    revalidatePath("/settings");
    return ok("Settings updated.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function getSettings(): Promise<
  ActionState<{
    theme: string;
    notificationsEnabled: boolean;
    emailNotifications: boolean;
    certificateUploads: boolean;
    newFeatures: boolean;
    eventReminders: boolean;
    profilePublic: boolean;
    showAwards: boolean;
    showCertificates: boolean;
    showStats: boolean;
  }>
> {
  try {
    const user = await requireUser();
    const settings = await getDb().userSettings.findUnique({
      where: { userId: user.id },
    });
    if (!settings) {
      return ok("Default settings.", {
        theme: "system",
        notificationsEnabled: true,
        emailNotifications: true,
        certificateUploads: true,
        newFeatures: true,
        eventReminders: true,
        profilePublic: true,
        showAwards: true,
        showCertificates: true,
        showStats: true,
      });
    }
    return ok("Settings loaded.", {
      theme: settings.theme,
      notificationsEnabled: settings.notificationsEnabled,
      emailNotifications: settings.emailNotifications,
      certificateUploads: settings.certificateUploads,
      newFeatures: settings.newFeatures,
      eventReminders: settings.eventReminders,
      profilePublic: settings.profilePublic,
      showAwards: settings.showAwards,
      showCertificates: settings.showCertificates,
      showStats: settings.showStats,
    });
  } catch (error) {
    return toActionError(error);
  }
}

export async function getCertificates(): Promise<
  ActionState<
    Array<{
      id: string;
      title: string;
      issuer: string | null;
      category: string;
      issueYear: number | null;
      fileName: string;
      fileUrl: string;
      description: string | null;
      createdAt: string;
    }>
  >
> {
  try {
    const user = await requireUser();
    const certificates = await getDb().certificate.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return ok(
      "Certificates loaded.",
      certificates.map((c) => ({
        id: c.id,
        title: c.title,
        issuer: c.issuer,
        category: c.category,
        issueYear: c.issueYear,
        fileName: c.fileName,
        fileUrl: c.fileUrl,
        description: c.description,
        createdAt: c.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    return toActionError(error);
  }
}

export async function getUserPortfolio(): Promise<
  ActionState<{
    name: string;
    role: string;
    awards: Array<{ title: string; issuer: string | null; category: string | null; year: number | null }>;
    certificates: Array<{ title: string; issuer: string | null; category: string; year: number | null }>;
    committees: Array<{ name: string; role: string; conferenceName: string | null; year: number | null }>;
    countries: Array<{ country: string; conferenceName: string | null }>;
    stats: { awards: number; certificates: number; committees: number; countries: number };
  }>
> {
  try {
    const user = await requireUser();
    const [awards, certificates, committees, countries] = await Promise.all([
      getDb().award.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      getDb().certificate.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      getDb().committee.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      getDb().countryRepresented.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    ]);

    return ok("Portfolio loaded.", {
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Anonymous",
      role: user.role,
      awards: awards.map((a) => ({ title: a.title, issuer: a.issuer, category: a.category, year: a.year })),
      certificates: certificates.map((c) => ({ title: c.title, issuer: c.issuer, category: c.category, year: c.issueYear })),
      committees: committees.map((c) => ({ name: c.name, role: c.role, conferenceName: c.conferenceName, year: c.year })),
      countries: countries.map((c) => ({ country: c.country, conferenceName: c.conferenceName })),
      stats: {
        awards: awards.length,
        certificates: certificates.length,
        committees: committees.length,
        countries: countries.length,
      },
    });
  } catch (error) {
    return toActionError(error);
  }
}
