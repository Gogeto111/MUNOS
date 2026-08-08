"use client";

import { useCallback, useState } from "react";
import {
  BookOpen,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import { generateResearchPack, type ResearchPack } from "@/lib/actions/research-pack";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function ResearchPackGenerator({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const [committee, setCommittee] = useState("");
  const [topic, setTopic] = useState("");
  const [country, setCountry] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pack, setPack] = useState<ResearchPack | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!committee.trim() || !topic.trim() || !country.trim()) {
      toast.error("Fill in committee, topic, and country.");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateResearchPack(committee, topic, country);
      if (result.status === "success" && result.data) {
        setPack(result.data);
        toast.success("Research pack generated.");
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [committee, topic, country]);

  const handleSaveToWorkspace = useCallback(async () => {
    if (!pack) return;
    try {
      const { createNote } = await import("@/lib/actions/workspace");
      const content = [
        `# Research Pack: ${country} — ${committee}`,
        `**Topic:** ${topic}\n`,
        `## Background\n${pack.background}\n`,
        `## Key Issues`,
        ...pack.keyIssues.map((item) => `- **${item.issue}:** ${item.detail}`),
        `\n## ${country}'s Position`,
        `**Stance:** ${pack.countryPosition.stance}`,
        `**History:** ${pack.countryPosition.history}`,
        `**Alliances:** ${pack.countryPosition.alliances}\n`,
        `## Relevant Resolutions`,
        ...pack.relevantResolutions.map(
          (r) => `- **${r.symbol}** — ${r.title}\n  ${r.relevance}`,
        ),
        `\n## Speaking Points`,
        ...pack.speakingPoints.map((p, i) => `${i + 1}. ${p}`),
        `\n## Bibliography`,
        ...pack.bibliography.map((b) => `- ${b.title} — ${b.source}`),
      ].join("\n");

      const result = await createNote(workspaceId, {
        title: `Research Pack: ${country} — ${topic}`,
        content,
      });
      if (result.status === "success") {
        toast.success("Saved to workspace library.");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to save.");
    }
  }, [pack, workspaceId, committee, topic, country]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="size-4 text-muted-foreground" />
            Research Pack Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="rp-committee">Committee</Label>
              <Input
                id="rp-committee"
                placeholder="e.g., UNHCR"
                value={committee}
                onChange={(e) => setCommittee(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="rp-topic">Topic</Label>
              <Input
                id="rp-topic"
                placeholder="e.g., Refugee crisis in Southeast Asia"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="rp-country">Country</Label>
              <Input
                id="rp-country"
                placeholder="e.g., Germany"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleGenerate()}
            disabled={isGenerating || !committee.trim() || !topic.trim() || !country.trim()}
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Generate research pack
          </Button>
        </CardContent>
      </Card>

      {pack && (
        <>
          {/* Background */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Background</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm prose-neutral max-w-none dark:prose-invert">
                {pack.background.split("\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Key Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {pack.keyIssues.map((item, i) => (
                  <li key={i} className="rounded-lg border border-border/70 p-3">
                    <p className="text-sm font-medium">{item.issue}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Country Position */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                {country}&apos;s Position
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Stance</p>
                <p className="text-sm">{pack.countryPosition.stance}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Voting History</p>
                <p className="text-sm">{pack.countryPosition.history}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Alliances</p>
                <p className="text-sm">{pack.countryPosition.alliances}</p>
              </div>
            </CardContent>
          </Card>

          {/* Relevant Resolutions */}
          {pack.relevantResolutions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  Relevant Resolutions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pack.relevantResolutions.map((r, i) => (
                    <li key={i} className="rounded-lg border border-border/70 p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs font-mono">
                          {r.symbol}
                        </Badge>
                        <span className="text-sm font-medium">{r.title}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{r.relevance}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Speaking Points */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Speaking Points</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {pack.speakingPoints.map((point, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="shrink-0 font-medium tabular-nums text-muted-foreground">
                      {i + 1}.
                    </span>
                    {point}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Bibliography */}
          {pack.bibliography.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Bibliography</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {pack.bibliography.map((b, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium">{b.title}</span>
                      <span className="text-muted-foreground"> — {b.source}</span>
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
            onClick={() => void handleSaveToWorkspace()}
          >
            <Save className="size-4" />
            Save to workspace
          </Button>
        </>
      )}
    </div>
  );
}
