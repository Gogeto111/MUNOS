import { NextResponse } from "next/server";
import { getDb } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getDb().user.findUnique({
      where: { id: user.id },
      include: {
        munProfile: true,
        settings: true,
        awards: true,
        certificates: true,
        committees: true,
        countries: true,
        socialLinks: true,
        workspaces: {
          select: {
            id: true,
            title: true,
            description: true,
            createdAt: true,
          },
        },
        posts: {
          select: {
            id: true,
            content: true,
            visibility: true,
            createdAt: true,
          },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        username: dbUser.username,
        phoneNumber: dbUser.phoneNumber,
        bio: dbUser.bio,
        school: dbUser.school,
        university: dbUser.university,
        grade: dbUser.grade,
        city: dbUser.city,
        state: dbUser.state,
        country: dbUser.country,
        interests: dbUser.interests,
        role: dbUser.role,
        avatarUrl: dbUser.avatarUrl,
        createdAt: dbUser.createdAt,
      },
      munProfile: dbUser.munProfile,
      awards: dbUser.awards,
      certificates: dbUser.certificates.map((c) => ({
        id: c.id,
        title: c.title,
        issuer: c.issuer,
        category: c.category,
        issueYear: c.issueYear,
        description: c.description,
        fileName: c.fileName,
        fileUrl: c.fileUrl,
        createdAt: c.createdAt,
      })),
      committees: dbUser.committees,
      countries: dbUser.countries,
      socialLinks: dbUser.socialLinks,
      settings: dbUser.settings,
      workspaces: dbUser.workspaces,
      posts: dbUser.posts,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="munos-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    logger.error("Account export error", { error: String(error) });
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 },
    );
  }
}
