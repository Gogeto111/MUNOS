"use client";

import { CalendarPlus, LoaderCircle } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CalendarExportButton({
  conferenceId,
  conferenceSlug,
  className,
}: {
  conferenceId: string;
  conferenceSlug: string;
  className?: string;
}) {
  const [loading, setLoading] = React.useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const response = await fetch(`/api/conference/${conferenceId}/calendar`);
      if (!response.ok) {
        throw new Error("Failed to generate calendar file.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${conferenceSlug}.ics`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Calendar file downloaded");
    } catch {
      toast.error("Could not download the calendar file.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("gap-1.5 rounded-full", className)}
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <CalendarPlus className="size-4" />
      )}
      Add to Calendar
    </Button>
  );
}
