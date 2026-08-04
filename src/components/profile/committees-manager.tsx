"use client";

import { Landmark } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { committeeSchema, type CommitteeInput } from "@/lib/validation/profile";
import type { Committee } from "@/generated/prisma/browser";
import { addCommittee, deleteCommittee } from "@/lib/actions/profile";
import { useServerAction } from "@/components/profile/use-server-action";
import { SectionCard } from "@/components/profile/section-card";
import { FormSubmitButton } from "@/components/profile/form-submit-button";
import { DeleteButton } from "@/components/profile/delete-button";
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

const EMPTY_COMMITTEE: CommitteeInput = {
  name: "",
  role: "",
  conferenceName: "",
  year: "",
  description: "",
};

export function CommitteesManager({ committees }: { committees: Committee[] }) {
  const form = useForm<CommitteeInput>({
    resolver: zodResolver(committeeSchema),
    defaultValues: EMPTY_COMMITTEE,
  });

  const { isPending, run } = useServerAction(addCommittee, form.setError);

  return (
    <SectionCard
      title="Committees"
      description="Every committee you have participated in."
      icon={Landmark}
    >
      <div className="space-y-4">
        {committees.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No committees yet. Add your first one below.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border/70">
            {committees.map((committee) => (
              <li
                key={committee.id}
                className="flex items-start justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {committee.name}
                    <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {committee.role}
                    </span>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {[committee.conferenceName, committee.year]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <DeleteButton action={deleteCommittee} id={committee.id} />
              </li>
            ))}
          </ul>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              run(values).then((res) => {
                if (res.status === "success") form.reset(EMPTY_COMMITTEE);
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
                      <Input placeholder="United Nations Security Council" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Delegate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="conferenceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conference</FormLabel>
                    <FormControl>
                      <Input placeholder="MUNOSMUN 2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2025"
                        min={1950}
                        max={2100}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional details…" rows={2} {...field} />
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
                onClick={() => form.reset(EMPTY_COMMITTEE)}
                disabled={isPending}
              >
                Clear
              </Button>
              <FormSubmitButton isPending={isPending} label="Add committee" />
            </div>
          </form>
        </Form>
      </div>
    </SectionCard>
  );
}
