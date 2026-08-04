"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { noteInputSchema, type NoteInput } from "@/lib/validation/workspace";
import { createNote, updateNote } from "@/lib/actions/workspace";
import type { Folder, Note } from "@/generated/prisma/browser";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

function emptyValues(folderId: string): NoteInput {
  return { title: "", content: "", folderId, pinned: false };
}

export function NoteEditor({
  workspaceId,
  folders,
  note,
  defaultFolderId,
  onSaved,
  onCancel,
}: {
  workspaceId: string;
  folders: Folder[];
  note?: Note;
  defaultFolderId?: string;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const form = useForm<NoteInput>({
    resolver: zodResolver(noteInputSchema),
    defaultValues: note
      ? {
          title: note.title,
          content: note.content,
          folderId: note.folderId ?? "",
          pinned: note.pinned,
        }
      : emptyValues(defaultFolderId ?? ""),
  });

  const { isPending, run } = useServerAction(
    (values) => (note ? updateNote(workspaceId, note.id, values) : createNote(workspaceId, values)),
    form.setError,
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          run(values).then((res) => {
            if (res.status === "success") {
              form.reset(emptyValues(defaultFolderId ?? ""));
              onSaved?.();
            }
          }),
        )}
        className="space-y-4 rounded-lg border border-border/70 p-4"
        noValidate
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Note title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="folderId"
            render={({ field }) => (
              <FormItem className="min-w-40">
                <FormLabel>Folder</FormLabel>
                <FormControl>
                  <Select
                    value={field.value || undefined}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="No folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No folder</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
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
            name="pinned"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Pin</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                    aria-label="Pin note"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Write your research notes…"
                  rows={8}
                  className="min-h-40 resize-y font-mono text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          {onCancel ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                form.reset();
                onCancel();
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
          ) : null}
          <FormSubmitButton isPending={isPending} label={note ? "Save note" : "Add note"} />
        </div>
      </form>
    </Form>
  );
}
