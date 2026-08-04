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

export function BrochuresSection() {
  const { control } = useFormContext<ConferenceDraftFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "brochures" });

  return (
    <SectionCard title="Brochures">
      <div className="space-y-3">
        {fields.map((brochure, index) => (
          <div key={brochure.id} className="flex flex-wrap items-start gap-2 rounded-xl border border-border/60 p-3">
            <Input
              placeholder="Title (optional)"
              className="min-w-40 flex-1"
              {...control.register(`brochures.${index}.title`)}
            />
            <FormField
              control={control}
              name={`brochures.${index}.fileUrl`}
              render={({ field }) => (
                <FormItem className="min-w-52 flex-1">
                  <FormControl>
                    <Input placeholder="File URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive"
              aria-label="Remove brochure"
              onClick={() => remove(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ title: "", fileUrl: "", fileName: "", mimeType: "", sizeBytes: "" })}
        >
          <Plus className="mr-1 size-4" />
          Add brochure
        </Button>
      </div>
    </SectionCard>
  );
}
