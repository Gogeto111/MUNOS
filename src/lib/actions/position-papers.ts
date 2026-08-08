"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail, toActionError, type ActionState } from "@/lib/actions";

async function assertOwnsWorkspace(userId: string, workspaceId: string) {
  const workspace = await getDb().workspace.findFirst({
    where: { id: workspaceId, userId },
    select: { id: true },
  });
  if (!workspace) throw new Error("Workspace not found.");
  return workspace.id;
}

// ---------------------------------------------------------------------------
// Position Papers
// ---------------------------------------------------------------------------

export async function submitPositionPaper(
  workspaceId: string,
  committeeId: string,
  content: string,
  country: string,
): Promise<ActionState<{ paperId: string }>> {
  try {
    const user = await requireUser();
    await assertOwnsWorkspace(user.id, workspaceId);

    const committee = await getDb().workspaceCommittee.findFirst({
      where: { id: committeeId, workspaceId },
      select: { id: true },
    });
    if (!committee) return fail("Committee not found in this workspace.");

    const trimmedContent = content.trim();
    if (!trimmedContent) return fail("Position paper content cannot be empty.");

    const trimmedCountry = country.trim();
    if (!trimmedCountry) return fail("Country is required.");

    const paper = await getDb().positionPaper.upsert({
      where: { committeeId },
      create: {
        committeeId,
        title: `${trimmedCountry} Position Paper`,
        content: trimmedContent,
        status: "COMPLETE",
      },
      update: {
        content: trimmedContent,
        title: `${trimmedCountry} Position Paper`,
        status: "COMPLETE",
      },
    });

    revalidatePath(`/workspaces/${workspaceId}`);
    return ok("Position paper submitted.", { paperId: paper.id });
  } catch (error) {
    return toActionError(error);
  }
}

export async function getPositionPapers(
  workspaceId: string,
): Promise<ActionState<
  { id: string; title: string | null; content: string; status: string; createdAt: Date; committeeName: string }[]
>> {
  try {
    const user = await requireUser();
    await assertOwnsWorkspace(user.id, workspaceId);

    const papers = await getDb().positionPaper.findMany({
      where: { committee: { workspaceId } },
      select: {
        id: true,
        title: true,
        content: true,
        status: true,
        createdAt: true,
        committee: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(
      "ok",
      papers.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        status: p.status,
        createdAt: p.createdAt,
        committeeName: p.committee.name,
      })),
    );
  } catch (error) {
    return toActionError(error);
  }
}

export async function getPositionPaper(
  paperId: string,
): Promise<ActionState<{ id: string; title: string | null; content: string; status: string; createdAt: Date; committeeName: string }>> {
  try {
    const user = await requireUser();

    const paper = await getDb().positionPaper.findUnique({
      where: { id: paperId },
      select: {
        id: true,
        title: true,
        content: true,
        status: true,
        createdAt: true,
        committee: {
          select: {
            name: true,
            workspace: { select: { userId: true } },
          },
        },
      },
    });

    if (!paper) return fail("Position paper not found.");
    if (paper.committee.workspace.userId !== user.id) {
      return fail("You do not have access to this position paper.");
    }

    return ok("ok", {
      id: paper.id,
      title: paper.title,
      content: paper.content,
      status: paper.status,
      createdAt: paper.createdAt,
      committeeName: paper.committee.name,
    });
  } catch (error) {
    return toActionError(error);
  }
}

export async function deletePositionPaper(
  paperId: string,
): Promise<ActionState> {
  try {
    const user = await requireUser();

    const paper = await getDb().positionPaper.findUnique({
      where: { id: paperId },
      select: {
        id: true,
        committee: {
          select: { workspace: { select: { userId: true, id: true } } },
        },
      },
    });

    if (!paper) return fail("Position paper not found.");
    if (paper.committee.workspace.userId !== user.id) {
      return fail("You can only delete your own position papers.");
    }

    await getDb().positionPaper.delete({ where: { id: paperId } });

    revalidatePath(`/workspaces/${paper.committee.workspace.id}`);
    return ok("Position paper deleted.");
  } catch (error) {
    return toActionError(error);
  }
}
