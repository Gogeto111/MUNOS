/**
 * Pure helpers for the AI judge: normalization and defensive parsing of the
 * model's JSON output. No network, no dependencies, fully unit-testable.
 */

export interface AiScoreResult {
  overall: number;
  confidence: number;
  diplomacy: number;
  research: number;
  flow: number;
  speakingTimeSec: number;
  logicalFallacies: number;
  suggestions: string[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function num(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function numClamped(value: unknown, fallback: number, min: number, max: number): number {
  return clamp(num(value, fallback), min, max);
}

function strs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 12);
}

/** Coerces an arbitrary parsed JSON value into a well-formed score. */
export function normalizeScore(raw: unknown): AiScoreResult {
  const obj =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    overall: numClamped(obj.overall, 0, 0, 100),
    confidence: numClamped(obj.confidence, 0, 0, 10),
    diplomacy: numClamped(obj.diplomacy, 0, 0, 10),
    research: numClamped(obj.research, 0, 0, 10),
    flow: numClamped(obj.flow, 0, 0, 10),
    speakingTimeSec: Math.max(0, num(obj.speakingTimeSec, 0)),
    logicalFallacies: Math.max(0, Math.floor(num(obj.logicalFallacies, 0))),
    suggestions: strs(obj.suggestions),
  };
}

function numberNear(text: string, label: string, min: number, max: number): number | null {
  const pattern = new RegExp(
    `${label}\\w*\\s*[:=\\-]?\\s*(\\d{1,3}(?:\\.\\d{1,2})?)`,
    "i",
  );
  const match = text.match(pattern);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  return clamp(value, min, max);
}

/**
 * Defensive parser used when the model's JSON output is malformed. Extracts
 * whatever fields are present; returns null when nothing usable is found.
 */
export function parseScoreFallback(text: string): AiScoreResult | null {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return normalizeScore(JSON.parse(cleaned));
  } catch {
    // fall through to regex extraction
  }

  const overall = numberNear(cleaned, "overall", 0, 100);
  const confidence = numberNear(cleaned, "confidence", 0, 10);
  const diplomacy = numberNear(cleaned, "diplomacy", 0, 10);
  const research = numberNear(cleaned, "research", 0, 10);
  const flow = numberNear(cleaned, "flow", 0, 10);
  const speakingTimeSec = numberNear(cleaned, "speaking", 0, 600);
  const logicalFallacies = numberNear(cleaned, "fallac", 0, 50);

  if (
    overall === null &&
    confidence === null &&
    diplomacy === null &&
    research === null &&
    flow === null
  ) {
    return null;
  }

  return normalizeScore({
    overall: overall ?? 0,
    confidence: confidence ?? 0,
    diplomacy: diplomacy ?? 0,
    research: research ?? 0,
    flow: flow ?? 0,
    speakingTimeSec: speakingTimeSec ?? 0,
    logicalFallacies: Math.floor(logicalFallacies ?? 0),
    suggestions: [],
  });
}
