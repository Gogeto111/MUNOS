import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Workspace | MUNOS" };

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return (
        <div className="space-y-8 text-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Workspace</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to access this workspace.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      );
    }

    const { id } = await params;

    const workspace = await getDb().workspace.findFirst({
      where: { id, userId: user.id },
      include: {
        conference: { select: { id: true, name: true, city: true } },
        folders: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        notes: { orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }] },
        tasks: { orderBy: { createdAt: "asc" } },
        timeline: { orderBy: [{ date: "asc" }, { createdAt: "asc" }] },
        attachments: { orderBy: { createdAt: "desc" } },
        committees: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          include: { positionPaper: true },
        },
        resolutions: { orderBy: { updatedAt: "desc" } },
      },
    });

    if (!workspace) notFound();

    const conferences = await getDb().conference.findMany({
      orderBy: { startDate: "asc" },
      select: { id: true, name: true },
      take: 100,
    });

      return (
        <div className="space-y-6">
          <Breadcrumbs
            items={[
              { label: "Workspaces", href: "/workspaces" },
              { label: workspace.title },
            ]}
          />
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{workspace.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {workspace.description || "Personal conference workspace"}
              </p>
            </div>
            {workspace.conference ? (
              <Badge variant="secondary" className="max-w-60 truncate">
                {workspace.conference.name}
                {workspace.conference.city ? ` · ${workspace.conference.city}` : ""}
              </Badge>
            ) : null}
          </div>

        <WorkspaceLayout
          workspace={{
            id: workspace.id,
            title: workspace.title,
            description: workspace.description,
            conferenceId: workspace.conferenceId,
            createdAt: workspace.createdAt,
            updatedAt: workspace.updatedAt,
            conference: workspace.conference,
            folders: workspace.folders,
            notes: workspace.notes,
            tasks: workspace.tasks,
            timeline: workspace.timeline,
            attachments: workspace.attachments,
            committees: workspace.committees,
            resolutions: workspace.resolutions,
          }}
          conferences={conferences.map((conference) => ({
            id: conference.id,
            name: conference.name,
          }))}
        />
      </div>
    );
  } catch (error) {
    logger.error("Workspace detail error", { error: String(error) });
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We couldn&apos;t load this workspace. Please try again.
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/workspaces">Back to workspaces</Link>
        </Button>
      </div>
    );
  }
}
