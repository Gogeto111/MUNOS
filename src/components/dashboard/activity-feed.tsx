"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FolderPlus,
  FileText,
  Play,
  Trophy,
  CalendarCheck,
  MessageSquare,
  Activity,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { getRecentActivity } from "@/lib/actions/os";

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  WORKSPACE_CREATE: FolderPlus,
  NOTE_ADD: FileText,
  SIMULATION_RUN: Play,
  AWARD_EARNED: Trophy,
  CONFERENCE_REGISTER: CalendarCheck,
  POST_CREATE: MessageSquare,
  ACCOUNT_CREATED: Activity,
  PROFILE_UPDATED: Activity,
  PROFILE_COMPLETED: Trophy,
  MUN_PROFILE_UPDATED: Activity,
  AWARD_ADDED: Trophy,
  AWARD_REMOVED: Trophy,
  CERTIFICATE_UPLOADED: FileText,
  CERTIFICATE_DELETED: FileText,
  COMMITTEE_ADDED: FolderPlus,
  COMMITTEE_REMOVED: FolderPlus,
  COUNTRY_ADDED: FolderPlus,
  COUNTRY_REMOVED: FolderPlus,
  SOCIAL_LINK_UPDATED: Activity,
  PORTFOLIO_UPDATED: Activity,
  SETTINGS_UPDATED: Activity,
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Array<{ message: string; type: string; createdAt: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentActivity().then((result) => {
      if (result.status === "success" && result.data) {
        setActivities(result.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Activity className="size-4" /> Recent Activity
          </span>
          <Button asChild variant="ghost" size="sm" className="text-xs h-7">
            <Link href="/os">View all</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, i) => {
              const Icon = ACTIVITY_ICONS[activity.type] ?? Activity;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-muted/60">
                    <Icon className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{activity.message}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {timeAgo(activity.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
