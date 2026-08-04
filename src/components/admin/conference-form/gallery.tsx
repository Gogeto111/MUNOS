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

export function GallerySection() {
  const { control } = useFormContext<ConferenceDraftFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "gallery" });

  return (
    <SectionCard title="Gallery" subtitle="Image URLs shown in the gallery grid.">
      <div className="space-y-3">
        {fields.map((image, index) => (
          <div key={image.id} className="flex flex-wrap items-start gap-2 rounded-xl border border-border/60 p-3">
            <FormField
              control={control}
              name={`gallery.${index}.url`}
              render={({ field }) => (
                <FormItem className="min-w-52 flex-1">
                  <FormControl>
                    <Input placeholder="Image URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Input
              placeholder="Caption (optional)"
              className="min-w-40 flex-1"
              {...control.register(`gallery.${index}.caption`)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive"
              aria-label="Remove image"
              onClick={() => remove(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => append({ url: "", alt: "", caption: "" })}>
          <Plus className="mr-1 size-4" />
          Add image
        </Button>
      </div>
    </SectionCard>
  );
}
