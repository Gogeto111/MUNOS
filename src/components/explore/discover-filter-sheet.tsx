"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { DiscoverFilters, DiscoveryFacets } from "@/lib/search";
import { DATE_OPTIONS, FEE_OPTIONS } from "@/lib/search";
import { EXPERIENCE_LEVELS } from "@/lib/constants";

function FacetSelect({
  label,
  value,
  options,
  onValueChange,
  placeholder,
}: {
  label: string;
  value?: string;
  options: string[];
  onValueChange: (value?: string) => void;
  placeholder: string;
}) {
  if (options.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <Label className="text-[13px] font-medium text-muted-foreground">{label}</Label>
      <Select
        value={value ?? "ALL"}
        onValueChange={(v) => onValueChange(v === "ALL" ? undefined : v)}
      >
        <SelectTrigger className="h-10 rounded-lg">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Any</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function DiscoverFilterSheet({
  open,
  onOpenChange,
  filters,
  facets,
  onApply,
  onClear,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: DiscoverFilters;
  facets: DiscoveryFacets;
  onApply: (patch: Partial<DiscoverFilters>) => void;
  onClear: () => void;
}) {
  const [local, setLocal] = React.useState<DiscoverFilters>(filters);
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setLocal(filters);
      setDirty(false);
    }
  }, [open, filters]);

  const patch = (value: Partial<DiscoverFilters>) => {
    setLocal((prev) => ({ ...prev, ...value }));
    setDirty(true);
  };

  const toggleDifficulty = (value: string) => {
    const current = local.difficulty ?? [];
    const next = current.includes(value as never)
      ? current.filter((v) => v !== value)
      : [...current, value as never];
    patch({ difficulty: next.length > 0 ? next : undefined });
  };

  const handleClear = () => {
    onClear();
    onOpenChange(false);
  };

  const handleApply = () => {
    onApply(local);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/60 px-6 py-4">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 px-6 py-5">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-muted-foreground">When</Label>
              <Select
                value={local.date ?? "all"}
                onValueChange={(v) =>
                  patch({ date: v === "all" ? undefined : (v as DiscoverFilters["date"]) })
                }
              >
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-muted-foreground">Fee</Label>
              <Select
                value={local.fee ?? "all"}
                onValueChange={(v) =>
                  patch({ fee: v === "all" ? undefined : (v as DiscoverFilters["fee"]) })
                }
              >
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-muted-foreground">
                Open to external delegates
              </Label>
              <Select
                value={local.external ?? "all"}
                onValueChange={(v) =>
                  patch({ external: v === "all" ? undefined : (v as "yes" | "no") })
                }
              >
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All conferences</SelectItem>
                  <SelectItem value="yes">External delegates welcome</SelectItem>
                  <SelectItem value="no">Invite only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-muted-foreground">Difficulty</Label>
              <div className="space-y-1.5">
                {EXPERIENCE_LEVELS.map((option) => (
                  <div key={option.value} className="flex items-center gap-2.5">
                    <Checkbox
                      id={`difficulty-${option.value}`}
                      checked={(local.difficulty ?? []).includes(option.value as never)}
                      onCheckedChange={() => toggleDifficulty(option.value)}
                    />
                    <Label
                      htmlFor={`difficulty-${option.value}`}
                      className="cursor-pointer text-sm font-normal text-foreground"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <FacetSelect
              label="Country"
              value={local.country}
              options={facets.countries}
              placeholder="Any country"
              onValueChange={(v) => patch({ country: v, city: v ? local.city : undefined })}
            />
            <FacetSelect
              label="City"
              value={local.city}
              options={facets.cities}
              placeholder="Any city"
              onValueChange={(v) => patch({ city: v })}
            />
            <FacetSelect
              label="State / Region"
              value={local.state}
              options={facets.states}
              placeholder="Any state or region"
              onValueChange={(v) => patch({ state: v })}
            />
            <FacetSelect
              label="Host university"
              value={local.university}
              options={facets.universities}
              placeholder="Any university"
              onValueChange={(v) => patch({ university: v })}
            />
            <FacetSelect
              label="Host school"
              value={local.school}
              options={facets.schools}
              placeholder="Any school"
              onValueChange={(v) => patch({ school: v })}
            />
            <FacetSelect
              label="Committee"
              value={local.committee}
              options={facets.committees}
              placeholder="Any committee"
              onValueChange={(v) => patch({ committee: v })}
            />

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="reg-open" className="cursor-pointer text-sm font-medium">
                  Registration currently open
                </Label>
                <Switch
                  id="reg-open"
                  checked={local.regOpen ?? false}
                  onCheckedChange={(v) => patch({ regOpen: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="upcoming" className="cursor-pointer text-sm font-medium">
                  Upcoming only
                </Label>
                <Switch
                  id="upcoming"
                  checked={local.upcoming ?? false}
                  onCheckedChange={(v) => patch({ upcoming: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="featured" className="cursor-pointer text-sm font-medium">
                  Featured only
                </Label>
                <Switch
                  id="featured"
                  checked={local.featured ?? false}
                  onCheckedChange={(v) => patch({ featured: v })}
                />
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex items-center justify-between gap-2 border-t border-border/60 px-6 py-4">
          <Button variant="ghost" onClick={handleClear} className="gap-1.5 text-muted-foreground">
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <Button onClick={handleApply} className={dirty ? "" : "opacity-60"}>
            Apply filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
