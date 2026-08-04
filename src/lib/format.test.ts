import { describe, expect, it } from "vitest";
import {
  formatBytes,
  initials,
  displayName,
  slugify,
  sanitizeSlug,
  formatNumber,
} from "@/lib/format";

describe("formatBytes", () => {
  it("returns 0 B for invalid or negative input", () => {
    expect(formatBytes(-1)).toBe("0 B");
    expect(formatBytes(Number.NaN)).toBe("0 B");
    expect(formatBytes(Number.POSITIVE_INFINITY)).toBe("0 B");
  });

  it("formats bytes without decimals", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
  });

  it("formats KB/MB/GB with one decimal", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
    expect(formatBytes(2 * 1024 ** 3)).toBe("2.0 GB");
  });
});

describe("initials", () => {
  it("combines first and last initial uppercased", () => {
    expect(initials("Alex", "Rivera")).toBe("AR");
  });

  it("handles missing names", () => {
    expect(initials(null, "Rivera")).toBe("R");
    expect(initials("Alex", null)).toBe("A");
    expect(initials(null, null)).toBe("M");
  });
});

describe("displayName", () => {
  it("joins names", () => {
    expect(displayName("Alex", "Rivera")).toBe("Alex Rivera");
  });

  it("falls back for empty names", () => {
    expect(displayName(null, null)).toBe("Anonymous Delegate");
    expect(displayName("", "")).toBe("Anonymous Delegate");
  });
});

describe("slugify", () => {
  it("lowercases, trims, and replaces spaces", () => {
    expect(slugify("Harvard Model UN")).toBe("harvard-model-un");
  });

  it("strips non-alphanumeric chars", () => {
    expect(slugify("MUN: 2026!!")).toBe("mun-2026");
  });

  it("collapses multiple separators and trims dashes", () => {
    expect(slugify("  a--b__c  ")).toBe("a-b-c");
  });

  it("handles empty input", () => {
    expect(slugify("")).toBe("");
  });
});

describe("sanitizeSlug", () => {
  it("lowercases and keeps alphanumerics and dashes", () => {
    expect(sanitizeSlug("Harvard Model UN")).toBe("harvard-model-un");
  });

  it("replaces invalid chars with dashes", () => {
    expect(sanitizeSlug("MUN: 2026!!")).toBe("mun--2026--");
  });

  it("keeps consecutive dashes for live typing", () => {
    expect(sanitizeSlug("a--b")).toBe("a--b");
  });

  it("handles empty input", () => {
    expect(sanitizeSlug("")).toBe("");
  });
});

describe("formatNumber", () => {
  it("compacts large numbers", () => {
    expect(formatNumber(1250)).toBe("1.3K");
    expect(formatNumber(12_500_000)).toBe("12.5M");
  });

  it("returns 0 for non-finite input", () => {
    expect(formatNumber(Number.NaN)).toBe("0");
  });
});
