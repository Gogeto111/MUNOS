"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Globe,
  Search,
  RefreshCw,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Rss,
  Newspaper,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  listNewsArticles,
  syncNewsFeeds,
  getNewsArticle,
} from "@/lib/actions/news";
import type { NewsArticle, SyncFeedResult } from "@/lib/actions/news";
import { UN_FEEDS } from "@/lib/ai/sources/registry";

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncFeedResult[]>([]);
  const [showSyncResults, setShowSyncResults] = useState(false);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [articleText, setArticleText] = useState<string>("");
  const [loadingArticle, setLoadingArticle] = useState(false);

  const loadArticles = useCallback(async (query?: string) => {
    setIsLoading(true);
    const result = await listNewsArticles({
      search: query,
      limit: 50,
    });
    if (result.status === "success" && result.data) {
      setArticles(result.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleSearch = async () => {
    await loadArticles(search || undefined);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResults([]);
    const result = await syncNewsFeeds({ limitPerFeed: 3 });
    if (result.status === "success" && result.data) {
      setSyncResults(result.data.results);
      setShowSyncResults(true);
      const added = result.data.results.reduce((s, r) => s + r.added, 0);
      toast.success(`Synced ${added} new articles from ${result.data.results.length} feeds`);
      await loadArticles(search || undefined);
    } else {
      toast.error(result.message);
    }
    setIsSyncing(false);
  };

  const handleExpandArticle = async (articleId: string) => {
    if (expandedArticle === articleId) {
      setExpandedArticle(null);
      setArticleText("");
      return;
    }
    setLoadingArticle(true);
    setExpandedArticle(articleId);
    const result = await getNewsArticle(articleId);
    if (result.status === "success" && result.data) {
      setArticleText(result.data.text);
    } else {
      setArticleText("Failed to load article.");
    }
    setLoadingArticle(false);
  };

  const topics = [
    { label: "Peace & Security", count: articles.filter((a) => a.source.toLowerCase().includes("peace")).length },
    { label: "Human Rights", count: articles.filter((a) => a.source.toLowerCase().includes("human rights") || a.source.toLowerCase().includes("ohchr")).length },
    { label: "Climate", count: articles.filter((a) => a.source.toLowerCase().includes("climate")).length },
    { label: "Health", count: articles.filter((a) => a.source.toLowerCase().includes("health")).length },
    { label: "Economy", count: articles.filter((a) => a.source.toLowerCase().includes("economic")).length },
    { label: "General", count: articles.filter((a) => a.source.toLowerCase().includes("top stories") || a.source.toLowerCase().includes("global")).length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI News Engine</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              UN feeds, global events, and AI-powered summaries for MUN preparation.
            </p>
          </div>
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            className="gap-2"
          >
            {isSyncing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            {isSyncing ? "Syncing..." : "Sync Feeds"}
          </Button>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search UN news..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button variant="outline" onClick={handleSearch}>
            Search
          </Button>
        </div>

        {showSyncResults && syncResults.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Last Sync Results</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSyncResults(false)}
                >
                  Dismiss
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {syncResults.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 rounded-lg border border-border/60 p-2 text-xs"
                  >
                    {r.status === "ok" ? (
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="size-3.5 text-red-500" />
                    )}
                    <span className="flex-1 truncate">{r.label}</span>
                    <span className="text-muted-foreground">
                      {r.added > 0 ? `+${r.added}` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-16">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : articles.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Globe className="mb-4 size-10 text-muted-foreground" />
                  <p className="text-sm font-medium">No news articles yet</p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                    Click &quot;Sync Feeds&quot; to pull the latest UN news and global events.
                  </p>
                </CardContent>
              </Card>
            ) : (
              articles.map((article) => (
                <Card
                  key={article.id}
                  className="cursor-pointer transition-colors hover:border-brand-500/30"
                  onClick={() => handleExpandArticle(article.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {article.source}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(article.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold leading-snug">
                          {article.title}
                        </h3>
                        {article.preview && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {article.preview}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-3">
                          {article.originUrl && (
                            <a
                              href={article.originUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[10px] text-brand-600 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="size-3" />
                              Source
                            </a>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {article.chunkCount} chunk{article.chunkCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      {expandedArticle === article.id ? (
                        <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                      )}
                    </div>
                    {expandedArticle === article.id && (
                      <div className="mt-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                        {loadingArticle ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          <p className="text-xs leading-relaxed whitespace-pre-wrap max-h-[40vh] overflow-y-auto">
                            {articleText}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Newspaper className="size-4" />
                  Topic Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topics.map((t) => (
                  <div key={t.label} className="flex items-center justify-between text-xs">
                    <span>{t.label}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {t.count}
                    </Badge>
                  </div>
                ))}
                {articles.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Topics will populate after syncing feeds.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Rss className="size-4" />
                  UN Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[30vh]">
                  <div className="space-y-2">
                    {UN_FEEDS.map((feed) => (
                      <div
                        key={feed.id}
                        className="rounded-lg border border-border/60 p-2"
                      >
                        <p className="text-xs font-medium">{feed.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {feed.topics}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
