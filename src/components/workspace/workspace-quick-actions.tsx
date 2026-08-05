"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  CheckSquare,
  Clock,
  Upload,
  Users,
  Settings,
  ArrowRight,
} from "lucide-react";

interface WorkspaceQuickActionsProps {
  workspaceId: string;
}

export function WorkspaceQuickActions({ workspaceId }: WorkspaceQuickActionsProps) {
  const actions = [
    { label: "New Note", icon: FileText, href: `/workspaces/${workspaceId}?tab=notes` },
    { label: "New Task", icon: CheckSquare, href: `/workspaces/${workspaceId}?tab=tasks` },
    { label: "Add Timeline", icon: Clock, href: `/workspaces/${workspaceId}?tab=timeline` },
    { label: "Upload File", icon: Upload, href: `/workspaces/${workspaceId}?tab=files` },
    { label: "Committees", icon: Users, href: `/workspaces/${workspaceId}?tab=committees` },
    { label: "Settings", icon: Settings, href: `/workspaces/${workspaceId}?tab=settings` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm transition-colors hover:border-brand-500/50 hover:bg-muted/40"
          >
            <div className="flex items-center gap-3">
              <action.icon className="size-4 text-muted-foreground" />
              <span className="font-medium">{action.label}</span>
            </div>
            <ArrowRight className="size-3 text-muted-foreground" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
