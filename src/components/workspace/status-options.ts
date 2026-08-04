import type {
  PositionPaperStatus,
  ResolutionStatus,
  TaskPriority,
  TaskStatus,
} from "@/generated/prisma/browser";

export const TASK_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export const TASK_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export const POSITION_PAPER_STATUSES: PositionPaperStatus[] = [
  "DRAFT",
  "RESEARCH",
  "COMPLETE",
];

export const RESOLUTION_STATUSES: ResolutionStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "PASSED",
  "FAILED",
];
