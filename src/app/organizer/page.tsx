"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Loader2,
  Users,
  FolderKanban,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  getOrganizerStats,
  getOrganizerConferences,
  getConferenceRegistrations,
} from "@/lib/actions/organizer";
import { BulkCertsButton } from "@/components/organizer/bulk-certs-button";

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

interface Registration {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  country: string | null;
  registeredAt: string;
  workspaceId: string;
}

export default function OrganizerPage() {
  const [stats, setStats] = useState({ totalConferences: 0, totalDelegates: 0, totalCertificates: 0, totalWorkspaces: 0, upcomingConferences: 0 });
  const [conferences, setConferences] = useState<ConferenceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConfId, setSelectedConfId] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  useEffect(() => {
    Promise.all([getOrganizerStats(), getOrganizerConferences()]).then(([s, c]) => {
      if (s.status === "success" && s.data) setStats(s.data);
      if (c.status === "success" && c.data) setConferences(c.data);
      setLoading(false);
    });
  }, []);

  const loadRegistrations = async (confId: string) => {
    setSelectedConfId(confId);
    if (!confId) { setRegistrations([]); return; }
    setLoadingRegs(true);
    const r = await getConferenceRegistrations(confId);
    if (r.status === "success" && r.data) setRegistrations(r.data);
    else toast.error(r.message);
    setLoadingRegs(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organizer</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading ? "Loading..." : "Manage conferences and view delegate registrations."}
            </p>
          </div>
          <Link href="/organizer/create">
            <Button>
              <Plus className="size-4" />
              Create Conference
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {[
            { label: "Conferences", value: stats.totalConferences, icon: FolderKanban },
            { label: "Delegates", value: stats.totalDelegates, icon: Users },
            { label: "Certificates", value: stats.totalCertificates, icon: Users },
            { label: "Upcoming", value: stats.upcomingConferences, icon: Calendar },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-muted/60">
                    <s.icon className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Conferences</CardTitle>
            </CardHeader>
            <CardContent>
              {conferences.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground mb-4">No conferences yet.</p>
                  <Link href="/organizer/create">
                    <Button variant="outline" size="sm">
                      <Plus className="size-4" />
                      Create Your First Conference
                    </Button>
                  </Link>
                </div>
              ) : (
                <ScrollArea className="h-[40vh]">
                  <div className="space-y-2">
                    {conferences.map((c) => (
                      <div key={c.id} className="rounded-lg border border-border/60 p-3">
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(c.startDate).toLocaleDateString()} — {new Date(c.endDate).toLocaleDateString()} • {c.city}, {c.country}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge variant={c.published ? "default" : "outline"} className="text-[10px]">
                            {c.published ? "Live" : "Draft"}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {c._count.workspaces} delegates
                          </span>
                          {c.registrationOpen && (
                            <Badge variant="secondary" className="text-[10px]">
                              Registration Open
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2">
                          <BulkCertsButton
                            conferenceId={c.id}
                            delegateCount={c._count.workspaces}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="size-4" /> Delegate Registrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-sm">
                <Select value={selectedConfId} onValueChange={loadRegistrations}>
                  <SelectTrigger><SelectValue placeholder="Select a conference" /></SelectTrigger>
                  <SelectContent>
                    {conferences.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {loadingRegs && <div className="flex justify-center py-8"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>}

              {!loadingRegs && selectedConfId && registrations.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No registrations for this conference.</p>
              )}

              {!loadingRegs && registrations.length > 0 && (
                <ScrollArea className="h-[35vh]">
                  <div className="space-y-2">
                    {registrations.map((r) => (
                      <div key={r.workspaceId} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                        <div>
                          <p className="text-sm font-medium">{r.firstName ?? "Unknown"} {r.lastName ?? ""}</p>
                          <p className="text-[10px] text-muted-foreground">{r.email} {r.country && `• ${r.country}`}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{new Date(r.registeredAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {!selectedConfId && !loadingRegs && (
                <div className="flex flex-col items-center py-12 text-center">
                  <Users className="mb-4 size-10 text-muted-foreground" />
                  <p className="text-sm font-medium">Select a conference above to view delegates.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
