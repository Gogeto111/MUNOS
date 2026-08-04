import { describe, expect, it } from "vitest";
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
} from "@/lib/validation/workspace";

describe("workspaceInputSchema", () => {
  it("accepts a minimal valid workspace", () => {
    const result = workspaceInputSchema.safeParse({ title: "Prep" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = workspaceInputSchema.safeParse({ title: "   " });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("title");
    }
  });

  it("rejects an oversized title", () => {
    const result = workspaceInputSchema.safeParse({ title: "x".repeat(201) });
    expect(result.success).toBe(false);
  });
});

describe("folderInputSchema", () => {
  it("accepts a name and optional parent", () => {
    expect(folderInputSchema.safeParse({ name: "Research", parentId: "abc" }).success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(folderInputSchema.safeParse({ name: "" }).success).toBe(false);
  });
});

describe("noteInputSchema", () => {
  it("accepts title-only notes", () => {
    expect(noteInputSchema.safeParse({ title: "Opening speech" }).success).toBe(true);
  });

  it("rejects missing title", () => {
    expect(noteInputSchema.safeParse({ content: "text" }).success).toBe(false);
  });

  it("caps content length", () => {
    expect(
      noteInputSchema.safeParse({ title: "t", content: "x".repeat(50_001) }).success,
    ).toBe(false);
  });
});

describe("taskInputSchema", () => {
  it("accepts a minimal task", () => {
    expect(taskInputSchema.safeParse({ title: "Draft speech" }).success).toBe(true);
  });

  it("accepts valid enum values", () => {
    const result = taskInputSchema.safeParse({
      title: "t",
      status: "IN_PROGRESS",
      priority: "URGENT",
      dueAt: "2026-08-15",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid status", () => {
    const result = taskInputSchema.safeParse({ title: "t", status: "NOPE" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid date", () => {
    const result = taskInputSchema.safeParse({ title: "t", dueAt: "not-a-date" });
    expect(result.success).toBe(false);
  });
});

describe("timelineEventInputSchema", () => {
  it("requires a date", () => {
    const result = timelineEventInputSchema.safeParse({ title: "Deadline" });
    expect(result.success).toBe(false);
  });

  it("accepts a valid event", () => {
    const result = timelineEventInputSchema.safeParse({
      title: "Deadline",
      date: "2026-09-01",
    });
    expect(result.success).toBe(true);
  });
});

describe("workspaceCommitteeInputSchema", () => {
  it("requires a name", () => {
    expect(workspaceCommitteeInputSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("accepts a full committee", () => {
    const result = workspaceCommitteeInputSchema.safeParse({
      name: "UNGA",
      topic: "AI and security",
      country: "Canada",
      role: "DELEGATE",
    });
    expect(result.success).toBe(true);
  });
});

describe("positionPaperInputSchema", () => {
  it("accepts empty title", () => {
    expect(positionPaperInputSchema.safeParse({ content: "x" }).success).toBe(true);
  });

  it("accepts valid status", () => {
    const result = positionPaperInputSchema.safeParse({ status: "RESEARCH", title: "t" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = positionPaperInputSchema.safeParse({ status: "SHIPPED" });
    expect(result.success).toBe(false);
  });
});

describe("resolutionInputSchema", () => {
  it("requires a title", () => {
    expect(resolutionInputSchema.safeParse({ title: "" }).success).toBe(false);
  });

  it("accepts sponsors as a comma string", () => {
    const result = resolutionInputSchema.safeParse({
      title: "Resolution 1",
      sponsors: "Canada, Germany",
    });
    expect(result.success).toBe(true);
  });
});

describe("attachmentInputSchema", () => {
  it("requires file name and URL", () => {
    expect(attachmentInputSchema.safeParse({ fileName: "guide.pdf" }).success).toBe(false);
    expect(
      attachmentInputSchema.safeParse({ fileName: "guide.pdf", fileUrl: "https://x/guide.pdf" })
        .success,
    ).toBe(true);
  });
});
