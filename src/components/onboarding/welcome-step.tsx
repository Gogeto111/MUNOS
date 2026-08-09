"use client";

import { Search, Brain, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Search,
    title: "Research",
    description:
      "Deep-dive intelligence on any country, topic, or committee with AI-powered research agents.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Brain,
    title: "AI Assistant",
    description:
      "Real-time coaching, speech generation, and resolution drafting — your personal MUN advisor.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Trophy,
    title: "Conferences",
    description:
      "Discover, track, and manage your entire Model UN journey from discovery to portfolio.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
];

export function WelcomeStep() {
  return (
    <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Welcome to{" "}
          <span className="text-gradient">MUNOS</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Your Model UN Operating System
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 w-full max-w-2xl">
        {features.map((feature, idx) => (
          <Card
            key={feature.title}
            className="text-left animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${150 + idx * 100}ms` }}
          >
            <CardContent className="pt-6 space-y-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${feature.bg}`}>
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
