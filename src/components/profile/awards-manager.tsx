"use client";

import { Trophy } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { awardSchema, type AwardInput } from "@/lib/validation/profile";
import type { Award } from "@/generated/prisma/browser";
import { addAward, deleteAward } from "@/lib/actions/profile";
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

const EMPTY_AWARD: AwardInput = {
  title: "",
  issuer: "",
  category: "",
  year: "",
  description: "",
};

export function AwardsManager({ awards }: { awards: Award[] }) {
  const form = useForm<AwardInput>({
    resolver: zodResolver(awardSchema),
    defaultValues: EMPTY_AWARD,
  });

  const { isPending, run } = useServerAction(addAward, form.setError);

  return (
    <SectionCard
      title="Awards"
      description="Awards and distinctions from your MUN career."
      icon={Trophy}
    >
      <div className="space-y-4">
        {awards.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No awards yet. Add your first one below.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border/70">
            {awards.map((award) => (
              <li
                key={award.id}
                className="flex items-start justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{award.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {[award.issuer, award.category, award.year]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <DeleteButton action={deleteAward} id={award.id} />
              </li>
            ))}
          </ul>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              run(values).then((res) => {
                if (res.status === "success") form.reset(EMPTY_AWARD);
              }),
            )}
            className="space-y-4 rounded-lg border border-dashed border-border/70 p-4"
            noValidate
          >
            <p className="text-sm font-medium">Add an award</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Best Delegate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="issuer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuer</FormLabel>
                    <FormControl>
                      <Input placeholder="UAE MUN 2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Delegate award" {...field} />
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
                onClick={() => form.reset(EMPTY_AWARD)}
                disabled={isPending}
              >
                Clear
              </Button>
              <FormSubmitButton isPending={isPending} label="Add award" />
            </div>
          </form>
        </Form>
      </div>
    </SectionCard>
  );
}
