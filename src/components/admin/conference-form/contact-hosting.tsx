"use client";

import { useFormContext } from "react-hook-form";
import type { ConferenceDraftFormValues } from "@/lib/validation/conference";
import { SectionCard, Grid, TextField } from "./shared";

export function ContactHostingSection() {
  const { control } = useFormContext<ConferenceDraftFormValues>();

  return (
    <SectionCard title="Contact & hosting">
      <div className="space-y-4">
        <Grid>
          <TextField control={control} name="conference.website" label="Website" placeholder="https://…" />
          <TextField control={control} name="conference.instagram" label="Instagram" placeholder="https://instagram.com/…" />
          <TextField control={control} name="conference.email" label="Contact email" placeholder="info@…" />
        </Grid>
        <Grid>
          <TextField control={control} name="conference.school" label="Host school" />
          <TextField control={control} name="conference.university" label="Host university" />
        </Grid>
        <Grid>
          <TextField control={control} name="conference.city" label="City" required />
          <TextField control={control} name="conference.state" label="State / Region" />
          <TextField control={control} name="conference.country" label="Country" required />
        </Grid>
        <Grid>
          <TextField control={control} name="conference.logoUrl" label="Logo image URL" />
          <TextField control={control} name="conference.bannerUrl" label="Banner image URL" />
        </Grid>
      </div>
    </SectionCard>
  );
}
