"use client";

import { useFormContext } from "react-hook-form";
import {
  ConferenceFormat,
  ExperienceLevel,
} from "@/generated/prisma/browser";
import type { ConferenceDraftFormValues } from "@/lib/validation/conference";
import { sanitizeSlug } from "@/lib/format";
import {
  SectionCard,
  Grid,
  TextField,
  TextareaField,
  SelectField,
  SwitchField,
} from "./shared";

const FORMATS = [
  { value: ConferenceFormat.OFFLINE, label: "In person" },
  { value: ConferenceFormat.ONLINE, label: "Online" },
  { value: ConferenceFormat.HYBRID, label: "Hybrid" },
];

const LEVELS = Object.values(ExperienceLevel).map((level) => ({
  value: level,
  label: level.replace(/_/g, " "),
}));

export function BasicsSection() {
  const { control } = useFormContext<ConferenceDraftFormValues>();

  return (
    <SectionCard title="Basics" subtitle="The headline information delegates see first.">
      <div className="space-y-4">
        <Grid>
          <TextField
            control={control}
            name="conference.name"
            label="Conference name"
            required
            placeholder="e.g. Geneva International MUN"
          />
          <TextField
            control={control}
            name="conference.slug"
            label="Slug"
            required
            placeholder="geneva-international-mun"
            normalize={sanitizeSlug}
          />
        </Grid>
        <TextField
          control={control}
          name="conference.tagline"
          label="Tagline"
          placeholder="A short, catchy one-liner"
        />
        <TextareaField
          control={control}
          name="conference.description"
          label="Description"
          required
          rows={5}
          placeholder="What makes this conference special?"
        />
        <TextField
          control={control}
          name="conference.theme"
          label="Theme"
          placeholder="e.g. Bridging Divides in a Multipolar World"
        />
        <Grid>
          <SelectField control={control} name="conference.format" label="Format" options={FORMATS} />
          <SelectField control={control} name="conference.difficulty" label="Difficulty" options={LEVELS} />
        </Grid>
        <Grid>
          <SwitchField control={control} name="conference.featured" label="Featured on discover" />
          <SwitchField control={control} name="conference.published" label="Published (visible to delegates)" />
        </Grid>
      </div>
    </SectionCard>
  );
}
