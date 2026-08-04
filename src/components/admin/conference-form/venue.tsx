"use client";

import { useFormContext } from "react-hook-form";
import type { ConferenceDraftFormValues } from "@/lib/validation/conference";
import { SectionCard, Grid, TextField } from "./shared";

export function VenueSection() {
  const { control } = useFormContext<ConferenceDraftFormValues>();

  return (
    <SectionCard title="Venue">
      <div className="space-y-4">
        <Grid>
          <TextField control={control} name="venue.name" label="Venue name" />
          <TextField control={control} name="venue.address" label="Address" />
          <TextField control={control} name="venue.city" label="City" />
          <TextField control={control} name="venue.state" label="State / Region" />
          <TextField control={control} name="venue.country" label="Country" />
        </Grid>
        <Grid>
          <TextField control={control} name="venue.latitude" label="Latitude" placeholder="47.3769" />
          <TextField control={control} name="venue.longitude" label="Longitude" placeholder="8.5417" />
          <TextField
            control={control}
            name="venue.mapsUrl"
            label="Google Maps URL"
            className="sm:col-span-2"
          />
        </Grid>
      </div>
    </SectionCard>
  );
}
