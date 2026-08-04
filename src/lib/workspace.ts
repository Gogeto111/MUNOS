import type {
  PositionPaperStatus,
  ResolutionStatus,
  TaskPriority,
  TaskStatus,
} from "@/generated/prisma/browser";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const POSITION_PAPER_STATUS_LABELS: Record<PositionPaperStatus, string> = {
  DRAFT: "Draft",
  RESEARCH: "Researching",
  COMPLETE: "Complete",
};

export const RESOLUTION_STATUS_LABELS: Record<ResolutionStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  PASSED: "Passed",
  FAILED: "Failed",
};

export function taskStatusLabel(status: TaskStatus): string {
  return TASK_STATUS_LABELS[status];
}

export function taskPriorityLabel(priority: TaskPriority): string {
  return TASK_PRIORITY_LABELS[priority];
}

export function positionPaperStatusLabel(status: PositionPaperStatus): string {
  return POSITION_PAPER_STATUS_LABELS[status];
}

export function resolutionStatusLabel(status: ResolutionStatus): string {
  return RESOLUTION_STATUS_LABELS[status];
}

export function toDateInputValue(date: Date | string): string {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function daysUntil(date: Date | string): number {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

export function isTaskOverdue(dueAt: Date | string, status: TaskStatus): boolean {
  if (status === "DONE") return false;
  return new Date(dueAt).getTime() < Date.now();
}

export interface WorkspaceProgress {
  done: number;
  total: number;
  percent: number;
}

export function workspaceProgress(
  tasks: { status: TaskStatus }[],
): WorkspaceProgress {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "DONE").length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
