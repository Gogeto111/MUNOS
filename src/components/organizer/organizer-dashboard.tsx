"use client";

import { useMemo } from "react";
import {
  FileText,
  Clock,
  Calendar,
  FolderKanban,
  Plus,
  ClipboardCheck,
  Megaphone,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Submission {
  id: string;
  conferenceName: string;
  submittedBy: string;
  date: string;
  status: "pending" | "accepted" | "rejected" | "waitlisted";
  delegateCount: number;
}

const MOCK_SUBMISSIONS: Submission[] = [
  { id: "1", conferenceName: "Harvard MUN 2026", submittedBy: "Sarah Chen", date: "2026-08-01", status: "pending", delegateCount: 42 },
  { id: "2", conferenceName: "Oxford International MUN", submittedBy: "James Wilson", date: "2026-07-28", status: "accepted", delegateCount: 38 },
  { id: "3", conferenceName: "Tokyo Global Summit", submittedBy: "Yuki Tanaka", date: "2026-07-25", status: "rejected", delegateCount: 15 },
  { id: "4", conferenceName: "Geneva Diplomacy Forum", submittedBy: "Marie Dubois", date: "2026-07-20", status: "waitlisted", delegateCount: 56 },
  { id: "5", conferenceName: "Singapore Youth Assembly", submittedBy: "Li Wei", date: "2026-07-18", status: "pending", delegateCount: 29 },
  { id: "6", conferenceName: "Cairo Model UN", submittedBy: "Ahmed Hassan", date: "2026-07-15", status: "accepted", delegateCount: 34 },
];

const STATUS_STYLES: Record<Submission["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  accepted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  waitlisted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function OrganizerDashboard({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const stats = useMemo(() => ({
    total: MOCK_SUBMISSIONS.length,
    pending: MOCK_SUBMISSIONS.filter((s) => s.status === "pending").length,
    upcoming: 3,
    active: 2,
  }), []);

  const timelineData = useMemo(() => {
    const counts = new Array(12).fill(0);
    MOCK_SUBMISSIONS.forEach((s) => {
      const month = new Date(s.date).getMonth();
      counts[month]++;
    });
    return counts;
  }, []);

  const maxCount = Math.max(...timelineData, 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-primary/10">
                <FileText className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-yellow-500/10">
                <Clock className="size-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-blue-500/10">
                <Calendar className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.upcoming}</p>
                <p className="text-xs text-muted-foreground">Upcoming Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-green-500/10">
                <FolderKanban className="size-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active Conferences</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Submission Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1.5 h-32">
                {timelineData.map((count, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-primary/20 transition-all"
                      style={{ height: `${(count / maxCount) * 100}%`, minHeight: count > 0 ? 4 : 0 }}
                    />
                    <span className="text-[9px] text-muted-foreground">{MONTHS[i]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                <TrendingUp className="size-3" />
                Submissions over time
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {MOCK_SUBMISSIONS.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{s.conferenceName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        by {s.submittedBy} · {new Date(s.date).toLocaleDateString()} · {s.delegateCount} delegates
                      </p>
                    </div>
                    <span className={`ml-3 inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[10px] font-medium ${STATUS_STYLES[s.status]}`}>
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => onNavigate?.("create")}
            >
              <Plus className="size-4" />
              Create Conference
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => onNavigate?.("submissions")}
            >
              <ClipboardCheck className="size-4" />
              Review Submissions
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => onNavigate?.("announcements")}
            >
              <Megaphone className="size-4" />
              Send Announcement
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
