"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, toActionError, type ActionState } from "@/lib/actions";

export async function exportUserData(): Promise<ActionState<Record<string, unknown>>> {
  try {
    const user = await requireUser();
    const db = getDb();

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { email: true },
    });

    const [awards, certificates, committees, countries, socialLinks, notifications, activities, workspaces] =
      await Promise.all([
        db.award.findMany({ where: { userId: user.id } }),
        db.certificate.findMany({ where: { userId: user.id } }),
        db.committee.findMany({ where: { userId: user.id } }),
        db.countryRepresented.findMany({ where: { userId: user.id } }),
        db.socialLink.findMany({ where: { userId: user.id } }),
        db.notification.findMany({ where: { userId: user.id } }),
        db.activity.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
        db.workspace.findMany({ where: { userId: user.id } }),
      ]);

    return ok("Data exported.", {
      user: {
        id: user.id,
        email: dbUser?.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        bio: user.bio,
        school: user.school,
        university: user.university,
        grade: user.grade,
        city: user.city,
        state: user.state,
        country: user.country,
        interests: user.interests,
        role: user.role,
      },
      awards,
      certificates,
      committees,
      countries,
      socialLinks,
      notifications,
      activities,
      workspaceCount: workspaces.length,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteAccount(): Promise<ActionState> {
  try {
    const user = await requireUser();
    const db = getDb();

    await db.$transaction(async (tx) => {
      await tx.videoCoachSession.deleteMany({ where: { userId: user.id } });
      await tx.committeeSimulation.deleteMany({ where: { userId: user.id } });
      await tx.postComment.deleteMany({ where: { userId: user.id } });
      await tx.postLike.deleteMany({ where: { userId: user.id } });
      await tx.post.deleteMany({ where: { userId: user.id } });
      await tx.achievementBadge.deleteMany({ where: { userId: user.id } });
      await tx.userFollow.deleteMany({ where: { followerId: user.id } });
      await tx.userFollow.deleteMany({ where: { followingId: user.id } });
      await tx.reminder.deleteMany({ where: { userId: user.id } });
      await tx.review.deleteMany({ where: { userId: user.id } });
      await tx.bookmark.deleteMany({ where: { userId: user.id } });
      await tx.activity.deleteMany({ where: { userId: user.id } });
      await tx.notification.deleteMany({ where: { userId: user.id } });
      await tx.award.deleteMany({ where: { userId: user.id } });
      await tx.certificate.deleteMany({ where: { userId: user.id } });
      await tx.committee.deleteMany({ where: { userId: user.id } });
      await tx.countryRepresented.deleteMany({ where: { userId: user.id } });
      await tx.socialLink.deleteMany({ where: { userId: user.id } });
      await tx.munProfile.deleteMany({ where: { userId: user.id } });
      await tx.userSettings.deleteMany({ where: { userId: user.id } });

      await tx.workspaceAttachment.deleteMany({
        where: { workspace: { userId: user.id } },
      });
      await tx.aiChunk.deleteMany({
        where: { document: { workspace: { userId: user.id } } },
      });
      await tx.aiDocument.deleteMany({
        where: { workspace: { userId: user.id } },
      });
      await tx.aiMemory.deleteMany({
        where: { workspace: { userId: user.id } },
      });
      await tx.aiScore.deleteMany({
        where: { workspace: { userId: user.id } },
      });
      await tx.positionPaper.deleteMany({
        where: { committee: { workspace: { userId: user.id } } },
      });
      await tx.resolution.deleteMany({
        where: { workspace: { userId: user.id } },
      });
      await tx.workspaceTask.deleteMany({
        where: { workspace: { userId: user.id } },
      });
      await tx.timelineEvent.deleteMany({
        where: { workspace: { userId: user.id } },
      });
      await tx.workspaceCommittee.deleteMany({
        where: { workspace: { userId: user.id } },
      });
      await tx.note.deleteMany({
        where: { workspace: { userId: user.id } },
      });
      await tx.folder.deleteMany({
        where: { workspace: { userId: user.id } },
      });
      await tx.workspace.deleteMany({ where: { userId: user.id } });
      await tx.user.delete({ where: { id: user.id } });
    });

    revalidatePath("/");
    return ok("Account deleted.");
  } catch (error) {
    return toActionError(error);
  }
}
