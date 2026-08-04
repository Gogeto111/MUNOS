"use client";

import { FolderPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workspaceInputSchema, type WorkspaceInput } from "@/lib/validation/workspace";
import { createWorkspace } from "@/lib/actions/workspace";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface ConferenceOption {
  id: string;
  name: string;
}

const EMPTY_WORKSPACE: WorkspaceInput = {
  title: "",
  description: "",
  conferenceId: "",
};

export function CreateWorkspaceForm({
  conferences,
}: {
  conferences: ConferenceOption[];
}) {
  const router = useRouter();
  const form = useForm<WorkspaceInput>({
    resolver: zodResolver(workspaceInputSchema),
    defaultValues: EMPTY_WORKSPACE,
  });

  const { isPending, run } = useServerAction(createWorkspace, form.setError);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FolderPlus className="size-4 text-muted-foreground" />
          <CardTitle className="text-base">New workspace</CardTitle>
        </div>
        <CardDescription>
          Research folders, notes, tasks, and drafts for an upcoming conference.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              run(values).then((res) => {
                if (res.status === "success") {
                  form.reset(EMPTY_WORKSPACE);
                  if (res.data?.id) {
                    router.push(`/workspaces/${res.data.id}`);
                  } else {
                    router.refresh();
                  }
                }
              }),
            )}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Geneva MUN 2026 prep" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="conferenceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conference (optional)</FormLabel>
                  <FormControl>
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Link to a conference" />
                      </SelectTrigger>
                      <SelectContent>
                        {conferences.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No conferences yet
                          </div>
                        ) : (
                          conferences.map((conference) => (
                            <SelectItem key={conference.id} value={conference.id}>
                              {conference.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional notes…" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                className="mr-2"
                onClick={() => form.reset(EMPTY_WORKSPACE)}
                disabled={isPending}
              >
                Clear
              </Button>
              <FormSubmitButton isPending={isPending} label="Create workspace" />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
