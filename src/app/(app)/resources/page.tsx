"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  ExternalLink,
  FileText,
  Wrench,
  Link2,
  Bookmark,
  BookmarkCheck,
  BookOpen,
} from "lucide-react";
import {
  RESOURCES,
  RESOURCE_CATEGORIES,
  type ResourceCategory,
  type ResourceType,
} from "@/lib/resource-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<ResourceType, typeof FileText> = {
  PDF: FileText,
  Link: Link2,
  Tool: Wrench,
};

const TYPE_COLORS: Record<ResourceType, string> = {
  PDF: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25",
  Link: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25",
  Tool: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
};

const CATEGORY_COLORS: Record<ResourceCategory, string> = {
  "UN Documents": "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  Guides: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Templates: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Tools: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

const STORAGE_KEY = "munos-resources-bookmarked";

function ResourceCard({
  resource,
  isBookmarked,
  onToggleBookmark,
}: {
  resource: (typeof RESOURCES)[number];
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}) {
  const TypeIcon = TYPE_ICONS[resource.type];

  return (
    <Card className="transition-colors hover:bg-muted/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn("shrink-0 text-[10px]", TYPE_COLORS[resource.type])}
            >
              <TypeIcon className="mr-1 size-3" />
              {resource.type}
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] shrink-0",
                CATEGORY_COLORS[resource.category]
              )}
            >
              {resource.category}
            </Badge>
          </div>
          <button
            onClick={() => onToggleBookmark(resource.id)}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            {isBookmarked ? (
              <BookmarkCheck className="size-4 text-brand-500" />
            ) : (
              <Bookmark className="size-4" />
            )}
          </button>
        </div>
        <CardTitle className="mt-2 text-base">{resource.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {resource.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild size="sm" variant="outline">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="gap-1.5"
          >
            <ExternalLink className="size-3.5" />
            Open resource
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<ResourceCategory | "All">("All");
  const [selectedType, setSelectedType] = useState<ResourceType | "All">("All");
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [showBookmarked, setShowBookmarked] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setBookmarked(new Set(JSON.parse(stored)));
    } catch {}
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const filtered = useMemo(() => {
    return RESOURCES.filter((r) => {
      const matchesSearch =
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || r.category === selectedCategory;
      const matchesType =
        selectedType === "All" || r.type === selectedType;
      const matchesBookmarked = !showBookmarked || bookmarked.has(r.id);
      return matchesSearch && matchesCategory && matchesType && matchesBookmarked;
    });
  }, [search, selectedCategory, selectedType, showBookmarked, bookmarked]);

  const bookmarkCount = bookmarked.size;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Resource Library
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {RESOURCES.length} curated resources — UN documents, guides,
          templates, and tools for your MUN preparation.
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showBookmarked ? "default" : "outline"}
          size="sm"
          onClick={() => setShowBookmarked(!showBookmarked)}
          className="gap-1.5"
        >
          <Bookmark className="size-3.5" />
          Bookmarked
          {bookmarkCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-[10px]">
              {bookmarkCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "All" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("All")}
        >
          All ({RESOURCES.length})
        </Button>
        {RESOURCE_CATEGORIES.map((cat) => {
          const count = RESOURCES.filter((r) => r.category === cat).length;
          return (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat} ({count})
            </Button>
          );
        })}
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap gap-2">
        {(["All", "PDF", "Link", "Tool"] as const).map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(type)}
          >
            {type === "All" ? "All Types" : type}
          </Button>
        ))}
      </div>

      {/* Resources grid */}
      {filtered.length === 0 ? (
        <Card className="flex min-h-48 flex-col items-center justify-center border-dashed text-center">
          <CardHeader className="items-center">
            <div className="mb-3 grid size-12 place-items-center rounded-2xl border border-border bg-muted/50">
              <BookOpen className="size-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-base">No resources found</CardTitle>
            <CardDescription>
              Try adjusting your search or filter criteria.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              isBookmarked={bookmarked.has(resource.id)}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </div>
      )}

      {/* Quick Reference */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <BookOpen className="size-4" />
            Research Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">
              UN Digital Library:
            </span>{" "}
            Use the advanced search to filter by committee, session, and document
            type. The &ldquo;Vote Data&rdquo; section shows individual country
            votes.
          </p>
          <p>
            <span className="font-semibold text-foreground">
              Document Symbols:
            </span>{" "}
            A = General Assembly, S = Security Council, E = ECOSOC, etc. The
            number after the slash is the resolution number.
          </p>
          <p>
            <span className="font-semibold text-foreground">
              Country Research:
            </span>{" "}
            Always check your country&rsquo;s UN membership status, regional
            group, and recent statements before your first session.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
