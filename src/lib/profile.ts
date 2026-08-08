export interface ProfileCompletionInput {
  avatarUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  phoneNumber: string | null;
  school: string | null;
  university: string | null;
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
  socialLinksCount: number; // Included in type to fix TS errors but not scored
}

export interface ProfileCompletionResult {
  score: number;
  completedFields: number;
  totalFields: number;
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

const ACHIEVEMENT_FIELDS: { key: keyof ProfileCompletionInput; label: string }[] = [
  { key: "awardsCount", label: "Awards" },
  { key: "certificatesCount", label: "Certificates" },
  { key: "socialLinksCount", label: "Social links" },
];

const PERSONAL_WEIGHT = 0.5;
const MUN_WEIGHT = 0.3;
const ACHIEVEMENT_WEIGHT = 0.2;

function isFilled(input: ProfileCompletionInput, key: keyof ProfileCompletionInput): boolean {
  const value = input[key];
  if (typeof value === "number") return value > 0;
  return Boolean(value);
}

export function getProfileCompletion(
  input: ProfileCompletionInput,
): ProfileCompletionResult {
  const group = (fields: typeof PERSONAL_FIELDS, weight: number) => {
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

  const p = group(PERSONAL_FIELDS, PERSONAL_WEIGHT);
  const m = group(MUN_FIELDS, MUN_WEIGHT);
  const a = group(ACHIEVEMENT_FIELDS, ACHIEVEMENT_WEIGHT);

  const weighted =
    (p.filled / p.total) * p.weight + (m.filled / m.total) * m.weight + (a.filled / a.total) * a.weight;

  return {
    score: Math.round(weighted * 100),
    completedFields: p.filled + m.filled + a.filled,
    totalFields: p.total + m.total + a.total,
    missing: [...p.missing, ...m.missing, ...a.missing],
  };
}

export function completionTone(score: number): "low" | "mid" | "high" {
  if (score < 40) return "low";
  if (score < 75) return "mid";
  return "high";
}
