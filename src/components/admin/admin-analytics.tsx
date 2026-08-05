"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FolderKanban, Award, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { colorClasses } from "@/lib/colors";

interface AdminStats {
  totalConferences: number;
  totalDelegates: number;
  totalCertificates: number;
  totalWorkspaces: number;
  upcomingConferences: number;
  publishedConferences: number;
}

interface AdminAnalyticsProps {
  stats: AdminStats;
  recentConferences: Array<{
    name: string;
    startDate: string;
    _count: { workspaces: number };
  }>;
}

export function AdminAnalytics({ stats, recentConferences }: AdminAnalyticsProps) {
  const statCards = [
    { label: "Total Conferences", value: stats.totalConferences, icon: FolderKanban, color: "brand" },
    { label: "Total Delegates", value: stats.totalDelegates, icon: Users, color: "emerald" },
    { label: "Certificates Issued", value: stats.totalCertificates, icon: Award, color: "amber" },
    { label: "Active Workspaces", value: stats.totalWorkspaces, icon: FolderKanban, color: "brand" },
    { label: "Upcoming Events", value: stats.upcomingConferences, icon: Calendar, color: "red" },
    { label: "Published", value: stats.publishedConferences, icon: TrendingUp, color: "emerald" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`grid size-10 place-items-center rounded-lg ${colorClasses(stat.color).bg} ${colorClasses(stat.color).text}`}>
                  <stat.icon className="size-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <BarChart3 className="size-4" /> Recent Conference Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentConferences.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No conferences yet.</p>
          ) : (
            <div className="space-y-3">
              {recentConferences.map((conf) => (
                <div key={conf.name} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                  <div>
                    <p className="text-sm font-medium">{conf.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conf.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {conf._count.workspaces} workspace{conf._count.workspaces !== 1 ? "s" : ""}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
