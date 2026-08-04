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

export function SecretariatSection() {
  const { control } = useFormContext<ConferenceDraftFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "secretariat" });

  return (
    <SectionCard title="Secretariat">
      <div className="space-y-3">
        {fields.map((member, index) => (
          <div key={member.id} className="flex flex-wrap items-start gap-2 rounded-xl border border-border/60 p-3">
            <FormField
              control={control}
              name={`secretariat.${index}.name`}
              render={({ field }) => (
                <FormItem className="min-w-40 flex-1">
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`secretariat.${index}.role`}
              render={({ field }) => (
                <FormItem className="min-w-40 flex-1">
                  <FormControl>
                    <Input placeholder="Role" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Input
              placeholder="Photo URL"
              className="min-w-52 flex-1"
              {...control.register(`secretariat.${index}.photoUrl`)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive"
              aria-label="Remove member"
              onClick={() => remove(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ name: "", role: "", photoUrl: "", bio: "" })}
        >
          <Plus className="mr-1 size-4" />
          Add member
        </Button>
      </div>
    </SectionCard>
  );
}
