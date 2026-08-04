"use client";

import * as React from "react";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DiscoverFilterSheet } from "@/components/explore/discover-filter-sheet";
import { useDiscoverUpdater } from "@/hooks/use-discover-updater";
import { cn } from "@/lib/utils";
import type { DiscoverFilters, DiscoveryFacets } from "@/lib/search";
import {
  DISCOVER_SORTS,
  FORMAT_OPTIONS,
} from "@/lib/search";
import type { ConferenceFormat } from "@/generated/prisma/browser";

const FORMAT_SEGMENTS: { value: ConferenceFormat | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  ...FORMAT_OPTIONS.map((o) => ({ value: o.value as ConferenceFormat, label: o.label })),
];

export function DiscoverToolbar({
  filters,
  facets,
}: {
  filters: DiscoverFilters;
  facets: DiscoveryFacets;
}) {
  const { apply, clear } = useDiscoverUpdater(filters);
  const [draft, setDraft] = React.useState(filters.q ?? "");
  const [sheetOpen, setSheetOpen] = React.useState(false);

  React.useEffect(() => {
    setDraft(filters.q ?? "");
  }, [filters.q]);

  const activeFormat: ConferenceFormat | "ALL" = filters.format ?? "ALL";

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    apply({ q: draft.trim() || undefined }, true);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={submitSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Search conferences, committees, locations…"
            aria-label="Search conferences"
            className="h-12 rounded-full border-border/70 bg-card pl-10 pr-4 text-[15px] shadow-sm focus-visible:ring-brand-500/40"
          />
        </div>
        <Button type="submit" className="h-12 rounded-full px-6 shadow-sm">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-full border border-border/70 bg-card p-1 shadow-sm">
          {FORMAT_SEGMENTS.map((segment) => (
            <button
              key={segment.value}
              type="button"
              onClick={() =>
                apply(
                  segment.value === "ALL"
                    ? { format: undefined }
                    : { format: segment.value },
                )
              }
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                activeFormat === segment.value
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {segment.label}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-10 gap-2 rounded-full"
          onClick={() => setSheetOpen(true)}
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {filters.country ||
          filters.city ||
          filters.school ||
          filters.committee ||
          filters.fee !== undefined ||
          filters.date !== undefined ||
          (filters.difficulty?.length ?? 0) > 0 ? (
            <span className="flex size-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-semibold text-white">
              {[
                filters.country,
                filters.city,
                filters.school,
                filters.committee,
                filters.fee !== undefined && filters.fee !== "all",
                filters.date !== undefined && filters.date !== "all",
                filters.difficulty?.length ?? 0,
              ].filter(Boolean).length}
            </span>
          ) : null}
        </Button>

        <div className="ml-auto flex items-center gap-1.5">
          <ArrowUpDown className="size-4 text-muted-foreground" />
          <Select
            value={filters.sort ?? "soonest"}
            onValueChange={(value) =>
              apply({ sort: value as DiscoverFilters["sort"] }, true)
            }
          >
            <SelectTrigger className="h-10 w-[160px] rounded-full border-border/70 bg-card text-[13px] shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {DISCOVER_SORTS.map((sort) => (
                <SelectItem key={sort.value} value={sort.value}>
                  {sort.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DiscoverFilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        filters={filters}
        facets={facets}
        onApply={(patch) => apply(patch)}
        onClear={clear}
      />
    </div>
  );
}
