import { z } from "zod";
import {
  TaskStatus,
  TaskPriority,
  PositionPaperStatus,
  ResolutionStatus,
} from "@/generated/prisma/browser";

const optionalText = (max: number) => z.string().trim().max(max).optional();

const dateLike = z
  .string()
  .trim()
  .max(64)
  .refine((v) => !v || !Number.isNaN(new Date(v).getTime()), {
    message: "Enter a valid date",
  });

export const workspaceInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: optionalText(2000),
  conferenceId: z.string().trim().max(64).optional(),
});

export type WorkspaceInput = z.infer<typeof workspaceInputSchema>;

export const folderInputSchema = z.object({
  name: z.string().trim().min(1, "Folder name is required").max(200),
  parentId: z.string().trim().max(64).optional(),
});

export type FolderInput = z.infer<typeof folderInputSchema>;

export const noteInputSchema = z.object({
  folderId: z.string().trim().max(64).optional(),
  title: z.string().trim().min(1, "Title is required").max(300),
  content: z.string().max(50_000).optional(),
  pinned: z.boolean().optional(),
});

export type NoteInput = z.infer<typeof noteInputSchema>;

export const taskInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  description: optionalText(5000),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueAt: dateLike.optional(),
});

export type TaskInput = z.infer<typeof taskInputSchema>;

export const timelineEventInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  date: dateLike.refine((v) => v.length > 0, { message: "Date is required" }),
  description: optionalText(5000),
});

export type TimelineEventInput = z.infer<typeof timelineEventInputSchema>;

export const workspaceCommitteeInputSchema = z.object({
  name: z.string().trim().min(1, "Committee name is required").max(300),
  topic: optionalText(2000),
  country: optionalText(200),
  role: optionalText(100),
});

export type WorkspaceCommitteeInput = z.infer<typeof workspaceCommitteeInputSchema>;

export const positionPaperInputSchema = z.object({
  title: optionalText(300),
  content: z.string().max(100_000).optional(),
  status: z.nativeEnum(PositionPaperStatus).optional(),
});

export type PositionPaperInput = z.infer<typeof positionPaperInputSchema>;

export const resolutionInputSchema = z.object({
  committeeId: z.string().trim().max(64).optional(),
  title: z.string().trim().min(1, "Title is required").max(300),
  body: z.string().max(100_000).optional(),
  status: z.nativeEnum(ResolutionStatus).optional(),
  sponsors: optionalText(5000),
});

export type ResolutionInput = z.infer<typeof resolutionInputSchema>;

export const attachmentInputSchema = z.object({
  fileName: z.string().trim().min(1, "File name is required").max(300),
  mimeType: z.string().trim().max(200).optional(),
  sizeBytes: z.string().trim().max(16).optional(),
  fileUrl: z.string().trim().min(1, "File URL is required").max(2000),
  fileKey: z.string().trim().max(2000).optional(),
});

export type AttachmentInput = z.infer<typeof attachmentInputSchema>;
