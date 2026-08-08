import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ExperienceLevel } from "@/generated/prisma/browser";

const DIFFICULTY_COLORS: Record<ExperienceLevel, string> = {
  FIRST_TIMER: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
  BEGINNER: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800",
  INTERMEDIATE: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800",
  ADVANCED: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800",
  EXPERT: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
};

const DIFFICULTY_LABELS: Record<ExperienceLevel, string> = {
  FIRST_TIMER: "First timer",
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: string;
  className?: string;
}) {
  const level = (difficulty as ExperienceLevel) || "BEGINNER";

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full font-semibold",
        DIFFICULTY_COLORS[level] ?? DIFFICULTY_COLORS.BEGINNER,
        className,
      )}
    >
      {DIFFICULTY_LABELS[level] ?? difficulty}
    </Badge>
  );
}
