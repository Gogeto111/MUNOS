"use client";

import { useEffect, useState } from "react";
import {
  ExternalLink,
  FileText,
  Globe,
  BookOpen,
  Search,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { listMarketplaceItems, seedMarketplaceItems } from "@/lib/actions/marketplace";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Globe,
  BookOpen,
};

const CATEGORIES = ["All", "Reference", "Rules", "Guide", "Template", "Research"];

export default function MarketplacePage() {
  const [items, setItems] = useState<Array<{
    id: string;
    title: string;
    description: string;
    url: string;
    category: string;
    icon: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    listMarketplaceItems().then(async (r) => {
      if (r.status === "success" && r.data && r.data.length > 0) {
        setItems(r.data);
        setLoading(false);
      } else {
        await seedMarketplaceItems();
        const r2 = await listMarketplaceItems();
        if (r2.status === "success" && r2.data) setItems(r2.data);
        setLoading(false);
      }
    });
  }, []);

  const filtered = items.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">MUN Resources</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Official UN documents, resolution templates, position paper guides, and research tools.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const Icon = ICON_MAP[item.icon] || FileText;
              return (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer">
                  <Card className="h-full transition-all hover:shadow-md hover:border-brand-500/30 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted/60">
                          <Icon className="size-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold truncate">{item.title}</h3>
                            <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                          <Badge variant="outline" className="mt-2 text-[10px]">{item.category}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="mb-4 size-10 text-muted-foreground" />
              <p className="text-sm font-medium">No resources found</p>
              <p className="mt-1 text-xs text-muted-foreground">Try a different search or category.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
