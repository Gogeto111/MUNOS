"use client";

import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  deleteConference,
  toggleConferencePublished,
} from "@/lib/actions/conference";

export function ConferenceRowActions({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        aria-label={published ? "Unpublish conference" : "Publish conference"}
        onClick={async () => {
          const result = await toggleConferencePublished(id);
          if (result.status === "success") {
            toast.success(result.message);
            router.refresh();
          } else {
            toast.error(result.message ?? "Could not update.");
          }
        }}
      >
        {published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        aria-label="Edit conference"
        onClick={() => router.push(`/admin/conferences/${id}/edit`)}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-destructive"
        aria-label="Delete conference"
        onClick={async () => {
          if (!window.confirm("Delete this conference and all its data?")) return;
          const result = await deleteConference(id);
          if (result.status === "success") {
            toast.success(result.message);
            router.refresh();
          } else {
            toast.error(result.message ?? "Could not delete.");
          }
        }}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
