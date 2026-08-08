"use client";

import {
  ArrowLeft,
  FileText,
  LayoutGrid,
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
import { PositionPapersPanel } from "@/components/workspace/position-papers-panel";
import { AiCopilotPanel } from "@/components/workspace/ai-copilot-panel";
import { WorkspaceSettings } from "@/components/workspace/workspace-settings";
import { ExportButton } from "@/components/workspace/export-button";
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
  }[] = [
    { value: "overview", label: "Overview", icon: LayoutGrid },
    { value: "papers", label: "Position Papers", icon: FileText },
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
        <div className="flex items-center justify-between">
          <TabsList className="flex h-auto justify-start gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                  <Icon className="size-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
          <ExportButton workspaceId={workspace.id} workspaceTitle={workspace.title} />
        </div>

        <TabsContent value="overview" className="mt-0">
          <WorkspaceOverview workspace={workspace} />
        </TabsContent>
        <TabsContent value="papers" className="mt-0">
          <PositionPapersPanel
            workspaceId={workspace.id}
            committees={workspace.committees}
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
