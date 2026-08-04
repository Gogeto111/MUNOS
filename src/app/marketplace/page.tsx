"use client";

import { useState } from "react";
import {
  LayoutGrid,
  List,
  Search,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
  { label: "All", value: "all" },
  { label: "Resolution Templates", value: "resolutions" },
  { label: "Position Papers", value: "papers" },
  { label: "Research Guides", value: "guides" },
  { label: "Presentation Decks", value: "presentations" },
  { label: "Chair Notes", value: "chair" },
  { label: "Motions & Voting", value: "motions" },
];

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">MUN Marketplace</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Resolution templates, position papers, research guides, and more.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              className="size-8"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              className="size-8"
              onClick={() => setViewMode("list")}
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === cat.value
                    ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingBag className="mb-4 size-10 text-muted-foreground" />
            <p className="text-sm font-medium">No marketplace items yet</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Resolution templates, position papers, and research guides will appear here once contributed by the community.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
