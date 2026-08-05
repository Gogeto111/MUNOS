"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserPlus,
  Search,
  Users,
  CheckCircle,
} from "lucide-react";

interface Delegate {
  id: string;
  name: string;
  country: string;
  isFollowing: boolean;
}

interface DelegateManagerProps {
  delegates: Delegate[];
  onFollow?: (id: string) => void;
  onUnfollow?: (id: string) => void;
}

export function DelegateManager({
  delegates,
  onFollow,
  onUnfollow,
}: DelegateManagerProps) {
  const [search, setSearch] = useState("");

  const filtered = delegates.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.country.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Users className="size-4" /> Delegates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search delegates..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {delegates.length === 0
              ? "No delegates found."
              : "No delegates match your search."}
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((delegate) => (
              <div
                key={delegate.id}
                className="flex items-center justify-between rounded-lg border border-border/60 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-8 place-items-center rounded-full bg-muted/60 text-xs font-bold">
                    {delegate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{delegate.name}</p>
                    <p className="text-xs text-muted-foreground">{delegate.country}</p>
                  </div>
                </div>
                {delegate.isFollowing ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => onUnfollow?.(delegate.id)}
                  >
                    <CheckCircle className="size-3" /> Following
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1"
                    onClick={() => onFollow?.(delegate.id)}
                  >
                    <UserPlus className="size-3" /> Follow
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
