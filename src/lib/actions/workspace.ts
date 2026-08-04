"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { deleteStoredObject } from "@/lib/storage";
import { ok, toActionError, type ActionState } from "@/lib/actions";
import {
  attachmentInputSchema,
  folderInputSchema,
  noteInputSchema,
  positionPaperInputSchema,
  resolutionInputSchema,
  taskInputSchema,
  timelineEventInputSchema,
  workspaceCommitteeInputSchema,
  workspaceInputSchema,
  type AttachmentInput,
  type FolderInput,
  type NoteInput,
  type PositionPaperInput,
  type ResolutionInput,
  type TaskInput,
  type TimelineEventInput,
  type WorkspaceCommitteeInput,
  type WorkspaceInput,
} from "@/lib/validation/workspace";

function revalidateWorkspacePaths(workspaceId: string) {
  revalidatePath("/workspaces");
  revalidatePath(`/workspaces/${workspaceId}`);
}

function normalizeEmptyString(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function assertOwnsWorkspace(userId: string, workspaceId: string) {
  const workspace = await getDb().workspace.findFirst({
    where: { id: workspaceId, userId },
    select: { id: true },
  });
  if (!workspace) throw new Error("Workspace not found.");
  return workspace.id;
}

// ---------------------------------------------------------------------------
// Workspace CRUD
// ---------------------------------------------------------------------------

export async function createWorkspace(input: WorkspaceInput): Promise<ActionState<{ id: string }>> {
  try {
    const user = await requireUser();
    const parsed = workspaceInputSchema.parse(input);

    const workspace = await getDb().workspace.create({
      data: {
        userId: user.id,
        conferenceId: normalizeEmptyString(parsed.conferenceId),
        title: parsed.title,
        description: normalizeEmptyString(parsed.description),
      },
      select: { id: true },
    });

    revalidatePath("/workspaces");
    return ok("Workspace created.", { id: workspace.id });
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateWorkspace(
  workspaceId: string,
  input: WorkspaceInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = workspaceInputSchema.parse(input);
    await assertOwnsWorkspace(user.id, workspaceId);

    await getDb().workspace.update({
      where: { id: workspaceId },
      data: {
        conferenceId: normalizeEmptyString(parsed.conferenceId),
        title: parsed.title,
        description: normalizeEmptyString(parsed.description),
      },
    });

    revalidateWorkspacePaths(workspaceId);
    return ok("Workspace updated.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteWorkspace(workspaceId: string): Promise<ActionState> {
  try {
    const user = await requireUser();
    await assertOwnsWorkspace(user.id, workspaceId);

    const attachments = await getDb().workspaceAttachment.findMany({
      where: { workspaceId },
      select: { fileKey: true },
    });

    await getDb().workspace.delete({ where: { id: workspaceId } });

    // Best-effort cleanup of the stored files (DB rows cascade away).
    await Promise.allSettled(
      attachments.map((a) => deleteStoredObject(a.fileKey)),
    );

    revalidatePath("/workspaces");
    return ok("Workspace deleted.");
  } catch (error) {
    return toActionError(error);
  }
}

// ---------------------------------------------------------------------------
// Folders
// ---------------------------------------------------------------------------

export async function createFolder(
  workspaceId: string,
  input: FolderInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = folderInputSchema.parse(input);
    await assertOwnsWorkspace(user.id, workspaceId);

    if (parsed.parentId) {
      const parent = await getDb().folder.findFirst({
        where: { id: parsed.parentId, workspaceId },
        select: { id: true },
      });
      if (!parent) throw new Error("Parent folder not found.");
    }

    await getDb().folder.create({
      data: {
        workspaceId,
        parentId: normalizeEmptyString(parsed.parentId),
        name: parsed.name,
      },
    });

    revalidateWorkspacePaths(workspaceId);
    return ok("Folder created.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function renameFolder(
  workspaceId: string,
  folderId: string,
  input: FolderInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = folderInputSchema.parse(input);
    await assertOwnsWorkspace(user.id, workspaceId);

    const folder = await getDb().folder.findFirst({
      where: { id: folderId, workspaceId },
      select: { id: true },
    });
    if (!folder) throw new Error("Folder not found.");

    await getDb().folder.update({
      where: { id: folderId },
      data: { name: parsed.name },
    });

    revalidateWorkspacePaths(workspaceId);
    return ok("Folder renamed.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteFolder(
  workspaceId: string,
  folderId: string,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await assertOwnsWorkspace(user.id, workspaceId);

    const folder = await getDb().folder.findFirst({
      where: { id: folderId, workspaceId },
      select: { id: true },
    });
    if (!folder) throw new Error("Folder not found.");

    await getDb().folder.delete({ where: { id: folderId } });

    revalidateWorkspacePaths(workspaceId);
    return ok("Folder deleted.");
  } catch (error) {
    return toActionError(error);
  }
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export async function createNote(
  workspaceId: string,
  input: NoteInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = noteInputSchema.parse(input);
    await assertOwnsWorkspace(user.id, workspaceId);

    if (parsed.folderId) {
      const folder = await getDb().folder.findFirst({
        where: { id: parsed.folderId, workspaceId },
        select: { id: true },
      });
      if (!folder) throw new Error("Folder not found.");
    }

    await getDb().note.create({
      data: {
        workspaceId,
        folderId: normalizeEmptyString(parsed.folderId),
        title: parsed.title,
        content: parsed.content ?? "",
        pinned: parsed.pinned ?? false,
      },
    });

    revalidateWorkspacePaths(workspaceId);
    return ok("Note created.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateNote(
  workspaceId: string,
  noteId: string,
  input: NoteInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = noteInputSchema.parse(input);
    await assertOwnsWorkspace(user.id, workspaceId);

    const note = await getDb().note.findFirst({
      where: { id: noteId, workspaceId },
      select: { id: true },
    });
    if (!note) throw new Error("Note not found.");

    if (parsed.folderId) {
      const folder = await getDb().folder.findFirst({
        where: { id: parsed.folderId, workspaceId },
        select: { id: true },
      });
      if (!folder) throw new Error("Folder not found.");
    }

    await getDb().note.update({
      where: { id: noteId },
      data: {
        folderId: normalizeEmptyString(parsed.folderId),
        title: parsed.title,
        content: parsed.content ?? "",
        pinned: parsed.pinned ?? false,
      },
    });

    revalidateWorkspacePaths(workspaceId);
    return ok("Note saved.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteNote(
  workspaceId: string,
  noteId: string,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await assertOwnsWorkspace(user.id, workspaceId);

    const note = await getDb().note.findFirst({
      where: { id: noteId, workspaceId },
      select: { id: true },
    });
    if (!note) throw new Error("Note not found.");

    await getDb().note.delete({ where: { id: noteId } });

    revalidateWorkspacePaths(workspaceId);
    return ok("Note deleted.");
  } catch (error) {
    return toActionError(error);
  }
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export async function createTask(
  workspaceId: string,
  input: TaskInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = taskInputSchema.parse(input);
    await assertOwnsWorkspace(user.id, workspaceId);

    await getDb().workspaceTask.create({
      data: {
        workspaceId,
        title: parsed.title,
        description: normalizeEmptyString(parsed.description),
        status: parsed.status,
        priority: parsed.priority,
        dueAt: normalizeDate(parsed.dueAt),
      },
    });

    revalidateWorkspacePaths(workspaceId);
    return ok("Task added.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateTask(
  workspaceId: string,
  taskId: string,
  input: TaskInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = taskInputSchema.parse(input);
    await assertOwnsWorkspace(user.id, workspaceId);

    const task = await getDb().workspaceTask.findFirst({
      where: { id: taskId, workspaceId },
      select: { id: true },
    });
    if (!task) throw new Error("Task not found.");

    const done = parsed.status === "DONE";

    await getDb().workspaceTask.update({
      where: { id: taskId },
      data: {
        title: parsed.title,
        description: normalizeEmptyString(parsed.description),
        status: parsed.status,
        priority: parsed.priority,
        dueAt: normalizeDate(parsed.dueAt),
        completedAt: done ? new Date() : null,
      },
    });

    revalidateWorkspacePaths(workspaceId);
    return ok("Task updated.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteTask(
  workspaceId: string,
  taskId: string,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await assertOwnsWorkspace(user.id, workspaceId);

    const task = await getDb().workspaceTask.findFirst({
      where: { id: taskId, workspaceId },
      select: { id: true },
    });
    if (!task) throw new Error("Task not found.");

    await getDb().workspaceTask.delete({ where: { id: taskId } });

    revalidateWorkspacePaths(workspaceId);
    return ok("Task deleted.");
  } catch (error) {
    return toActionError(error);
  }
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

export async function createTimelineEvent(
  workspaceId: string,
  input: TimelineEventInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = timelineEventInputSchema.parse(input);
    await assertOwnsWorkspace(user.id, workspaceId);

    await getDb().timelineEvent.create({
      data: {
        workspaceId,
        title: parsed.title,
        date: new Date(parsed.date),
        description: normalizeEmptyString(parsed.description),
      },
    });

    revalidateWorkspacePaths(workspaceId);
    return ok("Timeline event added.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteTimelineEvent(
  workspaceId: string,
  eventId: string,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await assertOwnsWorkspace(user.id, workspaceId);

    const event = await getDb().timelineEvent.findFirst({
      where: { id: eventId, workspaceId },
      select: { id: true },
    });
    if (!event) throw new Error("Timeline event not found.");

    await getDb().timelineEvent.delete({ where: { id: eventId } });

    revalidateWorkspacePaths(workspaceId);
    return ok("Timeline event deleted.");
  } catch (error) {
    return toActionError(error);
  }
}

// ---------------------------------------------------------------------------
// Committees, position papers, resolutions
// ---------------------------------------------------------------------------

export async function createCommittee(
  workspaceId: string,
  input: WorkspaceCommitteeInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = workspaceCommitteeInputSchema.parse(input);
    await assertOwnsWorkspace(user.id, workspaceId);

    await getDb().workspaceCommittee.create({
      data: {
        workspaceId,
        name: parsed.name,
        topic: normalizeEmptyString(parsed.topic),
        country: normalizeEmptyString(parsed.country),
        role: normalizeEmptyString(parsed.role) ?? "DELEGATE",
      },
    });

    revalidateWorkspacePaths(workspaceId);
    return ok("Committee added.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateCommittee(
  workspaceId: string,
  committeeId: string,
  input: WorkspaceCommitteeInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = workspaceCommitteeInputSchema.parse(input);
    await assertOwnsWorkspace(user.id, workspaceId);

    const committee = await getDb().workspaceCommittee.findFirst({
      where: { id: committeeId, workspaceId },
      select: { id: true },
    });
    if (!committee) throw new Error("Committee not found.");

    await getDb().workspaceCommittee.update({
      where: { id: committeeId },
      data: {
        name: parsed.name,
        topic: normalizeEmptyString(parsed.topic),
        country: normalizeEmptyString(parsed.country),
        role: normalizeEmptyString(parsed.role) ?? "DELEGATE",
      },
    });

    revalidateWorkspacePaths(workspaceId);
    return ok("Committee updated.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteCommittee(
  workspaceId: string,
  committeeId: string,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await assertOwnsWorkspace(user.id, workspaceId);

    const committee = await getDb().workspaceCommittee.findFirst({
      where: { id: committeeId, workspaceId },
      select: { id: true },
    });
    if (!committee) throw new Error("Committee not found.");

    await getDb().workspaceCommittee.delete({ where: { id: committeeId } });

    revalidateWorkspacePaths(workspaceId);
    return ok("Committee deleted.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function updatePositionPaper(
  workspaceId: string,
  committeeId: string,
  input: PositionPaperInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = positionPaperInputSchema.parse(input);
    await assertOwnsWorkspace(user.id, workspaceId);

    const committee = await getDb().workspaceCommittee.findFirst({
      where: { id: committeeId, workspaceId },
      select: { id: true },
    });
    if (!committee) throw new Error("Committee not found.");

    await getDb().positionPaper.upsert({
      where: { committeeId },
      create: {
        committeeId,
        title: normalizeEmptyString(parsed.title),
        content: parsed.content ?? "",
        status: parsed.status,
      },
      update: {
        title: normalizeEmptyString(parsed.title),
        content: parsed.content ?? "",
        status: parsed.status,
      },
    });

    revalidateWorkspacePaths(workspaceId);
    return ok("Position paper saved.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function createResolution(
  workspaceId: string,
  input: ResolutionInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = resolutionInputSchema.parse(input);
    await assertOwnsWorkspace(user.id, workspaceId);

    if (parsed.committeeId) {
      const committee = await getDb().workspaceCommittee.findFirst({
        where: { id: parsed.committeeId, workspaceId },
        select: { id: true },
      });
      if (!committee) throw new Error("Committee not found.");
    }

    await getDb().resolution.create({
      data: {
        workspaceId,
        committeeId: normalizeEmptyString(parsed.committeeId),
        title: parsed.title,
        body: parsed.body ?? "",
        status: parsed.status,
        sponsors: splitSponsors(parsed.sponsors),
      },
    });

    revalidateWorkspacePaths(workspaceId);
    return ok("Resolution created.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateResolution(
  workspaceId: string,
  resolutionId: string,
  input: ResolutionInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = resolutionInputSchema.parse(input);
    await assertOwnsWorkspace(user.id, workspaceId);

    const resolution = await getDb().resolution.findFirst({
      where: { id: resolutionId, workspaceId },
      select: { id: true },
    });
    if (!resolution) throw new Error("Resolution not found.");

    if (parsed.committeeId) {
      const committee = await getDb().workspaceCommittee.findFirst({
        where: { id: parsed.committeeId, workspaceId },
        select: { id: true },
      });
      if (!committee) throw new Error("Committee not found.");
    }

    await getDb().resolution.update({
      where: { id: resolutionId },
      data: {
        committeeId: normalizeEmptyString(parsed.committeeId),
        title: parsed.title,
        body: parsed.body ?? "",
        status: parsed.status,
        sponsors: splitSponsors(parsed.sponsors),
      },
    });

    revalidateWorkspacePaths(workspaceId);
    return ok("Resolution updated.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteResolution(
  workspaceId: string,
  resolutionId: string,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await assertOwnsWorkspace(user.id, workspaceId);

    const resolution = await getDb().resolution.findFirst({
      where: { id: resolutionId, workspaceId },
      select: { id: true },
    });
    if (!resolution) throw new Error("Resolution not found.");

    await getDb().resolution.delete({ where: { id: resolutionId } });

    revalidateWorkspacePaths(workspaceId);
    return ok("Resolution deleted.");
  } catch (error) {
    return toActionError(error);
  }
}

function splitSponsors(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[\n,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Attachments
// ---------------------------------------------------------------------------

export async function registerAttachment(
  workspaceId: string,
  input: AttachmentInput,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = attachmentInputSchema.parse(input);
    await assertOwnsWorkspace(user.id, workspaceId);

    await getDb().workspaceAttachment.create({
      data: {
        workspaceId,
        fileName: parsed.fileName,
        mimeType: parsed.mimeType ?? "application/octet-stream",
        sizeBytes: parsed.sizeBytes ? Number(parsed.sizeBytes) : 0,
        fileUrl: parsed.fileUrl,
        fileKey: parsed.fileKey ?? "",
      },
    });

    revalidateWorkspacePaths(workspaceId);
    return ok("File added.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteAttachment(
  workspaceId: string,
  attachmentId: string,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await assertOwnsWorkspace(user.id, workspaceId);

    const attachment = await getDb().workspaceAttachment.findFirst({
      where: { id: attachmentId, workspaceId },
      select: { id: true, fileKey: true },
    });
    if (!attachment) throw new Error("Attachment not found.");

    await getDb().workspaceAttachment.delete({ where: { id: attachmentId } });

    // Best-effort removal of the underlying stored object.
    await deleteStoredObject(attachment.fileKey);

    revalidateWorkspacePaths(workspaceId);
    return ok("File deleted.");
  } catch (error) {
    return toActionError(error);
  }
}
