"use client";

import { useState } from "react";
import { CheckCircle2, Globe, Loader2, Radio, RefreshCw, XCircle } from "lucide-react";
import {
  syncLiveUnSources,
  syncOfficialSources,
  type SyncResult,
} from "@/lib/actions/ai-sources";
import { SectionCard } from "@/components/profile/section-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type SyncKind = "official" | "live";

/**
 * Live & official sources panel: runs the conference-site crawler (CRAWLED
 * documents) and the UN news-feed sync (LIVE documents), showing a per-source
 * / per-feed breakdown of what was added.
 */
export function SourcesSection({ workspaceId }: { workspaceId: string }) {
  const [running, setRunning] = useState<SyncKind | null>(null);
  const [results, setResults] = useState<SyncResult[]>([]);

  const runSync = async (kind: SyncKind) => {
    if (running) return;
    setRunning(kind);
    setResults([]);
    try {
      const result =
        kind === "official"
          ? await syncOfficialSources(workspaceId, { limitPerSource: 2 })
          : await syncLiveUnSources(workspaceId, { limitPerFeed: 4 });
      if (result.status === "success" && result.data) {
        setResults(result.data.results);
        const added = result.data.results.reduce((sum, item) => sum + item.added, 0);
        if (added > 0) {
          toast.success(`Indexed ${added} new source${added === 1 ? "" : "s"} from ${result.data.results.length} places.`);
        } else {
          toast.info("No new sources — everything is already indexed.");
        }
      } else {
        toast.error(result.message);
      }
    } finally {
      setRunning(null);
    }
  };

  return (
    <SectionCard
      title="Live & official sources"
      description="Crawl official conference sites for background guides and pull the latest UN news feeds into your research library."
      icon={Globe}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={running !== null}
            onClick={() => void runSync("official")}
          >
            {running === "official" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Crawl official conference sites
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={running !== null}
            onClick={() => void runSync("live")}
          >
            {running === "live" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Radio className="size-4" />
            )}
            Sync live UN feeds
          </Button>
        </div>

        {running ? (
          <p className="text-sm text-muted-foreground">
            Working through sources&hellip; this can take a minute.
          </p>
        ) : null}

        {results.length > 0 ? (
          <ul className="divide-y divide-border/70 rounded-lg border border-border/70">
            {results.map((result) => (
              <li key={result.id} className="flex items-center gap-3 px-4 py-2.5">
                {result.status === "error" ? (
                  <XCircle className="size-4 shrink-0 text-destructive" />
                ) : result.added > 0 ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                ) : (
                  <span className="size-4 shrink-0 rounded-full border border-border/80" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{result.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {result.status === "error"
                      ? result.error ?? "Sync failed."
                      : result.added > 0
                        ? `${result.added} new · ${result.chunks} chunks`
                        : "No new content"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </SectionCard>
  );
}
