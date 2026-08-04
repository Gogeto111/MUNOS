"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ExperienceLevel } from "@/generated/prisma/browser";
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
  SectionCard,
  Grid,
  TextField,
  SelectField,
} from "./shared";

const LEVELS = Object.values(ExperienceLevel).map((level) => ({
  value: level,
  label: level.replace(/_/g, " "),
}));

const EMPTY_COMMITTEE = {
  name: "",
  topic: "",
  description: "",
  difficulty: ExperienceLevel.INTERMEDIATE,
  maxDelegates: "",
  countryMatrix: [] as { country: string; seats: string }[],
};

export function CommitteesSection() {
  const { control } = useFormContext<ConferenceDraftFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "committees" });

  return (
    <SectionCard
      title="Committees"
      subtitle="Each committee can carry its own country matrix."
    >
      <div className="space-y-4">
        {fields.map((committee, index) => (
          <div key={committee.id} className="rounded-xl border border-border/60 p-4">
            <div className="flex items-start justify-between gap-2">
              <Grid className="flex-1">
                <TextField control={control} name={`committees.${index}.name`} label="Name" />
                <TextField control={control} name={`committees.${index}.topic`} label="Topic" />
                <SelectField
                  control={control}
                  name={`committees.${index}.difficulty`}
                  label="Difficulty"
                  options={LEVELS}
                />
                <TextField
                  control={control}
                  name={`committees.${index}.maxDelegates`}
                  label="Max delegates"
                  type="number"
                  min={0}
                />
              </Grid>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive"
                aria-label="Remove committee"
                onClick={() => remove(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <div className="mt-4">
              <CommitteeMatrix committeeIndex={index} />
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => append(EMPTY_COMMITTEE)}>
          <Plus className="mr-1 size-4" />
          Add committee
        </Button>
      </div>
    </SectionCard>
  );
}

function CommitteeMatrix({ committeeIndex }: { committeeIndex: number }) {
  const { control } = useFormContext<ConferenceDraftFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `committees.${committeeIndex}.countryMatrix`,
  });

  return (
    <>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Country matrix
      </div>
      <div className="space-y-2">
        {fields.map((entry, entryIndex) => (
          <div key={entry.id} className="flex flex-wrap items-start gap-2">
            <FormField
              control={control}
              name={`committees.${committeeIndex}.countryMatrix.${entryIndex}.country`}
              render={({ field }) => (
                <FormItem className="min-w-40 flex-1">
                  <FormControl>
                    <Input placeholder="Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`committees.${committeeIndex}.countryMatrix.${entryIndex}.seats`}
              render={({ field }) => (
                <FormItem className="w-24">
                  <FormControl>
                    <Input placeholder="Seats" type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-destructive"
              aria-label="Remove country"
              onClick={() => remove(entryIndex)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ country: "", seats: "" })}
        >
          <Plus className="mr-1 size-3.5" />
          Add country
        </Button>
      </div>
    </>
  );
}
