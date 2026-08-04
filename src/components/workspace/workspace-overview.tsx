import {
  CalendarClock,
  FileText,
  ListChecks,
  Paperclip,
  Pin,
} from "lucide-react";
import { formatBytes, formatDate, timeAgo } from "@/lib/format";
import { daysUntil, isTaskOverdue, workspaceProgress } from "@/lib/workspace";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { WorkspaceData } from "@/components/workspace/workspace-layout";

export function WorkspaceOverview({ workspace }: { workspace: WorkspaceData }) {
  const progress = workspaceProgress(workspace.tasks);
  const overdue = workspace.tasks.filter((t) => t.dueAt && isTaskOverdue(t.dueAt, t.status));
  const upcoming = workspace.timeline
    .filter((event) => daysUntil(event.date) >= 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);
  const pinned = workspace.notes.filter((n) => n.pinned).slice(0, 5);
  const recentFiles = [...workspace.attachments]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {workspace.description ? (
        <p className="text-sm text-muted-foreground">{workspace.description}</p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ListChecks className="size-4 text-muted-foreground" />
              Tasks
            </CardTitle>
            <CardDescription>
              {progress.done} of {progress.total} done
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={progress.percent} />
            <p className="text-xs text-muted-foreground">{progress.percent}% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CalendarClock className="size-4 text-muted-foreground" />
              Deadlines
            </CardTitle>
            <CardDescription>
              {overdue.length > 0 ? `${overdue.length} overdue` : "Nothing overdue"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overdue.length === 0 ? (
              <p className="text-xs text-muted-foreground">All clear.</p>
            ) : (
              <ul className="space-y-2">
                {overdue.slice(0, 4).map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{task.title}</span>
                    <Badge variant="destructive" className="shrink-0">
                      {daysUntil(task.dueAt ?? "")}d late
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="size-4 text-muted-foreground" />
              Content
            </CardTitle>
            <CardDescription>Across this workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>{workspace.notes.length} notes</p>
            <p>{workspace.timeline.length} timeline events</p>
            <p>{workspace.committees.length} committees</p>
            <p>{workspace.resolutions.length} resolutions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CalendarClock className="size-4 text-muted-foreground" />
              Upcoming events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming events. Add them in the Timeline tab.
              </p>
            ) : (
              <ul className="divide-y divide-border/70">
                {upcoming.map((event) => (
                  <li key={event.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      in {daysUntil(event.date)}d
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Pin className="size-4 text-muted-foreground" />
                Pinned notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pinned.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pinned notes.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {pinned.map((note) => (
                    <li key={note.id} className="truncate">
                      {note.title}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Paperclip className="size-4 text-muted-foreground" />
                Recent files
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentFiles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No files yet.</p>
              ) : (
                <ul className="divide-y divide-border/70">
                  {recentFiles.map((file) => (
                    <li key={file.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <span className="min-w-0 truncate">{file.fileName}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatBytes(file.sizeBytes)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Updated {timeAgo(workspace.updatedAt)}</p>
    </div>
  );
}
