"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Heart, Calendar } from "lucide-react";
import { getSocialStats } from "@/lib/actions/social";

interface SocialStats {
  postCount: number;
  totalLikes: number;
  memberSince: string;
}

export function ActivityStats() {
  const [stats, setStats] = useState<SocialStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSocialStats().then((r) => {
      if (r.status === "success" && r.data) setStats(r.data);
      setLoading(false);
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Heart className="size-4" /> Your Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/40 p-3">
              <FileText className="size-4 text-muted-foreground" />
              <span className="text-lg font-semibold tabular-nums">{stats.postCount}</span>
              <span className="text-[10px] text-muted-foreground">Posts</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/40 p-3">
              <Heart className="size-4 text-muted-foreground" />
              <span className="text-lg font-semibold tabular-nums">{stats.totalLikes}</span>
              <span className="text-[10px] text-muted-foreground">Likes</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/40 p-3">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-xs font-semibold">
                {new Date(stats.memberSince).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
              <span className="text-[10px] text-muted-foreground">Joined</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            Sign in to see your stats.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
