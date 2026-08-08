"use client";

import { useCallback, useState } from "react";
import {
  Globe,
  Loader2,
  Save,
  Sparkles,
  Vote,
} from "lucide-react";
import { generateCountryBrief, type CountryBrief } from "@/lib/actions/country-brief";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function CountryBriefPanel({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const [country, setCountry] = useState("");
  const [committee, setCommittee] = useState("");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [brief, setBrief] = useState<CountryBrief | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!country.trim() || !committee.trim() || !topic.trim()) {
      toast.error("Fill in country, committee, and topic.");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateCountryBrief(country, committee, topic);
      if (result.status === "success" && result.data) {
        setBrief(result.data);
        toast.success("Country brief generated.");
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [country, committee, topic]);

  const handleSaveToWorkspace = useCallback(async () => {
    if (!brief) return;
    try {
      const { createNote } = await import("@/lib/actions/workspace");
      const content = [
        `# Country Brief: ${country}`,
        `**Committee:** ${committee}\n**Topic:** ${topic}\n`,
        `## Foreign Policy`,
        `${brief.foreignPolicy.overview}\n`,
        `**Priorities:**`,
        ...brief.foreignPolicy.priorities.map((p) => `- ${p}`),
        `\n## Key Alliances`,
        ...brief.keyAlliances.map((a) => `- **${a.group}:** ${a.role}`),
        `\n## Voting Record`,
        `**General Assembly:** ${brief.votingRecord.generalAssembly}`,
        `**Security Council:** ${brief.votingRecord.securityCouncil}`,
        `\n**Notable Votes:**`,
        ...brief.votingRecord.notableVotes.map(
          (v) => `- **${v.resolution}** — ${v.vote}\n  ${v.reasoning}`,
        ),
        `\n## Stance on ${topic}`,
        `**Position:** ${brief.stance.position}`,
        `**Nuance:** ${brief.stance.nuance}\n`,
        `## Talking Points`,
        ...brief.talkingPoints.map((t, i) => `${i + 1}. ${t}`),
      ].join("\n");

      const result = await createNote(workspaceId, {
        title: `Country Brief: ${country} — ${topic}`,
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
  }, [brief, workspaceId, country, committee, topic]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="size-4 text-muted-foreground" />
            Country Position Brief
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="cb-country">Country</Label>
              <Input
                id="cb-country"
                placeholder="e.g., India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="cb-committee">Committee</Label>
              <Input
                id="cb-committee"
                placeholder="e.g., DISEC"
                value={committee}
                onChange={(e) => setCommittee(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="cb-topic">Topic</Label>
              <Input
                id="cb-topic"
                placeholder="e.g., Nuclear non-proliferation"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleGenerate()}
            disabled={isGenerating || !country.trim() || !committee.trim() || !topic.trim()}
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Generate brief
          </Button>
        </CardContent>
      </Card>

      {brief && (
        <>
          {/* Foreign Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Foreign Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="prose prose-sm prose-neutral max-w-none dark:prose-invert">
                {brief.foreignPolicy.overview.split("\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Priorities</p>
                <ul className="space-y-1">
                  {brief.foreignPolicy.priorities.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="shrink-0 text-muted-foreground">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Key Alliances */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Key Alliances</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {brief.keyAlliances.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-border/70 p-3"
                  >
                    <Badge variant="secondary" className="mt-0.5 shrink-0 text-xs">
                      {a.group}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{a.role}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Voting Record */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Vote className="size-4 text-muted-foreground" />
                Voting Record
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs font-medium text-muted-foreground">General Assembly</p>
                  <p className="mt-1 text-sm">{brief.votingRecord.generalAssembly}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Security Council</p>
                  <p className="mt-1 text-sm">{brief.votingRecord.securityCouncil}</p>
                </div>
              </div>
              {brief.votingRecord.notableVotes.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Notable Votes
                  </p>
                  <ul className="space-y-2">
                    {brief.votingRecord.notableVotes.map((v, i) => (
                      <li key={i} className="rounded-lg border border-border/70 p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{v.resolution}</span>
                          <Badge variant="outline" className="text-xs">
                            {v.vote}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{v.reasoning}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Stance on {topic}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Position</p>
                <p className="text-sm">{brief.stance.position}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Nuance</p>
                <p className="text-sm text-muted-foreground">{brief.stance.nuance}</p>
              </div>
            </CardContent>
          </Card>

          {/* Talking Points */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Talking Points</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {brief.talkingPoints.map((point, i) => (
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
