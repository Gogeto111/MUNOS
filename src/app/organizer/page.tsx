"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  FolderKanban,
  Users,
  BarChart3,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOrganizerStats, getOrganizerConferences } from "@/lib/actions/organizer";

interface ConferenceData {
  id: string;
  name: string;
  slug: string;
  startDate: string;
  endDate: string;
  city: string;
  country: string;
  published: boolean;
  registrationOpen: boolean;
  _count: { workspaces: number; committees: number };
}

export default function OrganizerPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "conferences" | "registrations" | "certificates" | "analytics">("overview");
  const [stats, setStats] = useState({
    totalConferences: 0,
    totalDelegates: 0,
    totalCertificates: 0,
    totalWorkspaces: 0,
    upcomingConferences: 0,
  });
  const [conferences, setConferences] = useState<ConferenceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOrganizerStats(), getOrganizerConferences()]).then(([statsResult, confResult]) => {
      if (statsResult.status === "success" && statsResult.data) {
        setStats(statsResult.data);
      }
      if (confResult.status === "success" && confResult.data) {
        setConferences(confResult.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Organizer Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "Loading..." : "Manage conferences, registrations, certificates, and analytics."}
          </p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-border/60">
          {[
            { label: "Overview", value: "overview" },
            { label: "Conferences", value: "conferences" },
            { label: "Registrations", value: "registrations" },
            { label: "Certificates", value: "certificates" },
            { label: "Analytics", value: "analytics" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as never)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.value
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: "Total Conferences", value: stats.totalConferences, icon: FolderKanban, color: "brand" },
              { label: "Total Delegates", value: stats.totalDelegates, icon: Users, color: "emerald" },
              { label: "Certificates", value: stats.totalCertificates, icon: Award, color: "amber" },
              { label: "Workspaces", value: stats.totalWorkspaces, icon: FolderKanban, color: "brand" },
              { label: "Upcoming", value: stats.upcomingConferences, icon: Clock, color: "red" },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`grid size-10 place-items-center rounded-lg bg-${stat.color}-500/10 text-${stat.color}-600`}>
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
        )}

        {activeTab === "conferences" && (
          <Card>
            <CardHeader>
              <CardTitle>Conferences</CardTitle>
            </CardHeader>
            <CardContent>
              {conferences.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No conferences found. Create one in the admin panel.
                </p>
              ) : (
                <div className="space-y-3">
                  {conferences.map((conf) => (
                    <div key={conf.id} className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                      <div>
                        <p className="font-semibold">{conf.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-3" /> {new Date(conf.startDate).toLocaleDateString()} — {new Date(conf.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{conf.city}, {conf.country}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-xs text-muted-foreground">
                          <p>{conf._count.workspaces} workspaces</p>
                          <p>{conf._count.committees} committees</p>
                        </div>
                        <Badge variant={conf.published ? "default" : "outline"}>
                          {conf.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "registrations" && (
          <Card>
            <CardHeader>
              <CardTitle>Registration Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Registration data is tracked via workspaces. Select a conference above to view its registrations.
              </p>
            </CardContent>
          </Card>
        )}

        {activeTab === "certificates" && (
          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Select a conference and delegate to generate certificates. Use the organizer actions to issue certificates.
              </p>
            </CardContent>
          </Card>
        )}

        {activeTab === "analytics" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="size-5 text-brand-600" /> Registration Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BarChart3 className="mb-4 size-10 text-muted-foreground" />
                  <p className="text-sm font-medium">No registration data yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Charts will populate as delegates register for your conferences.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5 text-emerald-600" /> Delegate Demographics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="mb-4 size-10 text-muted-foreground" />
                  <p className="text-sm font-medium">No demographics data yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Delegate location data will appear as registrations come in.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}