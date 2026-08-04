"use client";

import { useFormContext } from "react-hook-form";
import type { ConferenceDraftFormValues } from "@/lib/validation/conference";
import { SectionCard, Grid, TextField, SwitchField } from "./shared";

export function DatesFeesSection() {
  const { control } = useFormContext<ConferenceDraftFormValues>();

  return (
    <SectionCard title="Dates & fees">
      <div className="space-y-4">
        <Grid>
          <TextField control={control} name="conference.startDate" label="Start date" required type="datetime-local" />
          <TextField control={control} name="conference.endDate" label="End date" required type="datetime-local" />
          <TextField control={control} name="conference.registrationDeadline" label="Registration deadline" type="datetime-local" />
        </Grid>
        <Grid>
          <TextField control={control} name="conference.fee" label="Delegate fee" type="number" step="0.01" min={0} placeholder="0 = free" />
          <TextField
            control={control}
            name="conference.currency"
            label="Currency"
            maxLength={3}
            placeholder="USD"
            normalize={(v) => v.toUpperCase()}
          />
          <TextField control={control} name="conference.capacity" label="Capacity (delegates)" type="number" min={0} />
        </Grid>
        <Grid>
          <SwitchField control={control} name="conference.registrationOpen" label="Registration is open" />
          <SwitchField control={control} name="conference.externalDelegates" label="External delegates welcome" />
        </Grid>
      </div>
    </SectionCard>
  );
}
