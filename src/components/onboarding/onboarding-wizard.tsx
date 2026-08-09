"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Rocket } from "lucide-react";
import { ProgressBar } from "./progress-bar";
import { WelcomeStep } from "./welcome-step";
import { ExperienceStep } from "./experience-step";
import { InterestsStep } from "./interests-step";
import { GoalsStep } from "./goals-step";
import { CompleteStep } from "./complete-step";

const TOTAL_STEPS = 5;

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [experience, setExperience] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);

  const canNext =
    (step === 0) ||
    (step === 1 && experience !== null) ||
    (step === 2 && interests.length >= 3) ||
    step === 3 ||
    step === 4;

  const handleNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    }
  }, [step]);

  const handleBack = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  }, [step]);

  const handleSkip = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    }
  }, [step]);

  const handleComplete = useCallback(() => {
    localStorage.setItem("munos_onboarding_complete", "true");
    localStorage.setItem(
      "munos_onboarding_data",
      JSON.stringify({ experience, interests, goals })
    );
    router.push("/dashboard");
  }, [experience, interests, goals, router]);

  const toggleInterest = useCallback((id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const toggleGoal = useCallback((goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }, []);

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl space-y-8">
        <ProgressBar currentStep={step} />

        <div className="min-h-[420px] flex items-center justify-center">
          {step === 0 && <WelcomeStep />}
          {step === 1 && (
            <ExperienceStep selected={experience} onSelect={setExperience} />
          )}
          {step === 2 && (
            <InterestsStep selected={interests} onToggle={toggleInterest} />
          )}
          {step === 3 && (
            <GoalsStep selected={goals} onToggle={toggleGoal} />
          )}
          {step === 4 && (
            <CompleteStep
              experience={experience}
              interests={interests}
              goals={goals}
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-4">
          <div>
            {step > 0 && step < 4 && (
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step > 0 && step < 4 && (
              <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
                Skip
              </Button>
            )}
            {step < 4 ? (
              <Button onClick={handleNext} disabled={!canNext}>
                {step === 0 ? (
                  <>
                    Get Started
                    <Rocket className="h-4 w-4 ml-1.5" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleComplete} size="lg">
                Start Using MUNOS
                <Rocket className="h-4 w-4 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
