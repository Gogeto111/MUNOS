"use client";

import { useState, useTransition, useEffect } from "react";
import { toggleFollow, isFollowing, getFollowCounts } from "@/lib/actions/follow";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck } from "lucide-react";

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing: boolean;
  initialFollowerCount: number;
}

export function FollowButton({ targetUserId, initialFollowing, initialFollowerCount }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    async function sync() {
      const [statusRes, countRes] = await Promise.all([
        isFollowing(targetUserId),
        getFollowCounts(targetUserId),
      ]);
      if (cancelled) return;
      if (statusRes.status === "success" && statusRes.data) setFollowing(statusRes.data.following);
      if (countRes.status === "success" && countRes.data) setFollowerCount(countRes.data.followers);
    }
    sync();
    return () => { cancelled = true; };
  }, [targetUserId]);

  async function handleToggle() {
    startTransition(async () => {
      const result = await toggleFollow(targetUserId);
      if (result.status === "success" && result.data) {
        setFollowing(result.data.following);
        setFollowerCount((c) => (result.data!.following ? c + 1 : c - 1));
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={following ? "outline" : "default"}
        size="sm"
        onClick={handleToggle}
        disabled={isPending}
      >
        {following ? (
          <>
            <UserCheck className="size-4" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="size-4" />
            Follow
          </>
        )}
      </Button>
      <span className="text-xs text-muted-foreground tabular-nums">
        {followerCount} follower{followerCount !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
