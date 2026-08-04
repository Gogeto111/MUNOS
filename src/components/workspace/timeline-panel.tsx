"use client";

import { CalendarClock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  timelineEventInputSchema,
  type TimelineEventInput,
} from "@/lib/validation/workspace";
import { createTimelineEvent, deleteTimelineEvent } from "@/lib/actions/workspace";
import type { TimelineEvent } from "@/generated/prisma/browser";
import { daysUntil } from "@/lib/workspace";
import { formatDate } from "@/lib/format";
import { useServerAction } from "@/components/profile/use-server-action";
import { FormSubmitButton } from "@/components/profile/form-submit-button";
import { DeleteButton } from "@/components/profile/delete-button";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const EMPTY_EVENT: TimelineEventInput = { title: "", date: "", description: "" };

export function TimelinePanel({
  workspaceId,
  events,
}: {
  workspaceId: string;
  events: TimelineEvent[];
}) {
  const form = useForm<TimelineEventInput>({
    resolver: zodResolver(timelineEventInputSchema),
    defaultValues: EMPTY_EVENT,
  });
  const { isPending, run } = useServerAction(
    (values) => createTimelineEvent(workspaceId, values),
    form.setError,
  );

  const sorted = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <SectionCard
      title="Timeline"
      description="Key dates for this conference's prep cycle."
      icon={CalendarClock}
    >
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              run(values).then((res) => {
                if (res.status === "success") form.reset(EMPTY_EVENT);
              }),
            )}
            className="space-y-4 rounded-lg border border-dashed border-border/70 p-4"
            noValidate
          >
            <p className="text-sm font-medium">Add an event</p>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Deadline for country assignments" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                  <FormLabel>Details</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Optional details…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <FormSubmitButton isPending={isPending} label="Add event" />
            </div>
          </form>
        </Form>

        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No events yet. Add registration or paper deadlines here.
          </p>
        ) : (
          <ol className="relative space-y-4 border-l border-border/70 pl-6">
            {sorted.map((event) => {
              const days = daysUntil(event.date);
              const past = days < 0;
              return (
                <li key={event.id} className="group relative">
                  <span
                    className={cn(
                      "absolute -left-[31px] top-1.5 size-2.5 rounded-full border-2 border-background",
                      past ? "bg-muted-foreground/40" : "bg-brand-500",
                    )}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={cn("text-sm font-medium", past && "text-muted-foreground")}>
                        {event.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(event.date)}</p>
                      {event.description ? (
                        <p className="mt-1 text-xs text-muted-foreground">{event.description}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={past ? "outline" : "default"}>
                        {past ? "past" : days === 0 ? "today" : `in ${days}d`}
                      </Badge>
                      <DeleteButton
                        action={(id) => deleteTimelineEvent(workspaceId, id)}
                        id={event.id}
                        className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </SectionCard>
  );
}
