"use client";

import { Loader2, TriangleAlert } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Skeleton } from "@/components/ui/skeleton";

export function AiOutput({
  isPending,
  error,
  text,
}: {
  isPending: boolean;
  error: string | null;
  text: string | null;
}) {
  if (isPending) {
    return (
      <div className="space-y-3 rounded-lg border border-border/70 p-4">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Generating&hellip;
        </p>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (!text) return null;

  return (
    <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
      <div className="prose prose-sm prose-neutral max-w-none dark:prose-invert">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}
