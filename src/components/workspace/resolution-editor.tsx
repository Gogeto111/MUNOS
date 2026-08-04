"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { resolutionInputSchema, type ResolutionInput } from "@/lib/validation/workspace";
import { createResolution, updateResolution } from "@/lib/actions/workspace";
import { streamAiGeneration } from "@/components/workspace/use-ai-stream";
import type { Resolution, WorkspaceCommittee } from "@/generated/prisma/browser";
import { resolutionStatusLabel } from "@/lib/workspace";
import { useServerAction } from "@/components/profile/use-server-action";
import { FormSubmitButton } from "@/components/profile/form-submit-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RESOLUTION_STATUSES } from "@/components/workspace/status-options";

function emptyValues(): ResolutionInput {
  return { title: "", body: "", status: "DRAFT", committeeId: "", sponsors: "" };
}

function fromResolution(resolution: Resolution): ResolutionInput {
  return {
    title: resolution.title,
    body: resolution.body,
    status: resolution.status,
    committeeId: resolution.committeeId ?? "",
    sponsors: resolution.sponsors.join(", "),
  };
}

export function ResolutionEditor({
  workspaceId,
  committees,
  resolution,
  onSaved,
}: {
  workspaceId: string;
  committees: WorkspaceCommittee[];
  resolution?: Resolution;
  onSaved?: () => void;
}) {
  const form = useForm<ResolutionInput>({
    resolver: zodResolver(resolutionInputSchema),
    defaultValues: resolution ? fromResolution(resolution) : emptyValues(),
  });
  const { isPending, run } = useServerAction(
    (values) =>
      resolution
        ? updateResolution(workspaceId, resolution.id, values)
        : createResolution(workspaceId, values),
    form.setError,
  );

  const [generating, setGenerating] = useState(false);
  const mounted = useRef(true);
  const selectedCommitteeId = form.watch("committeeId");

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  function generateDraft() {
    const committeeId = form.getValues("committeeId");
    if (!committeeId) {
      toast.error("Select a committee first so the AI has a topic to draft from.");
      return;
    }
    setGenerating(true);
    void streamAiGeneration(
      { feature: "resolution", workspaceId, committeeId, focus: form.getValues("title") },
      (text) => {
        if (mounted.current) form.setValue("body", text, { shouldDirty: true });
      },
    ).then((result) => {
      setGenerating(false);
      if (result.ok) {
        toast.success("Draft generated. Review it before saving.");
      } else {
        toast.error(result.error ?? "Generation failed.");
      }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          run(values).then((res) => {
            if (res.status === "success") {
              if (!resolution) form.reset(emptyValues());
              onSaved?.();
            }
          }),
        )}
        className="space-y-4"
        noValidate
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Resolution on international cooperation…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="committeeId"
            render={({ field }) => (
              <FormItem className="min-w-44">
                <FormLabel>Committee</FormLabel>
                <FormControl>
                  <Select
                    value={field.value || undefined}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="No committee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No committee</SelectItem>
                      {committees.map((committee) => (
                        <SelectItem key={committee.id} value={committee.id}>
                          {committee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="min-w-32">
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOLUTION_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {resolutionStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="sponsors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sponsors</FormLabel>
              <FormControl>
                <Input placeholder="Canada, Germany, Sweden (comma separated)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Preambulatory and operative clauses…"
                  rows={10}
                  className="min-h-40 resize-y font-mono text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={generateDraft}
            disabled={generating || isPending || !selectedCommitteeId}
          >
            <Sparkles className="size-4" />
            {generating ? "Generating…" : "Draft with AI"}
          </Button>
          <FormSubmitButton isPending={isPending} label={resolution ? "Save resolution" : "Add resolution"} />
        </div>
      </form>
    </Form>
  );
}
