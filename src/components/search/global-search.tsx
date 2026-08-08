"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { globalSearch, type SearchGroup } from "@/lib/actions/search";

export function GlobalSearch({ className }: { className?: string }) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchGroup[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const flatResults = React.useMemo(
    () => results.flatMap((g) => g.results),
    [results],
  );

  React.useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      globalSearch(query).then((res) => {
        if (res.status === "success" && res.data) {
          setResults(res.data);
          setOpen(true);
        }
        setLoading(false);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || flatResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % flatResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const target = flatResults[activeIndex];
      if (target) {
        window.location.href = target.href;
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  let runningIndex = -1;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search conferences, people, news..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          className="h-9 w-full rounded-lg border border-input/50 bg-muted/40 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-500/50 focus:bg-background focus:ring-1 focus:ring-brand-500/20"
        />
        {loading && (
          <Loader2 className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && flatResults.length > 0 && (
        <div className="absolute top-full z-50 mt-2 w-full min-w-[320px] overflow-hidden rounded-xl border border-border/60 bg-popover p-1 shadow-xl">
          {results.map((group) => (
            <div key={group.type}>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {group.type}
              </div>
              {group.results.map((result) => {
                runningIndex++;
                const idx = runningIndex;
                return (
                  <Link
                    key={result.id}
                    href={result.href}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
                      activeIndex === idx
                        ? "bg-muted text-foreground"
                        : "text-foreground hover:bg-muted/60",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{result.label}</div>
                      {result.subtitle && (
                        <div className="truncate text-xs text-muted-foreground">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {open && query.trim() && !loading && flatResults.length === 0 && (
        <div className="absolute top-full z-50 mt-2 w-full min-w-[320px] rounded-xl border border-border/60 bg-popover p-6 text-center shadow-xl">
          <p className="text-sm text-muted-foreground">No results found for &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
