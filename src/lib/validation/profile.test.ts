import { describe, expect, it } from "vitest";
import {
  personalInfoSchema,
  parseInterests,
  munProfileSchema,
  awardSchema,
  committeeSchema,
  socialLinkSchema,
} from "@/lib/validation/profile";

describe("personalInfoSchema", () => {
  it("requires first and last name", () => {
    const result = personalInfoSchema.safeParse({ firstName: "", lastName: "" });
    expect(result.success).toBe(false);
  });

  it("validates the username format", () => {
    expect(personalInfoSchema.safeParse({ firstName: "A", lastName: "B", username: "bad name!" }).success).toBe(false);
    expect(personalInfoSchema.safeParse({ firstName: "A", lastName: "B", username: "good_name" }).success).toBe(true);
  });

  it("rejects invalid avatar URLs", () => {
    const result = personalInfoSchema.safeParse({
      firstName: "A",
      lastName: "B",
      username: "good_name",
      avatarUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});

describe("parseInterests", () => {
  it("splits, trims, filters, and dedupes", () => {
    expect(parseInterests(" Security Council, Crisis, Security Council , ")).toEqual([
      "Security Council",
      "Crisis",
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(parseInterests("")).toEqual([]);
    expect(parseInterests(undefined)).toEqual([]);
  });
});

describe("munProfileSchema", () => {
  it("rejects out-of-range counts", () => {
    expect(munProfileSchema.safeParse({ experienceLevel: "BEGINNER", munsAttended: "99999" }).success).toBe(false);
    expect(munProfileSchema.safeParse({ experienceLevel: "BEGINNER", munsAttended: "42" }).success).toBe(true);
  });
});

describe("awardSchema", () => {
  it("requires a title", () => {
    expect(awardSchema.safeParse({ title: "" }).success).toBe(false);
    expect(awardSchema.safeParse({ title: "Best Delegate", year: "2025" }).success).toBe(true);
  });
});

describe("committeeSchema", () => {
  it("requires name and role", () => {
    expect(committeeSchema.safeParse({ name: "UNSC", role: "" }).success).toBe(false);
    expect(committeeSchema.safeParse({ name: "UNSC", role: "Delegate" }).success).toBe(true);
  });
});

describe("socialLinkSchema", () => {
  it("requires a URL", () => {
    expect(socialLinkSchema.safeParse({ platform: "LINKEDIN", url: "" }).success).toBe(false);
    expect(socialLinkSchema.safeParse({ platform: "GITHUB", url: "https://github.com/x" }).success).toBe(true);
  });
});
