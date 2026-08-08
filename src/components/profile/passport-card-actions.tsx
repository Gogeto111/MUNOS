"use client";

import { Button } from "@/components/ui/button";
import { Share2, Download } from "lucide-react";
import { toast } from "sonner";

interface PassportCardActionsProps {
  passportUrl: string;
}

export function PassportCardActions({ passportUrl }: PassportCardActionsProps) {
  const handleShare = async () => {
    try {
      const url = window.location.origin + passportUrl;
      await navigator.clipboard.writeText(url);
      toast.success("Passport link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="gap-1" onClick={handleShare}>
        <Share2 className="size-3" /> Share
      </Button>
      <Button variant="outline" size="sm" className="gap-1" onClick={() => window.print()}>
        <Download className="size-3" /> Export
      </Button>
    </div>
  );
}
