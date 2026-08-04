"use client";

import {
  ArrowLeft,
  Calendar,
  FileStack,
  Files,
  FolderTree,
  Gavel,
  LayoutGrid,
  ListTodo,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type {
  Folder,
  Note,
  PositionPaper,
  Resolution,
  TimelineEvent,
  WorkspaceAttachment,
  WorkspaceCommittee,
  WorkspaceTask,
} from "@/generated/prisma/browser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkspaceOverview } from "@/components/workspace/workspace-overview";
import { NotesPanel } from "@/components/workspace/notes-panel";
import { TasksPanel } from "@/components/workspace/tasks-panel";
import { TimelinePanel } from "@/components/workspace/timeline-panel";
import { FilesPanel } from "@/components/workspace/files-panel";
import { CommitteesPanel } from "@/components/workspace/committees-panel";
import { ResolutionsPanel } from "@/components/workspace/resolutions-panel";
import { AiCopilotPanel } from "@/components/workspace/ai-copilot-panel";
import { WorkspaceSettings } from "@/components/workspace/workspace-settings";
import type { ConferenceOption } from "@/components/workspace/create-workspace-form";

export interface WorkspaceData {
  id: string;
  title: string;
  description: string | null;
  conferenceId: string | null;
  createdAt: Date;
  updatedAt: Date;
  conference: { id: string; name: string; city: string | null } | null;
  folders: Folder[];
  notes: Note[];
  tasks: WorkspaceTask[];
  timeline: TimelineEvent[];
  attachments: WorkspaceAttachment[];
  committees: (WorkspaceCommittee & { positionPaper: PositionPaper | null })[];
  resolutions: Resolution[];
}

export function WorkspaceLayout({
  workspace,
  conferences,
}: {
  workspace: WorkspaceData;
  conferences: ConferenceOption[];
}) {
  const tabs: {
    value: string;
    label: string;
    icon: LucideIcon;
    count?: number;
  }[] = [
    { value: "overview", label: "Overview", icon: LayoutGrid },
    { value: "notes", label: "Notes", icon: FolderTree, count: workspace.notes.length },
    { value: "tasks", label: "Tasks", icon: ListTodo, count: workspace.tasks.length },
    { value: "timeline", label: "Timeline", icon: Calendar, count: workspace.timeline.length },
    { value: "files", label: "Files", icon: Files, count: workspace.attachments.length },
    { value: "committees", label: "Committees", icon: FileStack, count: workspace.committees.length },
    { value: "resolutions", label: "Resolutions", icon: Gavel, count: workspace.resolutions.length },
    { value: "ai", label: "AI Copilot", icon: Sparkles },
    { value: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/workspaces" className="inline-flex items-center gap-1.5 hover:text-foreground">
          <ArrowLeft className="size-4" />
          Workspaces
        </Link>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                <Icon className="size-4" />
                {tab.label}
                {typeof tab.count === "number" && tab.count > 0 ? (
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums">
                    {tab.count}
                  </span>
                ) : null}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <WorkspaceOverview workspace={workspace} />
        </TabsContent>
        <TabsContent value="notes" className="mt-0">
          <NotesPanel workspaceId={workspace.id} folders={workspace.folders} notes={workspace.notes} />
        </TabsContent>
        <TabsContent value="tasks" className="mt-0">
          <TasksPanel workspaceId={workspace.id} tasks={workspace.tasks} />
        </TabsContent>
        <TabsContent value="timeline" className="mt-0">
          <TimelinePanel workspaceId={workspace.id} events={workspace.timeline} />
        </TabsContent>
        <TabsContent value="files" className="mt-0">
          <FilesPanel workspaceId={workspace.id} attachments={workspace.attachments} />
        </TabsContent>
        <TabsContent value="committees" className="mt-0">
          <CommitteesPanel
            workspaceId={workspace.id}
            committees={workspace.committees}
            resolutions={workspace.resolutions}
          />
        </TabsContent>
        <TabsContent value="resolutions" className="mt-0">
          <ResolutionsPanel
            workspaceId={workspace.id}
            committees={workspace.committees}
            resolutions={workspace.resolutions}
          />
        </TabsContent>
        <TabsContent value="ai" className="mt-0">
          <AiCopilotPanel workspaceId={workspace.id} committees={workspace.committees} />
        </TabsContent>
        <TabsContent value="settings" className="mt-0">
          <WorkspaceSettings workspace={workspace} conferences={conferences} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
