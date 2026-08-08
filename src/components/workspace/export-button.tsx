"use client";

import { Download, LoaderCircle } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ExportButton({
  workspaceId,
  workspaceTitle,
  className,
}: {
  workspaceId: string;
  workspaceTitle: string;
  className?: string;
}) {
  const [loading, setLoading] = React.useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/export`);
      if (!response.ok) {
        throw new Error("Failed to generate export.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const fileSlug = workspaceTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      anchor.download = `${fileSlug}.md`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Workspace exported as Markdown");
    } catch {
      toast.error("Could not export workspace.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("gap-1.5", className)}
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      Export as Markdown
    </Button>
  );
}
