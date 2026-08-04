"use client";

import { useFormContext } from "react-hook-form";
import type { ConferenceDraftFormValues } from "@/lib/validation/conference";
import { SectionCard, Grid, TextField, TextareaField } from "./shared";

export function OrganizerSection() {
  const { control } = useFormContext<ConferenceDraftFormValues>();

  return (
    <SectionCard title="Organizer">
      <div className="space-y-4">
        <Grid>
          <TextField control={control} name="organizer.name" label="Name" />
          <TextField control={control} name="organizer.school" label="School" />
          <TextField control={control} name="organizer.university" label="University" />
        </Grid>
        <TextareaField control={control} name="organizer.description" label="Description" rows={3} />
        <Grid>
          <TextField control={control} name="organizer.website" label="Website" />
          <TextField control={control} name="organizer.email" label="Email" />
          <TextField control={control} name="organizer.instagram" label="Instagram" />
          <TextField control={control} name="organizer.logoUrl" label="Logo URL" />
        </Grid>
      </div>
    </SectionCard>
  );
}
