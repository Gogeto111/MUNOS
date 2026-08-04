"use client";

import type { ConferenceDraft } from "@/lib/actions/conference";
import {
  ConferenceFormat,
  ExperienceLevel,
} from "@/generated/prisma/browser";

export function emptyDraft(): ConferenceDraft {
  return {
    conference: {
      name: "",
      slug: "",
      tagline: "",
      description: "",
      theme: "",
      format: ConferenceFormat.OFFLINE,
      difficulty: ExperienceLevel.BEGINNER,
      startDate: "",
      endDate: "",
      registrationOpen: true,
      externalDelegates: true,
      fee: "",
      currency: "USD",
      registrationDeadline: "",
      capacity: "",
      website: "",
      instagram: "",
      email: "",
      school: "",
      university: "",
      city: "",
      state: "",
      country: "",
      logoUrl: "",
      bannerUrl: "",
      featured: false,
      published: true,
    },
    organizer: { name: "", description: "", school: "", university: "", website: "", email: "", instagram: "", logoUrl: "" },
    venue: { name: "", address: "", city: "", state: "", country: "", latitude: "", longitude: "", mapsUrl: "" },
    committees: [],
    agenda: [],
    brochures: [],
    gallery: [],
    socialLinks: [],
    awards: [],
    faqs: [],
    secretariat: [],
  };
}
