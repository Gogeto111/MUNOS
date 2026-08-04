import { describe, expect, it } from "vitest";
import {
  daysUntil,
  isTaskOverdue,
  positionPaperStatusLabel,
  resolutionStatusLabel,
  taskPriorityLabel,
  taskStatusLabel,
  toDateInputValue,
  workspaceProgress,
} from "@/lib/workspace";

describe("workspace status labels", () => {
  it("maps task statuses to labels", () => {
    expect(taskStatusLabel("TODO")).toBe("To do");
    expect(taskStatusLabel("IN_PROGRESS")).toBe("In progress");
    expect(taskStatusLabel("DONE")).toBe("Done");
  });

  it("maps task priorities to labels", () => {
    expect(taskPriorityLabel("LOW")).toBe("Low");
    expect(taskPriorityLabel("URGENT")).toBe("Urgent");
  });

  it("maps position paper statuses to labels", () => {
    expect(positionPaperStatusLabel("DRAFT")).toBe("Draft");
    expect(positionPaperStatusLabel("RESEARCH")).toBe("Researching");
    expect(positionPaperStatusLabel("COMPLETE")).toBe("Complete");
  });

  it("maps resolution statuses to labels", () => {
    expect(resolutionStatusLabel("SUBMITTED")).toBe("Submitted");
    expect(resolutionStatusLabel("PASSED")).toBe("Passed");
    expect(resolutionStatusLabel("FAILED")).toBe("Failed");
  });
});

describe("toDateInputValue", () => {
  it("formats a date as yyyy-MM-dd for date inputs", () => {
    expect(toDateInputValue(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(toDateInputValue(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});

describe("daysUntil", () => {
  it("is 0 for today", () => {
    expect(daysUntil(new Date())).toBe(0);
  });

  it("is negative for past dates", () => {
    expect(daysUntil(new Date(2020, 0, 1))).toBeLessThan(0);
  });

  it("is positive for future dates", () => {
    expect(daysUntil(new Date(2030, 0, 1))).toBeGreaterThan(0);
  });
});

describe("isTaskOverdue", () => {
  it("is false for completed tasks regardless of due date", () => {
    expect(isTaskOverdue(new Date(2020, 0, 1), "DONE")).toBe(false);
  });

  it("is false for unfinished tasks due in the future", () => {
    expect(isTaskOverdue(new Date(2030, 0, 1), "TODO")).toBe(false);
  });

  it("is true for unfinished tasks due in the past", () => {
    expect(isTaskOverdue(new Date(2020, 0, 1), "IN_PROGRESS")).toBe(true);
  });
});

describe("workspaceProgress", () => {
  it("returns zero for no tasks", () => {
    expect(workspaceProgress([])).toEqual({ done: 0, total: 0, percent: 0 });
  });

  it("computes percentage of done tasks", () => {
    const tasks = [
      { status: "DONE" as const },
      { status: "DONE" as const },
      { status: "TODO" as const },
      { status: "IN_PROGRESS" as const },
    ];
    expect(workspaceProgress(tasks)).toEqual({ done: 2, total: 4, percent: 50 });
  });

  it("returns 100 for all done", () => {
    const tasks = [
      { status: "DONE" as const },
      { status: "DONE" as const },
    ];
    expect(workspaceProgress(tasks).percent).toBe(100);
  });
});
