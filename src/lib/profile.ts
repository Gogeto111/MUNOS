export interface ProfileCompletionInput {
  avatarUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  phoneNumber: string | null;
  school: string | null;
  grade: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  bio: string | null;
  experienceLevel: string | null;
  munsAttended: number;
  awardsWon: number;
  interestsCount: number;
  committeesCount: number;
  countriesCount: number;
  awardsCount: number;
  certificatesCount: number;
  socialLinksCount: number;
}

export interface ProfileCompletionResult {
  /** 0–100 */
  score: number;
  completedFields: number;
  totalFields: number;
  /** Human-readable labels for fields still missing. */
  missing: string[];
}

const PERSONAL_FIELDS: { key: keyof ProfileCompletionInput; label: string }[] = [
  { key: "avatarUrl", label: "Profile picture" },
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "username", label: "Username" },
  { key: "phoneNumber", label: "Phone number" },
  { key: "school", label: "School" },
  { key: "grade", label: "Grade" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "country", label: "Country" },
  { key: "bio", label: "Biography" },
];

const MUN_FIELDS: { key: keyof ProfileCompletionInput; label: string }[] = [
  { key: "experienceLevel", label: "Experience level" },
  { key: "munsAttended", label: "MUNs attended" },
  { key: "awardsWon", label: "Awards won" },
  { key: "interestsCount", label: "Interests" },
  { key: "committeesCount", label: "Committees" },
  { key: "countriesCount", label: "Countries represented" },
];

const PORTFOLIO_FIELDS: { key: keyof ProfileCompletionInput; label: string }[] = [
  { key: "awardsCount", label: "Awards" },
  { key: "certificatesCount", label: "Certificates" },
  { key: "socialLinksCount", label: "Social links" },
];

const PERSONAL_WEIGHT = 0.5;
const MUN_WEIGHT = 0.3;
const PORTFOLIO_WEIGHT = 0.2;

function isFilled(input: ProfileCompletionInput, key: keyof ProfileCompletionInput): boolean {
  const value = input[key];
  if (typeof value === "number") return value > 0;
  return Boolean(value);
}

/**
 * Computes a weighted 0–100 profile-completion score from personal, MUN,
 * and portfolio data. Pure and deterministic — unit tested.
 */
export function getProfileCompletion(
  input: ProfileCompletionInput,
): ProfileCompletionResult {
  const [personal, mun, portfolio] = [PERSONAL_FIELDS, MUN_FIELDS, PORTFOLIO_FIELDS];

  const group = (fields: typeof personal, weight: number) => {
    const missing: string[] = [];
    let filled = 0;
    for (const field of fields) {
      if (isFilled(input, field.key)) {
        filled += 1;
      } else {
        missing.push(field.label);
      }
    }
    return { filled, total: fields.length, weight, missing };
  };

  const p = group(personal, PERSONAL_WEIGHT);
  const m = group(mun, MUN_WEIGHT);
  const pf = group(portfolio, PORTFOLIO_WEIGHT);

  const weighted =
    (p.filled / p.total) * p.weight + (m.filled / m.total) * m.weight + (pf.filled / pf.total) * pf.weight;

  return {
    score: Math.round(weighted * 100),
    completedFields: p.filled + m.filled + pf.filled,
    totalFields: p.total + m.total + pf.total,
    missing: [...p.missing, ...m.missing, ...pf.missing],
  };
}

/** Convenience label buckets used by the dashboard progress widget. */
export function completionTone(score: number): "low" | "mid" | "high" {
  if (score < 40) return "low";
  if (score < 75) return "mid";
  return "high";
}
