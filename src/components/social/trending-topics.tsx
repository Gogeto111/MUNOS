"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, X } from "lucide-react";
import { getTrendingTopics, type TrendingTopic } from "@/lib/actions/social";

interface TrendingTopicsProps {
  activeTopic?: string | null;
  onSelectTopic?: (topic: string | null) => void;
}

export function TrendingTopics({ activeTopic, onSelectTopic }: TrendingTopicsProps) {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrendingTopics().then((r) => {
      if (r.status === "success" && r.data) setTopics(r.data);
      setLoading(false);
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="size-4" /> Trending Topics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-5/6" />
          </div>
        ) : topics.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No trending topics yet. Use hashtags in your posts!
          </p>
        ) : (
          <div className="space-y-1">
            {activeTopic && (
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Filtering:</span>
                <button
                  onClick={() => onSelectTopic?.(null)}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-600 hover:bg-brand-500/20 transition-colors"
                >
                  {activeTopic}
                  <X className="size-3" />
                </button>
              </div>
            )}
            {topics.map((topic) => (
              <button
                key={topic.tag}
                onClick={() =>
                  onSelectTopic?.(
                    activeTopic === topic.tag ? null : topic.tag,
                  )
                }
                className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                  activeTopic === topic.tag
                    ? "bg-brand-500/10 text-brand-600"
                    : "hover:bg-muted/60 text-foreground"
                }`}
              >
                <span className="font-medium truncate">{topic.tag}</span>
                <span className="text-muted-foreground tabular-nums ml-2 shrink-0">
                  {topic.count} post{topic.count !== 1 ? "s" : ""}
                </span>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
