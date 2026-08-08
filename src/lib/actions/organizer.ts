"use server";

import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";

export async function getOrganizerStats(): Promise<
  ActionState<{
    totalConferences: number;
    totalDelegates: number;
    totalCertificates: number;
    totalWorkspaces: number;
    upcomingConferences: number;
  }>
> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");
    if (user.role !== "ADMIN") return fail("Organizer access required.");

    const db = getDb();

    const [totalConferences, totalDelegates, totalCertificates, totalWorkspaces, upcomingConferences] =
      await Promise.all([
        db.conference.count(),
        db.user.count({ where: { role: "DELEGATE" } }),
        db.certificate.count(),
        db.workspace.count(),
        db.conference.count({
          where: {
            published: true,
            registrationOpen: true,
            startDate: { gt: new Date() },
          },
        }),
      ]);

    return ok("Stats loaded.", {
      totalConferences,
      totalDelegates,
      totalCertificates,
      totalWorkspaces,
      upcomingConferences,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load stats.");
  }
}

export async function getConferenceRegistrations(
  conferenceId: string,
): Promise<
  ActionState<
    Array<{
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      country: string | null;
      registeredAt: string;
      workspaceId: string;
    }>
  >
> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");
    if (user.role !== "ADMIN") return fail("Organizer access required.");

    const db = getDb();

    const conference = await db.conference.findFirst({
      where: { id: conferenceId },
      select: { id: true, name: true },
    });
    if (!conference) return fail("Conference not found.");

    const workspaces = await db.workspace.findMany({
      where: { conferenceId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            country: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const registrations = workspaces
      .filter((w) => w.user !== null)
      .map((w) => ({
        id: w.user.id,
        firstName: w.user.firstName,
        lastName: w.user.lastName,
        email: w.user.email,
        country: w.user.country,
        registeredAt: w.createdAt.toISOString(),
        workspaceId: w.id,
      }));

    return ok("Loaded.", registrations);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load registrations.");
  }
}

export async function generateCertificate(
  conferenceId: string,
  delegateId: string,
): Promise<ActionState<{ certificateId: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");
    if (user.role !== "ADMIN") return fail("Organizer access required.");

    const db = getDb();

    const conference = await db.conference.findFirst({
      where: { id: conferenceId },
      select: { name: true },
    });
    if (!conference) return fail("Conference not found.");

    const delegate = await db.user.findFirst({
      where: { id: delegateId },
      select: { firstName: true, lastName: true },
    });
    if (!delegate) return fail("Delegate not found.");

    const existing = await db.certificate.findFirst({
      where: {
        userId: delegateId,
        title: { contains: conference.name },
      },
    });
    if (existing) return fail("Certificate already issued for this delegate.");

    const certificate = await db.certificate.create({
      data: {
        userId: delegateId,
        title: `Certificate of Participation — ${conference.name}`,
        issuer: conference.name,
        category: "PARTICIPATION",
        issueYear: new Date().getFullYear(),
        fileName: `certificate-${conferenceId}-${delegateId}.pdf`,
        mimeType: "application/pdf",
        sizeBytes: 0,
        fileUrl: "",
        fileKey: "",
        description: `Participation certificate for ${delegate.firstName ?? ""} ${delegate.lastName ?? ""} at ${conference.name}`,
      },
    });

    return ok("Certificate generated.", { certificateId: certificate.id });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to generate certificate.");
  }
}

export async function bulkGenerateCertificates(
  conferenceId: string,
): Promise<ActionState<{ generated: number }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");
    if (user.role !== "ADMIN") return fail("Organizer access required.");

    const db = getDb();

    const conference = await db.conference.findFirst({
      where: { id: conferenceId },
      select: { id: true, name: true },
    });
    if (!conference) return fail("Conference not found.");

    const workspaces = await db.workspace.findMany({
      where: { conferenceId },
      select: {
        userId: true,
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    const delegateIds = workspaces
      .filter((w) => w.user !== null)
      .map((w) => w.userId);

    if (delegateIds.length === 0) {
      return ok("No delegates registered for this conference.", { generated: 0 });
    }

    const existingCerts = await db.certificate.findMany({
      where: {
        userId: { in: delegateIds },
        title: { contains: conference.name },
      },
      select: { userId: true },
    });

    const existingUserIds = new Set(existingCerts.map((c) => c.userId));
    const newDelegates = workspaces.filter(
      (w) => w.user !== null && !existingUserIds.has(w.userId),
    );

    if (newDelegates.length === 0) {
      return ok("All delegates already have certificates.", { generated: 0 });
    }

    const certificates = await db.certificate.createMany({
      data: newDelegates.map((w) => ({
        userId: w.userId,
        title: `Certificate of Participation — ${conference.name}`,
        issuer: conference.name,
        category: "PARTICIPATION" as const,
        issueYear: new Date().getFullYear(),
        fileName: `certificate-${conferenceId}-${w.userId}.pdf`,
        mimeType: "application/pdf",
        sizeBytes: 0,
        fileUrl: "",
        fileKey: "",
        description: `Participation certificate for ${w.user!.firstName ?? ""} ${w.user!.lastName ?? ""} at ${conference.name}`,
      })),
    });

    return ok(`Generated ${certificates.count} certificate(s).`, {
      generated: certificates.count,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to generate certificates.");
  }
}

export async function getConferenceDelegatesWithCerts(
  conferenceId: string,
): Promise<
  ActionState<{
    totalDelegates: number;
    totalWithCerts: number;
    totalWithoutCerts: number;
    delegates: Array<{
      id: string;
      firstName: string | null;
      lastName: string | null;
      hasCert: boolean;
    }>;
  }>
> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");
    if (user.role !== "ADMIN") return fail("Organizer access required.");

    const db = getDb();

    const conference = await db.conference.findFirst({
      where: { id: conferenceId },
      select: { id: true, name: true },
    });
    if (!conference) return fail("Conference not found.");

    const workspaces = await db.workspace.findMany({
      where: { conferenceId },
      select: {
        userId: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const delegateIds = workspaces
      .filter((w) => w.user !== null)
      .map((w) => w.userId);

    const existingCerts = await db.certificate.findMany({
      where: {
        userId: { in: delegateIds },
        title: { contains: conference.name },
      },
      select: { userId: true },
    });

    const certUserIds = new Set(existingCerts.map((c) => c.userId));

    const delegates = workspaces
      .filter((w) => w.user !== null)
      .map((w) => ({
        id: w.user!.id,
        firstName: w.user!.firstName,
        lastName: w.user!.lastName,
        hasCert: certUserIds.has(w.userId),
      }));

    const totalWithCerts = delegates.filter((d) => d.hasCert).length;

    return ok("Loaded.", {
      totalDelegates: delegates.length,
      totalWithCerts,
      totalWithoutCerts: delegates.length - totalWithCerts,
      delegates,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load delegate data.");
  }
}

export async function getOrganizerConferences(): Promise<
  ActionState<
    Array<{
      id: string;
      name: string;
      slug: string;
      startDate: string;
      endDate: string;
      city: string;
      country: string;
      published: boolean;
      registrationOpen: boolean;
      _count: { workspaces: number; committees: number };
    }>
  >
> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in required.");
    if (user.role !== "ADMIN") return fail("Organizer access required.");

    const db = getDb();

    const conferences = await db.conference.findMany({
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        startDate: true,
        endDate: true,
        city: true,
        country: true,
        published: true,
        registrationOpen: true,
        _count: { select: { workspaces: true, committees: true } },
      },
    });

    return ok(
      "Loaded.",
      conferences.map((c) => ({
        ...c,
        startDate: c.startDate.toISOString(),
        endDate: c.endDate.toISOString(),
      })),
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load conferences.");
  }
}
