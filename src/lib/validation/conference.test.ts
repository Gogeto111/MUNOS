import { describe, expect, it } from "vitest";
import { conferenceChildrenSchema } from "@/lib/validation/conference";

function emptyDraft(overrides: Record<string, unknown> = {}) {
  return {
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
    ...overrides,
  };
}

describe("conferenceChildrenSchema", () => {
  it("accepts an empty draft (no children)", () => {
    expect(conferenceChildrenSchema.safeParse(emptyDraft()).success).toBe(true);
  });

  it("accepts a fully populated valid draft", () => {
    const draft = emptyDraft({
      organizer: { name: "HMUN", website: "https://hmun.example", email: "team@hmun.example" },
      venue: { name: "Geneva International", city: "Geneva", country: "Switzerland", mapsUrl: "https://maps.example" },
      committees: [
        {
          name: "GA1",
          difficulty: "BEGINNER",
          maxDelegates: "40",
          countryMatrix: [{ country: "France", seats: "2" }],
        },
      ],
      agenda: [{ title: "Opening ceremony", startAt: "2026-01-15T09:00", endAt: "2026-01-15T10:00", sortOrder: "1" }],
      brochures: [{ title: "Guide", fileUrl: "https://hmun.example/guide.pdf", fileName: "guide.pdf", mimeType: "application/pdf", sizeBytes: "2048" }],
      gallery: [{ url: "https://hmun.example/photo.jpg", alt: "Opening", caption: "Day one" }],
      socialLinks: [{ platform: "INSTAGRAM", url: "https://instagram.com/hmun" }],
      awards: [{ name: "Best Delegate", description: "Top scorer" }],
      faqs: [{ question: "Where?", answer: "Geneva" }],
      secretariat: [{ name: "Jane Doe", role: "Secretary-General" }],
    });
    expect(conferenceChildrenSchema.safeParse(draft).success).toBe(true);
  });

  it("rejects an organizer with an invalid email", () => {
    const draft = emptyDraft({ organizer: { name: "HMUN", email: "not-an-email" } });
    const result = conferenceChildrenSchema.safeParse(draft);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path.join("."))).toContain("organizer.email");
    }
  });

  it("rejects a venue with an invalid mapsUrl", () => {
    const draft = emptyDraft({
      venue: { name: "Geneva", city: "Geneva", country: "Switzerland", mapsUrl: "not-a-url" },
    });
    const result = conferenceChildrenSchema.safeParse(draft);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path.join("."))).toContain("venue.mapsUrl");
    }
  });

  it("rejects a committee missing a name", () => {
    const draft = emptyDraft({
      committees: [{ name: "", difficulty: "BEGINNER", countryMatrix: [] }],
    });
    expect(conferenceChildrenSchema.safeParse(draft).success).toBe(false);
  });

  it("rejects a committee with an unknown difficulty", () => {
    const draft = emptyDraft({
      committees: [{ name: "GA1", difficulty: "SUPERHERO", countryMatrix: [] }],
    });
    expect(conferenceChildrenSchema.safeParse(draft).success).toBe(false);
  });

  it("rejects a country-matrix entry missing a country", () => {
    const draft = emptyDraft({
      committees: [{ name: "GA1", difficulty: "BEGINNER", countryMatrix: [{ country: "", seats: "1" }] }],
    });
    expect(conferenceChildrenSchema.safeParse(draft).success).toBe(false);
  });

  it("rejects an agenda item missing a start time", () => {
    const draft = emptyDraft({ agenda: [{ title: "Session", startAt: "", sortOrder: "1" }] });
    expect(conferenceChildrenSchema.safeParse(draft).success).toBe(false);
  });

  it("rejects a brochure missing a fileUrl", () => {
    const draft = emptyDraft({ brochures: [{ title: "Guide", fileUrl: "" }] });
    expect(conferenceChildrenSchema.safeParse(draft).success).toBe(false);
  });

  it("rejects a social link with an unknown platform", () => {
    const draft = emptyDraft({ socialLinks: [{ platform: "MYSPACE", url: "https://example.com" }] });
    expect(conferenceChildrenSchema.safeParse(draft).success).toBe(false);
  });

  it("rejects an FAQ missing an answer", () => {
    const draft = emptyDraft({ faqs: [{ question: "Where?", answer: "" }] });
    expect(conferenceChildrenSchema.safeParse(draft).success).toBe(false);
  });

  it("rejects a secretariat member missing a role", () => {
    const draft = emptyDraft({ secretariat: [{ name: "Jane Doe", role: "" }] });
    expect(conferenceChildrenSchema.safeParse(draft).success).toBe(false);
  });
});
