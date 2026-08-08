"use client";

import { useState, useTransition } from "react";
import {
  Search,
  Sparkles,
  FileText,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  BookOpen,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  generateResearchBrief,
  type ResearchBrief,
} from "@/lib/actions/research";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [country, setCountry] = useState("");
  const [committee, setCommittee] = useState("");
  const [brief, setBrief] = useState<ResearchBrief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim() || !country.trim() || !committee.trim()) return;

    setError(null);
    setBrief(null);
    startTransition(async () => {
      const result = await generateResearchBrief(
        topic.trim(),
        country.trim(),
        committee.trim(),
      );
      if (result.status === "success") {
        setBrief(result.data);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Research Assistant</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter a topic, your assigned country, and committee to generate an
          AI-powered research brief with arguments, resolutions, and talking points.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="topic">
              Topic
            </label>
            <Input
              id="topic"
              placeholder="e.g., Climate change mitigation"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="country">
              Country
            </label>
            <Input
              id="country"
              placeholder="e.g., Germany"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="committee">
              Committee
            </label>
            <Input
              id="committee"
              placeholder="e.g., General Assembly"
              value={committee}
              onChange={(e) => setCommittee(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" disabled={isPending || !topic.trim() || !country.trim() || !committee.trim()}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {isPending ? "Generating..." : "Generate research brief"}
        </Button>
      </form>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="items-center">
            <div className="mb-2 grid size-10 place-items-center rounded-xl bg-destructive/10 text-destructive">
              <AlertCircle className="size-5" />
            </div>
            <CardTitle className="text-base">Generation failed</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {isPending && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {brief && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-4" />
                Topic Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {brief.overview}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <ThumbsUp className="size-4" />
                  Arguments For
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {brief.keyArgumentsFor.map((arg, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-sm font-medium">{arg.point}</p>
                    <p className="text-xs text-muted-foreground">{arg.explanation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <ThumbsDown className="size-4" />
                  Arguments Against
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {brief.keyArgumentsAgainst.map((arg, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-sm font-medium">{arg.point}</p>
                    <p className="text-xs text-muted-foreground">{arg.explanation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="size-4" />
                Talking Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {brief.talkingPoints.map((point, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <Badge variant="outline" className="mt-0.5 shrink-0">
                      {i + 1}
                    </Badge>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {brief.relevantResolutions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-4" />
                  Relevant Resolutions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {brief.relevantResolutions.map((res, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {res.symbol}
                      </Badge>
                      <span className="text-sm font-medium">{res.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{res.relevance}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {brief.bibliography.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-4" />
                  Bibliography
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {brief.bibliography.map((ref, i) => (
                  <div key={i} className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{ref.title}</span>
                    {" — "}
                    <span>{ref.source}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!brief && !isPending && !error && (
        <Card className="flex min-h-64 flex-col items-center justify-center border-dashed text-center">
          <CardHeader className="items-center">
            <div className="mb-3 grid size-12 place-items-center rounded-2xl border border-brand-500/25 bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Search className="size-6" />
            </div>
            <CardTitle className="text-lg">Enter a topic to begin</CardTitle>
            <CardDescription className="mx-auto max-w-sm">
              Fill in the topic, country, and committee above, then click
              &ldquo;Generate research brief&rdquo; to get started.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
