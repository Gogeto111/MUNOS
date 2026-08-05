import Link from "next/link";
import { FolderTree, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { CreateWorkspaceForm } from "@/components/workspace/create-workspace-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Workspaces | MUNOS" };

export default async function WorkspacesPage() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return (
        <div className="space-y-8 text-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to access your MUN workspaces.
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

    const [workspaces, conferences] = await Promise.all([
      getDb().workspace.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          conference: { select: { id: true, name: true } },
          _count: {
            select: {
              notes: true,
              tasks: true,
              committees: true,
              resolutions: true,
            },
          },
        },
      }),
      getDb().conference.findMany({
        orderBy: { startDate: "asc" },
        select: { id: true, name: true },
        take: 100,
      }),
    ]);

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your personal prep hub — notes, tasks, and drafts for every conference.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {workspaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 px-6 py-16 text-center">
                <FolderTree className="size-10 text-muted-foreground/60" />
                <h2 className="mt-4 text-base font-medium">No workspaces yet</h2>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Create a workspace for an upcoming conference to keep research, tasks, and
                  position papers in one place.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {workspaces.map((workspace) => (
                  <Link
                    key={workspace.id}
                    href={`/workspaces/${workspace.id}`}
                    className="group"
                  >
                    <Card className="h-full transition-colors group-hover:border-brand-500/50">
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                          <FolderTree className="size-4 text-muted-foreground" />
                          {workspace.conference ? (
                            <Badge variant="secondary" className="max-w-40 truncate">
                              {workspace.conference.name}
                            </Badge>
                          ) : null}
                        </div>
                        <CardTitle className="text-base">{workspace.title}</CardTitle>
                        {workspace.description ? (
                          <CardDescription className="line-clamp-2">
                            {workspace.description}
                          </CardDescription>
                        ) : null}
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>{workspace._count.notes} notes</span>
                        <span>{workspace._count.tasks} tasks</span>
                        <span>{workspace._count.committees} committees</span>
                        <span>{workspace._count.resolutions} resolutions</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <CreateWorkspaceForm
              conferences={conferences.map((conference) => ({
                id: conference.id,
                name: conference.name,
              }))}
            />
          </div>
        </div>

        {workspaces.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Plus className="size-4" />
            Use the form to create your first workspace.
          </div>
        ) : null}
      </div>
    );
  } catch (error) {
    console.error("[Workspaces]", error);
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We couldn&apos;t load your workspaces. Please try again.
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/workspaces">Reload</Link>
        </Button>
      </div>
    );
  }
}
