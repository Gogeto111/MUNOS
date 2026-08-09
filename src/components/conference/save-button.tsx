"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSaved } from "@/providers/saved-provider";
import { cn } from "@/lib/utils";
import type { SavedConferenceMeta } from "@/hooks/use-saved-conferences";

type SaveButtonProps = React.ComponentProps<typeof Button> & {
  conferenceId: string;
  conferenceMeta?: Omit<SavedConferenceMeta, "id" | "savedAt">;
};

export function SaveButton({ conferenceId, conferenceMeta, className, ...props }: SaveButtonProps) {
  const { isSaved, toggle, isPending } = useSaved();
  const saved = isSaved(conferenceId);
  const pending = isPending(conferenceId);

  return (
    <Button
      type="button"
      variant={saved ? "default" : "ghost"}
      size="icon"
      aria-label={saved ? "Remove from saved" : "Save conference"}
      aria-pressed={saved}
      disabled={pending}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(conferenceId, conferenceMeta);
      }}
      className={cn(
        "rounded-full transition-all",
        saved && "bg-brand-500 text-white hover:bg-brand-600",
        className,
      )}
      {...props}
    >
      <Heart
        className={cn("size-4 transition-transform", saved && "fill-current")}
      />
    </Button>
  );
}
