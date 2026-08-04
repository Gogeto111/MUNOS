"use client";

import { useState } from "react";
import { Gavel } from "lucide-react";
import type { Resolution, WorkspaceCommittee } from "@/generated/prisma/browser";
import { deleteResolution } from "@/lib/actions/workspace";
import { resolutionStatusLabel } from "@/lib/workspace";
import { timeAgo } from "@/lib/format";
import { DeleteButton } from "@/components/profile/delete-button";
import { SectionCard } from "@/components/profile/section-card";
import { ResolutionEditor } from "@/components/workspace/resolution-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<string, "outline" | "secondary" | "default" | "destructive"> = {
  DRAFT: "secondary",
  SUBMITTED: "default",
  PASSED: "outline",
  FAILED: "destructive",
};

export function ResolutionsPanel({
  workspaceId,
  committees,
  resolutions,
}: {
  workspaceId: string;
  committees: WorkspaceCommittee[];
  resolutions: Resolution[];
}) {
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sorted = [...resolutions].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  return (
    <SectionCard
      title="Resolutions"
      description="Draft and track working papers and draft resolutions."
      icon={Gavel}
    >
      <div className="space-y-4">
        {showNew || editingId ? (
          <div className="rounded-lg border border-dashed border-border/70 p-4">
            <ResolutionEditor
              workspaceId={workspaceId}
              committees={committees}
              resolution={resolutions.find((r) => r.id === editingId)}
              onSaved={() => {
                setShowNew(false);
                setEditingId(null);
              }}
            />
          </div>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => setShowNew(true)}>
            <Gavel className="size-4" />
            New resolution
          </Button>
        )}

        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No resolutions yet. Draft your first one above.
          </p>
        ) : (
          <ul className="divide-y divide-border/70 rounded-lg border border-border/70">
            {sorted.map((resolution) => {
              const committee = committees.find((c) => c.id === resolution.committeeId);
              return (
                <li key={resolution.id} className="group px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => {
                        setEditingId(editingId === resolution.id ? null : resolution.id);
                        setShowNew(false);
                      }}
                    >
                      <p className="truncate text-sm font-medium">{resolution.title}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                        {committee ? <span>{committee.name}</span> : null}
                        {resolution.sponsors.length > 0 ? (
                          <span>Sponsored by {resolution.sponsors.join(", ")}</span>
                        ) : null}
                        <span>{timeAgo(resolution.updatedAt)}</span>
                      </p>
                    </button>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={STATUS_VARIANT[resolution.status]}>
                        {resolutionStatusLabel(resolution.status)}
                      </Badge>
                      <DeleteButton
                        action={(id) => deleteResolution(workspaceId, id)}
                        id={resolution.id}
                        className={cn(
                          "size-7",
                          editingId === resolution.id
                            ? "opacity-100"
                            : "opacity-0 transition-opacity group-hover:opacity-100",
                        )}
                      />
                    </div>
                  </div>
                  {editingId === resolution.id ? (
                    <div className="mt-4 border-t border-border/70 pt-4">
                      <ResolutionEditor
                        workspaceId={workspaceId}
                        committees={committees}
                        resolution={resolution}
                        onSaved={() => setEditingId(null)}
                      />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SectionCard>
  );
}
