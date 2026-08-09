"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Target,
  Trophy,
} from "lucide-react";

interface Insight {
  type: "strength" | "improvement" | "goal" | "comparison";
  title: string;
  description: string;
  value?: string;
}

function getInsightIcon(type: Insight["type"]) {
  switch (type) {
    case "strength":
      return <TrendingUp className="size-4 text-emerald-500" />;
    case "improvement":
      return <TrendingDown className="size-4 text-amber-500" />;
    case "goal":
      return <Target className="size-4 text-blue-500" />;
    case "comparison":
      return <Trophy className="size-4 text-violet-500" />;
  }
}

function getInsightBadge(type: Insight["type"]) {
  switch (type) {
    case "strength":
      return (
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
          Strength
        </Badge>
      );
    case "improvement":
      return (
        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
          Needs Work
        </Badge>
      );
    case "goal":
      return (
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
          Goal
        </Badge>
      );
    case "comparison":
      return (
        <Badge variant="secondary" className="bg-violet-500/10 text-violet-600">
          Benchmark
        </Badge>
      );
  }
}

function generateInsights(data: {
  scores: number[];
  committees: { name: string; count: number }[];
  conferences: number;
  avgScore: number;
}): Insight[] {
  const insights: Insight[] = [];
  const { scores, committees, conferences, avgScore } = data;

  if (scores.length === 0 && conferences === 0) {
    return [
      {
        type: "goal",
        title: "Get Started",
        description:
          "Attend your first conference or run a simulation to begin tracking your performance.",
      },
    ];
  }

  // Strengths
  if (avgScore >= 80) {
    insights.push({
      type: "strength",
      title: "Strong Overall Performance",
      description: `Your average score of ${avgScore} places you in the top tier of delegates.`,
      value: `${avgScore}/100`,
    });
  }

  if (scores.length >= 3) {
    const recent = scores.slice(-3);
    const earlier = scores.slice(0, Math.max(scores.length - 3, 1));
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

    if (recentAvg > earlierAvg + 5) {
      insights.push({
        type: "strength",
        title: "Improving Trend",
        description: `Your recent scores are trending upward — you've improved by ${Math.round(recentAvg - earlierAvg)} points on average.`,
      });
    } else if (recentAvg < earlierAvg - 5) {
      insights.push({
        type: "improvement",
        title: "Score Dip Detected",
        description: `Your recent scores have dipped by ${Math.round(earlierAvg - recentAvg)} points. Consider reviewing your preparation approach.`,
      });
    } else {
      insights.push({
        type: "strength",
        title: "Consistent Performance",
        description: "Your scores have been steady — you're maintaining a reliable performance level.",
      });
    }
  }

  // Committee diversity
  if (committees.length >= 3) {
    insights.push({
      type: "strength",
      title: "Diverse Committee Experience",
      description: `You've participated in ${committees.length} different committees, showing strong versatility.`,
    });
  } else if (committees.length >= 1) {
    insights.push({
      type: "improvement",
      title: "Try New Committees",
      description:
        "Branching into different committee types (ECOSOC, Security Council, etc.) will broaden your skills.",
    });
  }

  // Conference count
  if (conferences >= 5) {
    insights.push({
      type: "strength",
      title: "Experienced Delegate",
      description: `With ${conferences} conferences attended, you have solid field experience.`,
    });
  } else if (conferences >= 1) {
    insights.push({
      type: "comparison",
      title: "Building Experience",
      description: `You've attended ${conferences} conference(s). Top delegates typically attend 5+ per year.`,
      value: `${conferences} attended`,
    });
  }

  // Goals
  if (avgScore > 0 && avgScore < 75) {
    insights.push({
      type: "goal",
      title: "Target: 75+ Average",
      description:
        "Focus on structured debate preparation and speech practice to reach a 75+ average.",
      value: `Current: ${avgScore}`,
    });
  } else if (avgScore >= 75 && avgScore < 90) {
    insights.push({
      type: "goal",
      title: "Target: 90+ Average",
      description:
        "You're performing well. To reach 90+, focus on advanced negotiation tactics and resolution drafting.",
      value: `Current: ${avgScore}`,
    });
  } else if (avgScore >= 90) {
    insights.push({
      type: "goal",
      title: "Elite Performance",
      description:
        "You're in the top percentile. Maintain consistency and mentor newer delegates.",
      value: `${avgScore}/100`,
    });
  }

  // Generic improvement tips
  if (scores.length > 0 && avgScore < 80) {
    insights.push({
      type: "improvement",
      title: "Speech Delivery",
      description:
        "Practice formal debate speeches with a timer. Aim for 60-90 second structured interventions.",
    });
  }

  if (committees.length > 0) {
    const mostFrequent = committees[0];
    if (mostFrequent && mostFrequent.count >= 3) {
      insights.push({
        type: "comparison",
        title: "Committee Specialization",
        description: `You favor ${mostFrequent.name} (${mostFrequent.count} times). Consider diversifying to build a well-rounded profile.`,
      });
    }
  }

  return insights.slice(0, 6);
}

export function InsightsPanel({
  scores,
  committees,
  conferences,
  avgScore,
}: {
  scores: number[];
  committees: { name: string; count: number }[];
  conferences: number;
  avgScore: number;
}) {
  const insights = generateInsights({
    scores,
    committees,
    conferences,
    avgScore,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="size-4 text-amber-500" />
          <CardTitle>Insights & Recommendations</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Not enough data to generate insights yet.
          </p>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-lg border border-border/60 px-4 py-3"
              >
                <div className="mt-0.5 shrink-0">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{insight.title}</p>
                    {getInsightBadge(insight.type)}
                    {insight.value && (
                      <span className="ml-auto text-xs font-medium tabular-nums text-muted-foreground">
                        {insight.value}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
