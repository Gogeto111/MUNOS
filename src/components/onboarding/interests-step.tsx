"use client";

import { cn } from "@/lib/utils";
import {
  Leaf,
  Heart,
  Shield,
  TrendingUp,
  Activity,
  Cpu,
  BookOpen,
  Bird,
} from "lucide-react";

const topics = [
  { id: "environment", label: "Environment", icon: Leaf, color: "text-green-500", bg: "bg-green-500/10" },
  { id: "human-rights", label: "Human Rights", icon: Heart, color: "text-red-500", bg: "bg-red-500/10" },
  { id: "security", label: "Security", icon: Shield, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "economics", label: "Economics", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "health", label: "Health", icon: Activity, color: "text-rose-500", bg: "bg-rose-500/10" },
  { id: "technology", label: "Technology", icon: Cpu, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "education", label: "Education", icon: BookOpen, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { id: "peace", label: "Peace", icon: Bird, color: "text-teal-500", bg: "bg-teal-500/10" },
] as const;

interface InterestsStepProps {
  selected: string[];
  onToggle: (id: string) => void;
}

export function InterestsStep({ selected, onToggle }: InterestsStepProps) {
  const isValid = selected.length >= 3;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">What topics interest you?</h2>
        <p className="text-sm text-muted-foreground">
          Select at least 3 to personalize your feed and research.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
        {topics.map((topic) => {
          const isSelected = selected.includes(topic.id);
          return (
            <button
              key={topic.id}
              onClick={() => onToggle(topic.id)}
              className={cn(
                "flex flex-col items-center gap-2.5 rounded-xl border p-4 transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.02]"
                  : "border-border/50 bg-card hover:border-primary/30 hover:shadow-sm"
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-lg transition-colors",
                  isSelected ? "bg-primary/15" : topic.bg
                )}
              >
                <topic.icon
                  className={cn("h-5 w-5 transition-colors", isSelected ? "text-primary" : topic.color)}
                />
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  isSelected ? "text-primary" : "text-foreground"
                )}
              >
                {topic.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="text-center">
        <p
          className={cn(
            "text-xs font-medium transition-colors",
            isValid ? "text-green-500" : "text-muted-foreground"
          )}
        >
          {selected.length}/8 selected {isValid ? "— looking good!" : `— select ${3 - selected.length} more`}
        </p>
      </div>
    </div>
  );
}
