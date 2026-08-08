"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Loader2, Users } from "lucide-react";
import { getSuggestedUsers, type SuggestedUser } from "@/lib/actions/social-suggestions";
import { toggleFollow } from "@/lib/actions/follow";

export function SuggestedUsers() {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    getSuggestedUsers().then((r) => {
      if (r.status === "success" && r.data) setUsers(r.data);
      setLoading(false);
    });
  }, []);

  const handleFollow = async (userId: string) => {
    setPendingId(userId);
    const result = await toggleFollow(userId);
    if (result.status === "success" && result.data) {
      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (result.data!.following) {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    }
    setPendingId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <UserPlus className="size-4" /> Who to Follow
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-7 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No suggestions available. Complete your profile to get personalized suggestions.
          </p>
        ) : (
          <div className="space-y-3">
            {users.map((u) => {
              const isFollowing = followingIds.has(u.id);
              const isPending = pendingId === u.id;
              return (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-muted/60 text-xs font-bold">
                    {u.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{u.name}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      {u.country && <span>{u.country}</span>}
                      {u.country && <span className="text-border">·</span>}
                      <Users className="size-2.5" />
                      <span className="tabular-nums">{u.followerCount}</span>
                      <span className="text-border">·</span>
                      <span className="truncate">{u.reason}</span>
                    </div>
                  </div>
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    size="xs"
                    onClick={() => handleFollow(u.id)}
                    disabled={isPending}
                    className="shrink-0"
                  >
                    {isPending ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : isFollowing ? (
                      "Following"
                    ) : (
                      "Follow"
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
