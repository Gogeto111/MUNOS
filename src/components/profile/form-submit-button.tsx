"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FormSubmitButton({
  isPending,
  label = "Save changes",
  pendingLabel = "Saving…",
  className,
}: {
  isPending: boolean;
  label?: string;
  pendingLabel?: string;
  className?: string;
}) {
  return (
    <Button type="submit" disabled={isPending} className={className}>
      {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
      {isPending ? pendingLabel : label}
    </Button>
  );
}
