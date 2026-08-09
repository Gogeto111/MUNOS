"use client";

import { useState, useEffect, useMemo } from "react";
import { Star, Trash2, ExternalLink, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SavedConferenceMeta } from "@/hooks/use-saved-conferences";

const META_KEY = "munos.saved.conferences.meta";

function readMeta(): SavedConferenceMeta[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(META_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return Object.values(obj as Record<string, SavedConferenceMeta>).sort((a, b) => b.savedAt - a.savedAt);
  } catch { return []; }
}

function writeMeta(list: SavedConferenceMeta[]) {
  if (typeof window === "undefined") return;
  try {
    const obj: Record<string, SavedConferenceMeta> = {};
    for (const c of list) obj[c.id] = c;
    window.localStorage.setItem(META_KEY, JSON.stringify(obj));
  } catch {}
}

type SortKey = "saved" | "name" | "date";

export function MyConferences() {
  const [conferences, setConferences] = useState<SavedConferenceMeta[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("saved");

  useEffect(() => {
    setConferences(readMeta());
    setLoaded(true);
    const handler = () => setConferences(readMeta());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const sorted = useMemo(() => {
    const copy = [...conferences];
    switch (sortBy) {
      case "name": return copy.sort((a, b) => a.name.localeCompare(b.name));
      case "date": return copy.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      default: return copy.sort((a, b) => b.savedAt - a.savedAt);
    }
  }, [conferences, sortBy]);

  const remove = (id: string) => {
    const updated = conferences.filter((c) => c.id !== id);
    setConferences(updated);
    writeMeta(updated);
  };

  if (!loaded || conferences.length === 0) return null;

  return (
    <Card className="border-brand-500/20 bg-brand-500/[0.03]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Star className="size-4 text-yellow-500" />
          My Conferences
          <Badge variant="outline" className="ml-2 text-[10px]">{conferences.length}</Badge>
        </CardTitle>
        <div className="flex items-center gap-1">
          <ArrowUpDown className="size-3 text-muted-foreground" />
          {(["saved", "name", "date"] as const).map((key) => (
            <Button
              key={key}
              size="sm"
              variant={sortBy === key ? "default" : "ghost"}
              className="h-6 px-2 text-[10px]"
              onClick={() => setSortBy(key)}
            >
              {key === "saved" ? "Recent" : key === "name" ? "A-Z" : "Date"}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sorted.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-border/40 p-3 transition-colors hover:bg-muted/30"
            >
              <Link href={`/conference/${c.slug}`} className="flex-1 min-w-0 hover:underline">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {c.city}, {c.country} · {new Date(c.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {new Date(c.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </Link>
              <div className="flex items-center gap-1 ml-2">
                {c.website && (
                  <Button asChild variant="ghost" size="icon" className="size-7 p-0">
                    <a href={c.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink className="size-3" />
                    </a>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 p-0 text-muted-foreground hover:text-red-500"
                  onClick={() => remove(c.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
