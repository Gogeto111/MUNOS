"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Star,
  ExternalLink,
  Loader2,
  GitFork,
  Code2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  searchMUNRepos,
  searchMUNGuides,
} from "@/lib/actions/github-search";

interface Repo {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  url: string;
  language: string | null;
  updatedAt: string;
}

function RepoCard({ repo }: { repo: Repo }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <GitFork className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-semibold group-hover:text-primary">
              {repo.fullName}
            </span>
          </div>
          {repo.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {repo.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            {repo.language && (
              <span className="flex items-center gap-1">
                <Code2 className="size-3" />
                {repo.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="size-3" />
              {repo.stars.toLocaleString()}
            </span>
            <span>
              Updated {new Date(repo.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <ExternalLink className="size-3.5 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-foreground" />
      </div>
    </a>
  );
}

function RepoSkeleton() {
  return (
    <div className="rounded-lg border border-border/60 p-3 space-y-2">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex gap-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  );
}

export function GitHubResources() {
  const [query, setQuery] = useState("");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [popular, setPopular] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    searchMUNGuides(6).then((results) => {
      setPopular(results);
      setInitialLoading(false);
    });
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const results = await searchMUNRepos(query.trim(), 8);
    setRepos(results);
    setLoading(false);
  };

  const displayRepos = query.trim() ? repos : popular;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GitFork className="size-4" />
          MUN Open Source Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search MUN repos, guides, tools..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            size="sm"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
          </Button>
        </div>

        {query.trim() && repos.length > 0 && (
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {repos.length} results
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setQuery("");
                setRepos([]);
              }}
            >
              Show popular
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {initialLoading || loading ? (
            <>
              <RepoSkeleton />
              <RepoSkeleton />
              <RepoSkeleton />
            </>
          ) : displayRepos.length > 0 ? (
            displayRepos.map((repo) => (
              <RepoCard key={repo.fullName} repo={repo} />
            ))
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No repositories found. Try a different search.
            </div>
          )}
        </div>

        {!query.trim() && !initialLoading && popular.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Showing popular MUN repositories
          </p>
        )}
      </CardContent>
    </Card>
  );
}
