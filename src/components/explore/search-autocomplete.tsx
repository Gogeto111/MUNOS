"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const RECENT_KEY = "munos-recent-searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  if (typeof window === "undefined") return;
  const recent = getRecentSearches().filter((r) => r !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function SearchAutocomplete({ className }: { className?: string }) {
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<
    { id: string; name: string; city: string; country: string; slug: string }[]
  >([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  const recentSearches = getRecentSearches();

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
    setActiveIndex(-1);
  }, [suggestions, open]);

  React.useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/conferences/search?q=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setSuggestions(data);
            setOpen(true);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const allItems = React.useMemo(() => {
    if (query.trim() && suggestions.length > 0) return suggestions;
    return [];
  }, [query, suggestions]);

  function handleSelect(item: { slug: string; name: string }) {
    addRecentSearch(item.name);
    setOpen(false);
    setQuery("");
    router.push(`/conference/${item.slug}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    const items = allItems;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(items[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const showRecent = open && !query.trim() && recentSearches.length > 0;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search conferences by name, city, or country..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim()) setOpen(true);
          }}
          onFocus={() => {
            if (query.trim() && suggestions.length > 0) setOpen(true);
            else if (!query.trim() && recentSearches.length > 0) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="h-10 w-full rounded-xl border border-input/50 bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-brand-500" />
        )}
      </div>

      {showRecent && (
        <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-border/60 bg-popover p-1 shadow-xl">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Recent searches
          </div>
          {recentSearches.map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term);
                inputRef.current?.focus();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <Clock className="size-3.5 text-muted-foreground" />
              <span>{term}</span>
            </button>
          ))}
        </div>
      )}

      {open && query.trim() && allItems.length > 0 && (
        <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-border/60 bg-popover p-1 shadow-xl">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Conferences
          </div>
          {allItems.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
                activeIndex === idx
                  ? "bg-muted text-foreground"
                  : "text-foreground hover:bg-muted/60",
              )}
            >
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate font-medium">{item.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {[item.city, item.country].filter(Boolean).join(", ")}
                </div>
              </div>
              <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      {open && query.trim() && !loading && allItems.length === 0 && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-xl border border-border/60 bg-popover p-6 text-center shadow-xl">
          <p className="text-sm text-muted-foreground">No conferences found</p>
        </div>
      )}
    </div>
  );
}
