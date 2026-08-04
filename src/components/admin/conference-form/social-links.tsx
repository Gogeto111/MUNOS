"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { SocialPlatform } from "@/generated/prisma/browser";
import type { ConferenceDraftFormValues } from "@/lib/validation/conference";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionCard } from "./shared";

const PLATFORMS = Object.values(SocialPlatform);

export function SocialLinksSection() {
  const { control } = useFormContext<ConferenceDraftFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "socialLinks" });

  return (
    <SectionCard title="Social links">
      <div className="space-y-3">
        {fields.map((link, index) => (
          <div key={link.id} className="flex flex-wrap items-start gap-2 rounded-xl border border-border/60 p-3">
            <FormField
              control={control}
              name={`socialLinks.${index}.platform`}
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value} disabled={field.disabled}>
                    <FormControl>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PLATFORMS.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`socialLinks.${index}.url`}
              render={({ field }) => (
                <FormItem className="min-w-52 flex-1">
                  <FormControl>
                    <Input placeholder="URL" {...field} />
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
              aria-label="Remove link"
              onClick={() => remove(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ platform: SocialPlatform.WEBSITE, url: "" })}
        >
          <Plus className="mr-1 size-4" />
          Add link
        </Button>
      </div>
    </SectionCard>
  );
}
