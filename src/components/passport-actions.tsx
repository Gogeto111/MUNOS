"use client";

import { Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PassportActions() {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="gap-2"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Passport link copied to clipboard!");
          } catch {
            toast.error("Failed to copy link.");
          }
        }}
      >
        <Share2 className="size-3.5" /> Share
      </Button>
      <Button className="gap-2" onClick={() => window.print()}>
        <Download className="size-3.5" /> Export PDF
      </Button>
    </div>
  );
}
