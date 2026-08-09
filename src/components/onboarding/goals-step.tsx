"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";

const defaultGoals = [
  "Win Best Delegate",
  "Improve Public Speaking",
  "Learn Robert's Rules of Order",
  "Build a Strong Resolution",
  "Master Caucus Strategy",
  "Research Like a Pro",
  "Network with Delegates",
  "Chair a Committee",
];

interface GoalsStepProps {
  selected: string[];
  onToggle: (goal: string) => void;
}

export function GoalsStep({ selected, onToggle }: GoalsStepProps) {
  const [customGoal, setCustomGoal] = useState("");

  const addCustom = () => {
    const trimmed = customGoal.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onToggle(trimmed);
      setCustomGoal("");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Set your goals</h2>
        <p className="text-sm text-muted-foreground">
          What do you want to achieve? Pick as many as you like.
        </p>
      </div>

      <div className="max-w-lg mx-auto space-y-3">
        {defaultGoals.map((goal) => {
          const isChecked = selected.includes(goal);
          return (
            <Card
              key={goal}
              className={cn(
                "cursor-pointer transition-all duration-200",
                isChecked
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:border-primary/30"
              )}
              onClick={() => onToggle(goal)}
            >
              <CardContent className="flex items-center gap-3 py-3">
                <Checkbox checked={isChecked} onCheckedChange={() => onToggle(goal)} />
                <span className="text-sm font-medium">{goal}</span>
              </CardContent>
            </Card>
          );
        })}

        <div className="flex items-center gap-2 pt-2">
          <Input
            placeholder="Add a custom goal..."
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={addCustom}
            disabled={!customGoal.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-primary pt-1">
            <Target className="h-3.5 w-3.5" />
            <span className="font-medium">
              {selected.length} goal{selected.length !== 1 ? "s" : ""} set — you&apos;re on your way!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
