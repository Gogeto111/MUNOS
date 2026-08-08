import { NextResponse } from "next/server";
import { getDb } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const workspace = await getDb().workspace.findUnique({
      where: { id },
      include: {
        conference: { select: { name: true } },
        notes: { orderBy: { sortOrder: "asc" } },
        tasks: { orderBy: { sortOrder: "asc" } },
        timeline: { orderBy: { sortOrder: "asc" } },
        committees: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!workspace || workspace.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const lines: string[] = [];

    lines.push(`# ${workspace.title}`);
    lines.push("");
    if (workspace.description) {
      lines.push(workspace.description);
      lines.push("");
    }
    if (workspace.conference) {
      lines.push(`**Conference:** ${workspace.conference.name}`);
    }
    lines.push(`**Created:** ${workspace.createdAt.toISOString().slice(0, 10)}`);
    lines.push("");

    // Notes
    if (workspace.notes.length > 0) {
      lines.push("## Notes");
      lines.push("");
      for (const note of workspace.notes) {
        lines.push(`### ${note.title}`);
        lines.push("");
        lines.push(note.content);
        lines.push("");
      }
    }

    // Tasks
    if (workspace.tasks.length > 0) {
      lines.push("## Tasks");
      lines.push("");
      for (const task of workspace.tasks) {
        const status =
          task.status === "DONE"
            ? "[x]"
            : task.status === "IN_PROGRESS"
              ? "[-]"
              : "[ ]";
        const priority =
          task.priority !== "MEDIUM" ? ` \` ${task.priority}\`` : "";
        const due = task.dueAt
          ? ` (due: ${task.dueAt.toISOString().slice(0, 10)})`
          : "";
        lines.push(`- ${status} ${task.title}${priority}${due}`);
        if (task.description) {
          lines.push(`  ${task.description}`);
        }
      }
      lines.push("");
    }

    // Timeline
    if (workspace.timeline.length > 0) {
      lines.push("## Timeline");
      lines.push("");
      for (const event of workspace.timeline) {
        lines.push(
          `- **${event.date.toISOString().slice(0, 10)}** — ${event.title}`,
        );
        if (event.description) {
          lines.push(`  ${event.description}`);
        }
      }
      lines.push("");
    }

    // Committees
    if (workspace.committees.length > 0) {
      lines.push("## Committees");
      lines.push("");
      for (const committee of workspace.committees) {
        const parts = [committee.name];
        if (committee.topic) parts.push(`Topic: ${committee.topic}`);
        if (committee.country) parts.push(`Country: ${committee.country}`);
        parts.push(`Role: ${committee.role}`);
        lines.push(`- ${parts.join(" | ")}`);
      }
      lines.push("");
    }

    const markdown = lines.join("\n");
    const dateSlug = new Date().toISOString().slice(0, 10);
    const fileSlug = workspace.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileSlug}-${dateSlug}.md"`,
      },
    });
  } catch (error) {
    logger.error("Workspace export error", { error: String(error) });
    return NextResponse.json(
      { error: "Failed to export workspace" },
      { status: 500 },
    );
  }
}
