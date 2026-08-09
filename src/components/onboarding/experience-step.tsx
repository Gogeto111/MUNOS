"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const levels = [
  {
    id: "beginner",
    label: "Beginner",
    description: "New to Model UN or attended 1-2 conferences.",
    traits: ["Learning parliamentary procedure", "Building confidence", "Exploring committees"],
  },
  {
    id: "intermediate",
    label: "Intermediate",
    description: "Comfortable in committee, looking to level up.",
    traits: ["Drafting resolutions", "Forming blocs", "Giving substantive speeches"],
  },
  {
    id: "advanced",
    label: "Advanced",
    description: "Experienced delegate aiming for awards.",
    traits: ["Strategic caucus management", "Motions & procedure", "Negotiation tactics"],
  },
  {
    id: "veteran",
    label: "Veteran",
    description: "Multiple awards, mentoring others, chairing.",
    traits: ["Committee leadership", "Crisis simulation", "Policy expertise"],
  },
] as const;

interface ExperienceStepProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export function ExperienceStep({ selected, onSelect }: ExperienceStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">What&apos;s your MUN experience?</h2>
        <p className="text-sm text-muted-foreground">
          This helps us personalize your MUNOS experience.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 max-w-2xl mx-auto">
        {levels.map((level) => {
          const isSelected = selected === level.id;
          return (
            <Card
              key={level.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "border-border/50 hover:border-primary/30"
              )}
              onClick={() => onSelect(level.id)}
            >
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base">{level.label}</h3>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{level.description}</p>
                <ul className="space-y-1.5">
                  {level.traits.map((trait) => (
                    <li key={trait} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="h-1 w-1 rounded-full bg-primary/40 shrink-0" />
                      {trait}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
