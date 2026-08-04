"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  positionPaperInputSchema,
  type PositionPaperInput,
} from "@/lib/validation/workspace";
import { updatePositionPaper } from "@/lib/actions/workspace";
import { streamAiGeneration } from "@/components/workspace/use-ai-stream";
import type { PositionPaper } from "@/generated/prisma/browser";
import { positionPaperStatusLabel } from "@/lib/workspace";
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
import { POSITION_PAPER_STATUSES } from "@/components/workspace/status-options";

export function PositionPaperEditor({
  workspaceId,
  committeeId,
  paper,
}: {
  workspaceId: string;
  committeeId: string;
  paper?: PositionPaper | null;
}) {
  const form = useForm<PositionPaperInput>({
    resolver: zodResolver(positionPaperInputSchema),
    defaultValues: {
      title: paper?.title ?? "",
      content: paper?.content ?? "",
      status: paper?.status ?? "DRAFT",
    },
  });
  const { isPending, run } = useServerAction(
    (values) => updatePositionPaper(workspaceId, committeeId, values),
    form.setError,
  );

  const [generating, setGenerating] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  function generateDraft() {
    setGenerating(true);
    void streamAiGeneration(
      { feature: "position-paper", workspaceId, committeeId },
      (text) => {
        if (mounted.current) form.setValue("content", text, { shouldDirty: true });
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
        onSubmit={form.handleSubmit((values) => run(values))}
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
                  <FormLabel>Paper title</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional title…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="min-w-36">
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITION_PAPER_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {positionPaperStatusLabel(status)}
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
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Country position, committee stances, arguments, sources…"
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
            disabled={generating || isPending}
          >
            <Sparkles className="size-4" />
            {generating ? "Generating…" : "Generate draft"}
          </Button>
          <FormSubmitButton isPending={isPending} label="Save position paper" />
        </div>
      </form>
    </Form>
  );
}
