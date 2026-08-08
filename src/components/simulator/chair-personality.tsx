"use client";

import {
  Shield,
  Smile,
  Gavel,
  Scale,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ChairPersonalityType = "formal" | "friendly" | "strict" | "moderate";

interface ChairPersonalityOption {
  id: ChairPersonalityType;
  label: string;
  description: string;
  icon: React.ElementType;
}

const PERSONALITIES: ChairPersonalityOption[] = [
  {
    id: "formal",
    label: "Formal",
    description: "Strict UN protocol, official language",
    icon: Shield,
  },
  {
    id: "friendly",
    label: "Friendly",
    description: "Encouraging, helpful, approachable",
    icon: Smile,
  },
  {
    id: "strict",
    label: "Strict",
    description: "Time enforcement, no-nonsense",
    icon: Gavel,
  },
  {
    id: "moderate",
    label: "Moderate",
    description: "Balanced, professional tone",
    icon: Scale,
  },
];

export const CHAIR_PROMPTS: Record<ChairPersonalityType, string> = {
  formal:
    "You are a formal UN committee chair. Use official parliamentary language. " +
    "Refer to delegates by country name. Follow strict UN procedural rules. " +
    "Use phrases like 'The floor is now open', 'The chair recognizes', 'Order, please'.",
  friendly:
    "You are a friendly, encouraging committee chair. Welcome delegates warmly. " +
    "Offer helpful reminders about speaking order and POI etiquette. " +
    "Use an approachable tone while maintaining decorum.",
  strict:
    "You are a strict committee chair who enforces rules firmly. " +
    "Cut off speeches that exceed time limits. Enforce speaking order precisely. " +
    "Use short, direct sentences. No small talk.",
  moderate:
    "You are a balanced committee chair. Professional and fair. " +
    "Enforce rules when needed but allow flexibility. " +
    "Maintain a calm, measured tone throughout proceedings.",
};

interface ChairPersonalityProps {
  selected: ChairPersonalityType;
  onSelect: (personality: ChairPersonalityType) => void;
  showInSimulation?: boolean;
}

export function ChairPersonality({
  selected,
  onSelect,
  showInSimulation = false,
}: ChairPersonalityProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Gavel className="size-4" />
          Chair Personality
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {PERSONALITIES.map((p) => {
          const Icon = p.icon;
          const isActive = selected === p.id;
          return (
            <Button
              key={p.id}
              variant={isActive ? "default" : "outline"}
              className={cn(
                "w-full justify-start gap-2.5 text-left",
                showInSimulation && "h-auto py-2",
              )}
              onClick={() => onSelect(p.id)}
            >
              <Icon className="size-4 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium">{p.label}</p>
                {!showInSimulation && (
                  <p className="text-[10px] text-muted-foreground truncate">
                    {p.description}
                  </p>
                )}
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
