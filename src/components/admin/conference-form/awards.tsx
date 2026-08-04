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

export function AwardsSection() {
  const { control } = useFormContext<ConferenceDraftFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "awards" });

  return (
    <SectionCard title="Awards">
      <div className="space-y-3">
        {fields.map((award, index) => (
          <div key={award.id} className="flex flex-wrap items-start gap-2 rounded-xl border border-border/60 p-3">
            <FormField
              control={control}
              name={`awards.${index}.name`}
              render={({ field }) => (
                <FormItem className="min-w-40 flex-1">
                  <FormControl>
                    <Input placeholder="Award name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Input
              placeholder="Description"
              className="min-w-52 flex-1"
              {...control.register(`awards.${index}.description`)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive"
              aria-label="Remove award"
              onClick={() => remove(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => append({ name: "", description: "" })}>
          <Plus className="mr-1 size-4" />
          Add award
        </Button>
      </div>
    </SectionCard>
  );
}
