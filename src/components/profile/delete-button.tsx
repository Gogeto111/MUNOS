"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ActionState } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  action,
  id,
  confirmLabel = "Delete",
  className,
}: {
  action: (id: string) => Promise<ActionState>;
  id: string;
  confirmLabel?: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await action(id);
      if (result.status === "success") {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      disabled={isPending}
      onClick={handleDelete}
      aria-label={confirmLabel}
    >
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}
