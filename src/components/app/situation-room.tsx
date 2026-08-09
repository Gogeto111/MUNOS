"use client";

import { useState } from "react";
import { Loader2, Radio, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateSituationAnalysis } from "@/lib/actions/situation-room";

interface SituationUpdate {
  type: "breaking" | "talking_point" | "poi" | "resolution_implication";
  title: string;
  content: string;
  whyItMatters: string;
  source?: string;
}

export function SituationRoom() {
  const [country, setCountry] = useState("");
  const [committee, setCommittee] = useState("");
  const [agenda, setAgenda] = useState("");
  const [loading, setLoading] = useState(false);
  const [updates, setUpdates] = useState<SituationUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!country || !committee || !agenda) return;
    setLoading(true);
    setError(null);

    try {
      const result = await generateSituationAnalysis(country, committee, agenda);
      if (result.status === "error") {
        setError(result.message);
      } else {
        setUpdates([{
          type: "breaking",
          title: "Situation Analysis",
          content: result.data,
          whyItMatters: `This analysis is tailored for ${country} in ${committee} on ${agenda}`,
          source: "AI Analysis",
        }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate analysis");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Radio className="size-4 text-red-500" />
            Committee Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input placeholder="Your country" value={country} onChange={(e) => setCountry(e.target.value)} />
            <Input placeholder="Committee" value={committee} onChange={(e) => setCommittee(e.target.value)} />
            <Input placeholder="Agenda topic" value={agenda} onChange={(e) => setAgenda(e.target.value)} />
          </div>
          <Button onClick={handleAnalyze} disabled={!country || !committee || !agenda || loading} className="mt-3">
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Radio className="mr-2 size-4" />}
            Analyze Situation
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600">{error}</div>
      )}

      {updates.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Live Feed</h3>
          {updates.map((update, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {update.type === "breaking" && <AlertTriangle className="size-4 text-red-500" />}
                    {update.type === "talking_point" && <Lightbulb className="size-4 text-yellow-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {update.type.replace("_", " ")}
                      </Badge>
                      {update.source && <span className="text-[10px] text-muted-foreground">{update.source}</span>}
                    </div>
                    <h4 className="mt-1 font-semibold">{update.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{update.content}</p>
                    <div className="mt-3 rounded-lg bg-brand-500/5 p-3">
                      <p className="text-xs font-medium text-brand-600 dark:text-brand-400">
                        Why this matters to {country}:
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{update.whyItMatters}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
