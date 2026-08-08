"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Bot,
  Camera,
  Clock,
  Compass,
  FileBadge,
  FlaskConical,
  FolderKanban,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  Newspaper,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Stamp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { colorClasses } from "@/lib/colors";
import { getSystemStatus, getRecentActivity } from "@/lib/actions/os";

const modules = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "brand", description: "Overview and quick actions" },
  { label: "Discover", href: "/discover", icon: Compass, color: "emerald", description: "Find conferences and events" },
  { label: "Simulator", href: "/simulator", icon: FlaskConical, color: "brand", description: "AI Committee Simulator" },
  { label: "Organizer", href: "/organizer", icon: FolderKanban, color: "amber", description: "Conference management" },
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag, color: "emerald", description: "Resolution templates & guides" },
  { label: "Coach", href: "/coach", icon: Camera, color: "brand", description: "AI Video Coach" },
  { label: "News", href: "/news", icon: Newspaper, color: "red", description: "AI News Engine" },
  { label: "Social", href: "/social", icon: MessageSquare, color: "brand", description: "MUN Social Network" },
  { label: "Passport", href: "/passport", icon: Stamp, color: "amber", description: "Verified portfolio" },
  { label: "Certificates", href: "/certificates", icon: FileBadge, color: "emerald", description: "Achievement certificates" },
  { label: "Portfolio", href: "/portfolio", icon: Award, color: "amber", description: "Your MUN portfolio" },
  { label: "Workspaces", href: "/workspaces", icon: FolderKanban, color: "brand", description: "Collaborative workspaces" },
  { label: "Research", href: "/saved", icon: BookOpen, color: "emerald", description: "Saved research & bookmarks" },
  { label: "Settings", href: "/settings", icon: Settings, color: "brand", description: "Account settings" },
];

export default function OSPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [systemStatus, setSystemStatus] = useState<Array<{ name: string; status: string; color: string }>>([]);
  const [recentActivity, setRecentActivity] = useState<Array<{ message: string; type: string; createdAt: string }>>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    Promise.all([getSystemStatus(), getRecentActivity()]).then(([statusResult, activityResult]) => {
      if (statusResult.status === "success" && statusResult.data) {
        setSystemStatus(statusResult.data);
      }
      if (activityResult.status === "success" && activityResult.data) {
        setRecentActivity(activityResult.data);
      }
      setLoadingStatus(false);
    });
  }, []);

  const filteredModules = modules.filter(
    (m) =>
      m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="grid size-10 place-items-center rounded-xl bg-brand-500/10">
              <Sparkles className="size-5 text-brand-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">MUNOS</h1>
              <p className="text-sm text-muted-foreground">
                Model United Nations Operating System
              </p>
            </div>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Your unified platform for MUN — from research and preparation to
            simulation, social networking, and verified achievements.
          </p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search modules, features..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Modules</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {filteredModules.map((mod) => (
              <Link key={mod.href} href={mod.href}>
                <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-brand-500/30 h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`grid size-10 place-items-center rounded-lg ${colorClasses(mod.color).bg}`}>
                        <mod.icon className={`size-5 ${colorClasses(mod.color).text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-400">
                            {mod.label}
                          </h3>
                          <div className="size-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{mod.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="size-4 text-brand-600" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStatus ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="mb-4 size-10 text-muted-foreground" />
                  <p className="text-sm font-medium">No activity yet</p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                    Your recent activity across MUNOS modules will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                      <div className="grid size-8 place-items-center rounded-full bg-muted/60 text-xs">
                        {activity.type === "POST" ? <MessageSquare className="size-4" /> :
                         activity.type === "SIMULATION" ? <FlaskConical className="size-4" /> :
                         activity.type === "CERTIFICATE" ? <FileBadge className="size-4" /> :
                         <Clock className="size-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{activity.message}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Bot className="size-5 text-brand-600" /> Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/simulator">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FlaskConical className="size-3.5" /> Start Simulation
                  </Button>
                </Link>
                <Link href="/coach">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Camera className="size-3.5" /> Upload Speech
                  </Button>
                </Link>
                <Link href="/news">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Newspaper className="size-3.5" /> Read News
                  </Button>
                </Link>
                <Link href="/marketplace">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <ShoppingBag className="size-3.5" /> Browse Templates
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Shield className="size-4 text-emerald-600" /> System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loadingStatus ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                ) : systemStatus.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-sm">
                    <span>{s.name}</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`size-1.5 rounded-full ${colorClasses(s.color).dot}`} />
                      <span className="text-xs text-muted-foreground">{s.status}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
