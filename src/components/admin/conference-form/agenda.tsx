"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { ConferenceDraftFormValues } from "@/lib/validation/conference";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { SectionCard } from "./shared";

export function AgendaSection() {
  const { control } = useFormContext<ConferenceDraftFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "agenda" });

  return (
    <SectionCard title="Agenda" subtitle="Key programme sessions shown on the detail page.">
      <div className="space-y-3">
        {fields.map((item, index) => (
          <div key={item.id} className="flex flex-wrap items-start gap-2 rounded-xl border border-border/60 p-3">
            <FormField
              control={control}
              name={`agenda.${index}.title`}
              render={({ field }) => (
                <FormItem className="min-w-40 flex-1">
                  <FormControl>
                    <Input placeholder="Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Input
              placeholder="Description"
              className="min-w-40 flex-1"
              {...control.register(`agenda.${index}.description`)}
            />
            <FormField
              control={control}
              name={`agenda.${index}.startAt`}
              render={({ field }) => (
                <FormItem className="min-w-52">
                  <FormControl>
                    <Input type="datetime-local" aria-label="Start time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Input
              type="datetime-local"
              aria-label="End time"
              {...control.register(`agenda.${index}.endAt`)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive"
              aria-label="Remove agenda item"
              onClick={() => remove(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({ title: "", description: "", startAt: "", endAt: "", sortOrder: String(fields.length) })
          }
        >
          <Plus className="mr-1 size-4" />
          Add agenda item
        </Button>
      </div>
    </SectionCard>
  );
}
