"use client";

import { useTransition } from "react";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workspaceInputSchema, type WorkspaceInput } from "@/lib/validation/workspace";
import { deleteWorkspace, updateWorkspace } from "@/lib/actions/workspace";
import { useServerAction } from "@/components/profile/use-server-action";
import { FormSubmitButton } from "@/components/profile/form-submit-button";
import { SectionCard } from "@/components/profile/section-card";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { ConferenceOption } from "@/components/workspace/create-workspace-form";

export function WorkspaceSettings({
  workspace,
  conferences,
}: {
  workspace: {
    id: string;
    title: string;
    description: string | null;
    conferenceId: string | null;
  };
  conferences: ConferenceOption[];
}) {
  const router = useRouter();
  const form = useForm<WorkspaceInput>({
    resolver: zodResolver(workspaceInputSchema),
    defaultValues: {
      title: workspace.title,
      description: workspace.description ?? "",
      conferenceId: workspace.conferenceId ?? "",
    },
  });
  const { isPending, run } = useServerAction(
    (values) => updateWorkspace(workspace.id, values),
    form.setError,
  );

  const [isDeleting, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteWorkspace(workspace.id);
      if (result.status === "success") {
        toast.success(result.message);
        router.push("/workspaces");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Workspace settings"
        description="Edit how this workspace appears in your list."
        icon={Settings}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => run(values))}
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
                    <Input {...field} />
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
                  <FormLabel>Conference</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => field.onChange(value ?? "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Link to a conference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {conferences.map((conference) => (
                          <SelectItem key={conference.id} value={conference.id}>
                            {conference.name}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <FormSubmitButton isPending={isPending} label="Save changes" />
            </div>
          </form>
        </Form>
      </SectionCard>

      <SectionCard
        title="Danger zone"
        description="Permanently delete this workspace and everything in it."
        icon={Settings}
      >
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" disabled={isDeleting}>
              {isDeleting ? "Deleting…" : "Delete workspace"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this workspace?</AlertDialogTitle>
              <AlertDialogDescription>
                Notes, tasks, timeline, files, committees, position papers, and resolutions will
                be permanently removed. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SectionCard>
    </div>
  );
}
