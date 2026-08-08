"use client";

import { useCallback, useState } from "react";
import {
  FileText,
  Loader2,
  Sparkles,
  Trophy,
  Star,
  Lightbulb,
  Clock,
} from "lucide-react";
import { generateDebateSummary, type DebateSummary } from "@/lib/actions/debate-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DebateSummaryPanel({
  simulationId,
  committeeName,
}: {
  simulationId: string;
  committeeName: string;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<DebateSummary | null>(null);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const result = await generateDebateSummary(simulationId);
      if (result.status === "success" && result.data) {
        setSummary(result.data);
        toast.success("Debate summary generated.");
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [simulationId]);

  return (
    <div className="space-y-6">
      {!summary ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4 text-muted-foreground" />
              Debate Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Generate an AI-powered summary of the {committeeName} debate session,
              including key moments, notable arguments, and improvement suggestions.
            </p>
            <Button
              type="button"
              size="sm"
              onClick={() => void handleGenerate()}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Generate summary
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4 text-muted-foreground" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm prose-neutral max-w-none dark:prose-invert">
                {summary.overview.split("\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Moments */}
          {summary.keyMoments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="size-4 text-muted-foreground" />
                  Key Moments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-4 pl-6">
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
                  {summary.keyMoments.map((moment, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-4 top-1 size-2 rounded-full bg-primary" />
                      <p className="text-sm">{moment.description}</p>
                      {(moment.delegate || moment.timestamp) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {moment.delegate}
                          {moment.timestamp ? ` · ${moment.timestamp}` : ""}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notable Arguments */}
          {summary.notableArguments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Star className="size-4 text-muted-foreground" />
                  Notable Arguments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {summary.notableArguments.map((arg, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-border/70 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {arg.country}
                        </Badge>
                        <span className="text-sm font-medium">{arg.delegate}</span>
                      </div>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        {arg.argument}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Winner Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="size-4 text-amber-500" />
                Awards Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-sm font-medium">Best Delegate</p>
                <p className="mt-1 text-lg font-semibold">
                  {summary.winnerAnalysis.bestDelegate}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {summary.winnerAnalysis.reasoning}
                </p>
              </div>
              {summary.winnerAnalysis.runnersUp.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Runners-up
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {summary.winnerAnalysis.runnersUp.map((name, i) => (
                      <Badge key={i} variant="outline">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Improvement Suggestions */}
          {summary.improvementSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="size-4 text-muted-foreground" />
                  Improvement Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {summary.improvementSuggestions.map((suggestion, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="shrink-0 text-muted-foreground">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleGenerate()}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Regenerate
          </Button>
        </>
      )}
    </div>
  );
}
