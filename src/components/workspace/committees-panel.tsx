"use client";

import { useState } from "react";
import { FileStack, Landmark } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  workspaceCommitteeInputSchema,
  type WorkspaceCommitteeInput,
} from "@/lib/validation/workspace";
import {
  createCommittee,
  deleteCommittee,
} from "@/lib/actions/workspace";
import type { PositionPaper, Resolution, WorkspaceCommittee } from "@/generated/prisma/browser";
import { positionPaperStatusLabel } from "@/lib/workspace";
import { useServerAction } from "@/components/profile/use-server-action";
import { FormSubmitButton } from "@/components/profile/form-submit-button";
import { DeleteButton } from "@/components/profile/delete-button";
import { SectionCard } from "@/components/profile/section-card";
import { PositionPaperEditor } from "@/components/workspace/position-paper-editor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CommitteeWithPaper = WorkspaceCommittee & { positionPaper: PositionPaper | null };

const EMPTY_COMMITTEE: WorkspaceCommitteeInput = {
  name: "",
  topic: "",
  country: "",
  role: "DELEGATE",
};

export function CommitteesPanel({
  workspaceId,
  committees,
  resolutions,
}: {
  workspaceId: string;
  committees: CommitteeWithPaper[];
  resolutions: Resolution[];
}) {
  const [openCommitteeId, setOpenCommitteeId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const form = useForm<WorkspaceCommitteeInput>({
    resolver: zodResolver(workspaceCommitteeInputSchema),
    defaultValues: EMPTY_COMMITTEE,
  });
  const { isPending, run } = useServerAction(
    (values) => createCommittee(workspaceId, values),
    form.setError,
  );

  const sorted = [...committees].sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.getTime() - b.createdAt.getTime());

  return (
    <SectionCard
      title="Committees"
      description="Your committees and position papers for this conference."
      icon={FileStack}
    >
      <div className="space-y-4">
        {showAddForm ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) =>
                run(values).then((res) => {
                  if (res.status === "success") {
                    form.reset(EMPTY_COMMITTEE);
                    setShowAddForm(false);
                  }
                }),
              )}
              className="space-y-4 rounded-lg border border-dashed border-border/70 p-4"
              noValidate
            >
              <p className="text-sm font-medium">Add a committee</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Committee</FormLabel>
                      <FormControl>
                        <Input placeholder="UNGA Third Committee" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Canada" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="Artificial intelligence and international security" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)} disabled={isPending}>
                  Cancel
                </Button>
                <FormSubmitButton isPending={isPending} label="Add committee" />
              </div>
            </form>
          </Form>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
            Add committee
          </Button>
        )}

        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No committees yet. Add one to start drafting your position paper.
          </p>
        ) : (
          <ul className="space-y-4">
            {sorted.map((committee) => {
              const open = openCommitteeId === committee.id;
              const resolutionCount = resolutions.filter((r) => r.committeeId === committee.id).length;
              return (
                <li key={committee.id} className="rounded-lg border border-border/70">
                  <div className="flex items-start justify-between gap-3 px-4 py-3">
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => setOpenCommitteeId(open ? null : committee.id)}
                    >
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <Landmark className="size-4 shrink-0 text-muted-foreground" />
                        {committee.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {[committee.country, committee.topic, committee.role]
                          .filter(Boolean)
                          .join(" · ") || "No details yet"}
                      </p>
                    </button>
                    <div className="flex shrink-0 items-center gap-2">
                      {committee.positionPaper ? (
                        <Badge variant="secondary">
                          {positionPaperStatusLabel(committee.positionPaper.status)}
                        </Badge>
                      ) : null}
                      <Badge variant="outline">{resolutionCount} resolutions</Badge>
                      <DeleteButton
                        action={(id) => deleteCommittee(workspaceId, id)}
                        id={committee.id}
                      />
                    </div>
                  </div>
                  <div
                    className={cn(
                      "border-t border-border/70 px-4 py-4",
                      open ? "block" : "hidden",
                    )}
                  >
                    <PositionPaperEditor
                      workspaceId={workspaceId}
                      committeeId={committee.id}
                      paper={committee.positionPaper}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SectionCard>
  );
}
