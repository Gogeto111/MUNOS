import { describe, expect, it } from "vitest";
import { normalizeScore, parseScoreFallback } from "@/lib/ai/judge-parse";

describe("normalizeScore", () => {
  it("passes a well-formed score through unchanged", () => {
    const result = normalizeScore({
      overall: 84,
      confidence: 7.5,
      diplomacy: 8,
      research: 9,
      flow: 7,
      speakingTimeSec: 92,
      logicalFallacies: 1,
      suggestions: ["Slow down", "Add a citation"],
    });
    expect(result).toEqual({
      overall: 84,
      confidence: 7.5,
      diplomacy: 8,
      research: 9,
      flow: 7,
      speakingTimeSec: 92,
      logicalFallacies: 1,
      suggestions: ["Slow down", "Add a citation"],
    });
  });

  it("clamps out-of-range values into the rubric bounds", () => {
    const result = normalizeScore({ overall: 999, confidence: -3, speakingTimeSec: -10, logicalFallacies: 2.9 });
    expect(result.overall).toBe(100);
    expect(result.confidence).toBe(0);
    expect(result.speakingTimeSec).toBe(0);
    expect(result.logicalFallacies).toBe(2);
  });

  it("fills missing fields with safe defaults", () => {
    const result = normalizeScore({});
    expect(result).toEqual({
      overall: 0,
      confidence: 0,
      diplomacy: 0,
      research: 0,
      flow: 0,
      speakingTimeSec: 0,
      logicalFallacies: 0,
      suggestions: [],
    });
  });

  it("ignores non-object input", () => {
    expect(normalizeScore("garbage").overall).toBe(0);
    expect(normalizeScore(null).overall).toBe(0);
  });

  it("caps suggestions at twelve entries", () => {
    const result = normalizeScore({ suggestions: Array.from({ length: 20 }, (_, i) => `tip ${i}`) });
    expect(result.suggestions).toHaveLength(12);
  });
});

describe("parseScoreFallback", () => {
  it("parses a fenced JSON block", () => {
    const result = parseScoreFallback("```json\n{\"overall\": 71, \"confidence\": 6, \"suggestions\": [\"a\"]}\n```");
    expect(result?.overall).toBe(71);
    expect(result?.confidence).toBe(6);
    expect(result?.suggestions).toEqual(["a"]);
  });

  it("extracts labeled numbers from prose when JSON is malformed", () => {
    const result = parseScoreFallback(
      "Overall: 88.5, confidence 7, diplomacy: 8, research = 9, flow 6, speaking 95 seconds, fallacies: 2",
    );
    expect(result?.overall).toBe(88.5);
    expect(result?.confidence).toBe(7);
    expect(result?.diplomacy).toBe(8);
    expect(result?.research).toBe(9);
    expect(result?.flow).toBe(6);
    expect(result?.speakingTimeSec).toBe(95);
    expect(result?.logicalFallacies).toBe(2);
  });

  it("returns null when nothing score-like is present", () => {
    expect(parseScoreFallback("the delegate spoke well")).toBeNull();
    expect(parseScoreFallback("")).toBeNull();
  });

  it("clamps prose-extracted numbers to the rubric bounds", () => {
    const result = parseScoreFallback("Overall: 500, confidence: 99");
    expect(result?.overall).toBe(100);
    expect(result?.confidence).toBe(10);
  });
});
