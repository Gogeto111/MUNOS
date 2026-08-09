"use client";

import { useState } from "react";
import { Camera, Search, Loader2, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface IgProfile {
  username: string;
  name: string;
  biography: string;
  website: string;
  followers_count: number;
  media_count: number;
  profile_picture_url: string;
  source_hashtag: string;
  last_post_caption?: string;
}

const DEFAULT_HASHTAGS = ["mun", "modelunitednations", "harvardmun", "mun2026", "thimun", "bestdelegate"];

export function InstagramDiscovery() {
  const [profiles, setProfiles] = useState<IgProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await fetch("/api/mun/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hashtags: DEFAULT_HASHTAGS }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to scan Instagram");
      } else {
        setProfiles(data.data ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white">
            <Camera className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold">Instagram MUN Discovery</h3>
            <p className="text-xs text-muted-foreground">
              Find real MUN pages, organizers, and conferences on Instagram
            </p>
          </div>
        </div>
        <Button onClick={handleScan} disabled={loading} size="sm">
          {loading ? (
            <Loader2 className="mr-2 size-3 animate-spin" />
          ) : (
            <Search className="mr-2 size-3" />
          )}
          Scan Instagram
        </Button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {searched && !loading && profiles.length === 0 && !error && (
        <p className="mt-4 text-sm text-muted-foreground">
          No MUN pages found. Try again later or check your Instagram API configuration.
        </p>
      )}

      {profiles.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <Card key={p.username} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {p.profile_picture_url ? (
                    <img
                      src={p.profile_picture_url}
                      alt={p.name}
                      className="size-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="grid size-10 place-items-center rounded-full bg-muted">
                      <Camera className="size-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">@{p.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.name}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {p.source_hashtag}
                  </Badge>
                </div>

                {p.biography && (
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{p.biography}</p>
                )}

                <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="size-3" />
                    {p.followers_count?.toLocaleString()} followers
                  </span>
                  <span>{p.media_count} posts</span>
                </div>

                {p.last_post_caption && (
                  <p className="mt-2 text-[10px] text-muted-foreground/70 line-clamp-1 italic">
                    Latest: {p.last_post_caption}
                  </p>
                )}

                <div className="mt-3 flex gap-2">
                  <a
                    href={`https://instagram.com/${p.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-pink-500/10 px-2.5 py-1 text-[10px] font-medium text-pink-600 transition-colors hover:bg-pink-500/20"
                  >
                    <Camera className="size-3" />
                    View Profile
                  </a>
                  {p.website && (
                    <a
                      href={p.website.startsWith("http") ? p.website : `https://${p.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-1 text-[10px] font-medium text-brand-600 transition-colors hover:bg-brand-500/20"
                    >
                      <Globe className="size-3" />
                      Website
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
