"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles } from "lucide-react";

interface CompleteStepProps {
  experience: string | null;
  interests: string[];
  goals: string[];
}

export function CompleteStep({ experience, interests, goals }: CompleteStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Confetti animation */}
      <div className="confetti-container" aria-hidden="true">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              backgroundColor: [
                "hsl(var(--primary))",
                "hsl(142 71% 45%)",
                "hsl(45 93% 47%)",
                "hsl(262 83% 58%)",
                "hsl(330 81% 60%)",
                "hsl(199 89% 48%)",
              ][i % 6],
              width: `${6 + Math.random() * 6}px`,
              height: `${6 + Math.random() * 6}px`,
            }}
          />
        ))}
      </div>

      <div className="text-center space-y-4 relative">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-in zoom-in duration-500">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
            You&apos;re all set!
            <Sparkles className="h-5 w-5 text-amber-500" />
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Your MUNOS experience has been personalized. Let&apos;s make your next conference unforgettable.
          </p>
        </div>
      </div>

      <Card className="max-w-md mx-auto">
        <CardContent className="pt-5 space-y-4">
          {experience && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
                Experience Level
              </p>
              <Badge variant="secondary" className="capitalize">
                {experience}
              </Badge>
            </div>
          )}
          {interests.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
                Interests
              </p>
              <div className="flex flex-wrap gap-1.5">
                {interests.map((interest) => (
                  <Badge key={interest} variant="outline" className="capitalize text-[10px]">
                    {interest.replace("-", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {goals.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
                Goals
              </p>
              <ul className="space-y-1">
                {goals.map((goal) => (
                  <li key={goal} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
