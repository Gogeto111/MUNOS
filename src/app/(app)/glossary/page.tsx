"use client";

import { useState, useMemo } from "react";
import { Search, BookOpen, ChevronRight } from "lucide-react";
import {
  GLOSSARY_TERMS,
  GLOSSARY_CATEGORIES,
  ALL_GLOSSARY_LETTERS,
  type GlossaryCategory,
} from "@/lib/glossary-data";
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

const CATEGORY_COLORS: Record<GlossaryCategory, string> = {
  Parliamentary:
    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25",
  Committee:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
  Resolution:
    "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25",
  General:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
};

function GlossaryCard({ term }: { term: (typeof GLOSSARY_TERMS)[number] }) {
  const [open, setOpen] = useState(false);

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/50"
      onClick={() => setOpen(!open)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base">{term.term}</CardTitle>
            <Badge
              variant="outline"
              className={cn("shrink-0 text-[10px]", CATEGORY_COLORS[term.category])}
            >
              {term.category}
            </Badge>
          </div>
          <ChevronRight
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-90"
            )}
          />
        </div>
        <CardDescription className="line-clamp-2">
          {term.definition}
        </CardDescription>
      </CardHeader>
      {open && (
        <CardContent>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Example: </span>
            <em>{term.example}</em>
          </p>
        </CardContent>
      )}
    </Card>
  );
}

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<GlossaryCategory | "All">("All");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return GLOSSARY_TERMS.filter((t) => {
      const matchesSearch =
        !search ||
        t.term.toLowerCase().includes(search.toLowerCase()) ||
        t.definition.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || t.category === selectedCategory;
      const matchesLetter =
        !activeLetter ||
        t.term[0].toUpperCase() === activeLetter;
      return matchesSearch && matchesCategory && matchesLetter;
    });
  }, [search, selectedCategory, activeLetter]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const term of filtered) {
      const letter = term.term[0].toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(term);
    }
    return map;
  }, [filtered]);

  const availableLetters = useMemo(() => {
    return new Set(GLOSSARY_TERMS.map((t) => t.term[0].toUpperCase()));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          MUN Glossary
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {GLOSSARY_TERMS.length} terms covering parliamentary procedure,
          committee roles, UN documents, and general MUN vocabulary.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search terms or definitions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "All" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setSelectedCategory("All");
            setActiveLetter(null);
          }}
        >
          All ({GLOSSARY_TERMS.length})
        </Button>
        {GLOSSARY_CATEGORIES.map((cat) => {
          const count = GLOSSARY_TERMS.filter(
            (t) => t.category === cat
          ).length;
          return (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedCategory(cat);
                setActiveLetter(null);
              }}
            >
              {cat} ({count})
            </Button>
          );
        })}
      </div>

      {/* Alphabet sidebar */}
      <div className="flex flex-wrap gap-1">
        {ALL_GLOSSARY_LETTERS.map((letter) => (
          <button
            key={letter}
            onClick={() => {
              setActiveLetter(activeLetter === letter ? null : letter);
              setSelectedCategory("All");
              setSearch("");
            }}
            className={cn(
              "size-8 rounded-md text-xs font-medium transition-colors",
              activeLetter === letter
                ? "bg-brand-500/10 text-brand-700 dark:text-brand-300"
                : availableLetters.has(letter)
                  ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                  : "text-muted-foreground/40 cursor-not-allowed"
            )}
            disabled={!availableLetters.has(letter)}
          >
            {letter}
          </button>
        ))}
        {activeLetter && (
          <button
            onClick={() => setActiveLetter(null)}
            className="size-8 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>

      {/* Terms list */}
      {filtered.length === 0 ? (
        <Card className="flex min-h-48 flex-col items-center justify-center border-dashed text-center">
          <CardHeader className="items-center">
            <div className="mb-3 grid size-12 place-items-center rounded-2xl border border-border bg-muted/50">
              <BookOpen className="size-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-base">No terms found</CardTitle>
            <CardDescription>
              Try adjusting your search or filter criteria.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([letter, terms]) => (
            <div key={letter}>
              <div className="sticky top-0 z-10 mb-3 flex items-center gap-2 bg-background/80 backdrop-blur-sm">
                <span className="text-lg font-bold text-brand-600 dark:text-brand-400">
                  {letter}
                </span>
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">
                  {terms.length} {terms.length === 1 ? "term" : "terms"}
                </span>
              </div>
              <div className="space-y-3">
                {terms.map((term) => (
                  <GlossaryCard key={term.term} term={term} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Reference Card */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <BookOpen className="size-4" />
            Quick Reference: Committee Motion Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">
              Suspends the Rules:
            </span>{" "}
            Requires a two-thirds majority. Used to override normal procedure.
          </p>
          <p>
            <span className="font-semibold text-foreground">
              Incidental Motions:
            </span>{" "}
            Take precedence over main motions (e.g., Point of Order, Appeal).
          </p>
          <p>
            <span className="font-semibold text-foreground">
              Subsidiary Motions:
            </span>{" "}
            Modify or dispose of a main motion (e.g., Amend, Refer to Committee).
          </p>
          <p>
            <span className="font-semibold text-foreground">
              Privileged Motions:
            </span>{" "}
            Deal with urgent matters independent of the main motion (e.g., Recess).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
