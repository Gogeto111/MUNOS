"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FolderPlus, Play, Trophy, CalendarCheck, Loader2 } from "lucide-react";
import { getDashboardStats } from "@/lib/actions/os";

interface Stats {
  totalWorkspaces: number;
  activeSimulations: number;
  awardsWon: number;
  upcomingConferences: number;
}

const STAT_CARDS: Array<{
  key: keyof Stats;
  label: string;
  icon: React.ElementType;
  color: string;
}> = [
  { key: "totalWorkspaces", label: "Total Workspaces", icon: FolderPlus, color: "bg-blue-500/10 text-blue-600" },
  { key: "activeSimulations", label: "Active Simulations", icon: Play, color: "bg-emerald-500/10 text-emerald-600" },
  { key: "awardsWon", label: "Awards Won", icon: Trophy, color: "bg-amber-500/10 text-amber-600" },
  { key: "upcomingConferences", label: "Upcoming Conferences", icon: CalendarCheck, color: "bg-purple-500/10 text-purple-600" },
];

function AnimatedCount({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (displayed === value) return;
    const step = value > displayed ? 1 : -1;
    const timer = setTimeout(() => setDisplayed((prev) => prev + step), 30);
    return () => clearTimeout(timer);
  }, [displayed, value]);

  return (
    <span className="text-2xl font-semibold tabular-nums">
      {displayed}
    </span>
  );
}

export function QuickStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then((result) => {
      if (result.status === "success" && result.data) {
        setStats(result.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
        <Card key={key}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${color}`}>
                <Icon className="size-5" />
              </div>
              <div>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <AnimatedCount value={stats?.[key] ?? 0} />
                )}
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
