"use client";

import { useState, useMemo } from "react";
import {
  Search,
  FileText,
  Copy,
  Check,
  ChevronRight,
  X,
  ScrollText,
} from "lucide-react";
import { toast } from "sonner";
import {
  RESOLUTION_TEMPLATES,
  RESOLUTION_CATEGORIES,
  type ResolutionCategory,
  type ResolutionTemplate,
} from "@/lib/resolution-templates";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<ResolutionCategory, string> = {
  "Security Council": "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25",
  "General Assembly": "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25",
  ECOSOC: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
  "Human Rights Council": "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25",
  UNCLOS: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/25",
  UNEP: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/25",
};

function formatTemplateBody(template: ResolutionTemplate): string {
  const lines: string[] = [];
  lines.push(`${template.documentSymbol}`);
  lines.push("");
  lines.push(`The General Assembly,`);
  lines.push("");
  template.preambleClauses.forEach((clause) => {
    lines.push(`    ${clause}`);
    lines.push("");
  });
  lines.push("    Calls upon");
  lines.push("");
  template.operativeClauses.forEach((clause, i) => {
    lines.push(`    ${i + 1}. ${clause}`);
    lines.push("");
  });
  return lines.join("\n");
}

function TemplateCard({
  template,
  onClick,
}: {
  template: ResolutionTemplate;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/50"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className={cn("shrink-0", CATEGORY_COLORS[template.committee])}>
            {template.committee}
          </Badge>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </div>
        <CardTitle className="mt-2 text-base">{template.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground font-mono">{template.documentSymbol}</p>
      </CardContent>
    </Card>
  );
}

function TemplateDetail({
  template,
  onClose,
}: {
  template: ResolutionTemplate;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(formatTemplateBody(template));
    setCopied(true);
    toast.success("Template copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <Badge variant="outline" className={cn("mb-1", CATEGORY_COLORS[template.committee])}>
                {template.committee}
              </Badge>
              <DialogTitle>{template.title}</DialogTitle>
              <DialogDescription>{template.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[55vh]">
          <div className="space-y-6 pr-4">
            <div>
              <h3 className="mb-2 text-sm font-semibold">Formatting Guide</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {template.formattingGuide}
              </p>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-relaxed">
              <p className="font-bold mb-1">{template.documentSymbol}</p>
              <p className="mb-3">The General Assembly,</p>
              {template.preambleClauses.map((clause, i) => (
                <p key={`pre-${i}`} className="mb-2 text-muted-foreground">
                  {clause}
                </p>
              ))}
              <p className="mt-4 mb-3">Calls upon</p>
              {template.operativeClauses.map((clause, i) => (
                <p key={`op-${i}`} className="mb-2">
                  {i + 1}. {clause}
                </p>
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="size-4" />
            Close
          </Button>
          <Button onClick={handleCopy}>
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            {copied ? "Copied" : "Copy template"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ResolutionsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ResolutionCategory | "All">("All");
  const [selectedTemplate, setSelectedTemplate] = useState<ResolutionTemplate | null>(null);

  const filtered = useMemo(() => {
    return RESOLUTION_TEMPLATES.filter((t) => {
      const matchesSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.topic.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || t.committee === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resolution Templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real UN resolution templates with proper preamble and operative clauses.
          Search, filter, view, and copy for your committee work.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, topic, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "All" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("All")}
        >
          All
        </Button>
        {RESOLUTION_CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="flex min-h-48 flex-col items-center justify-center border-dashed text-center">
          <CardHeader className="items-center">
            <div className="mb-3 grid size-12 place-items-center rounded-2xl border border-border bg-muted/50">
              <ScrollText className="size-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-base">No templates found</CardTitle>
            <CardDescription>Try adjusting your search or filter criteria.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onClick={() => setSelectedTemplate(template)}
            />
          ))}
        </div>
      )}

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="size-4" />
            Quick Reference: UN Resolution Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Document Symbol:</span>{" "}
            Committee/Session/Resolution Number (e.g., S/RES/2254 (2015))
          </p>
          <p>
            <span className="font-semibold text-foreground">Preamble:</span>{" "}
            Clauses starting with participle verbs (Reaffirming, Recalling, Noting,
            Expressing, Deeply concerned) that provide context and legal basis.
          </p>
          <p>
            <span className="font-semibold text-foreground">Operative:</span>{" "}
            Numbered clauses using imperative verbs (Decides, Demands, Calls upon,
            Urges, Requests) that constitute the actual actions.
          </p>
          <p>
            <span className="font-semibold text-foreground">Final clause:</span>{" "}
            Typically &ldquo;Decides to remain seized of the matter&rdquo; (UNSC) or
            &ldquo;Decides to continue consideration of the matter&rdquo; (GA).
          </p>
        </CardContent>
      </Card>

      {selectedTemplate && (
        <TemplateDetail
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}
