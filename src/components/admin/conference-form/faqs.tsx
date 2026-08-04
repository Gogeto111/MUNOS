"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { ConferenceDraftFormValues } from "@/lib/validation/conference";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { SectionCard } from "./shared";

export function FaqsSection() {
  const { control } = useFormContext<ConferenceDraftFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "faqs" });

  return (
    <SectionCard title="Frequently asked questions">
      <div className="space-y-3">
        {fields.map((faq, index) => (
          <div key={faq.id} className="space-y-2 rounded-xl border border-border/60 p-3">
            <FormField
              control={control}
              name={`faqs.${index}.question`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Question" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`faqs.${index}.answer`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="Answer" rows={2} {...field} />
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
              aria-label="Remove FAQ"
              onClick={() => remove(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => append({ question: "", answer: "" })}>
          <Plus className="mr-1 size-4" />
          Add FAQ
        </Button>
      </div>
    </SectionCard>
  );
}
