"use client";

import { useState } from "react";
import { Loader2, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateResearchDossier } from "@/lib/actions/research-dossier";
import type { ResearchDossier } from "@/lib/actions/research-dossier-types";

const PAGES = [
  { id: "executive", label: "Executive Brief", icon: "📋" },
  { id: "country", label: "Country Position", icon: "🏳️" },
  { id: "agenda", label: "Agenda Deep Dive", icon: "🔍" },
  { id: "countries", label: "Other Countries", icon: "🌍" },
  { id: "un", label: "UN Framework", icon: "🏛️" },
  { id: "mun", label: "MUN Application", icon: "📝" },
  { id: "attack", label: "Attack Material", icon: "⚔️" },
  { id: "sources", label: "Sources", icon: "📚" },
];

export function ResearchAgent() {
  const [country, setCountry] = useState("");
  const [committee, setCommittee] = useState("");
  const [agenda, setAgenda] = useState("");
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<ResearchDossier | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!country || !committee || !agenda) return;
    setLoading(true);
    setError(null);

    const result = await generateResearchDossier(agenda, country, committee);
    if (result.status === "success") {
      setDossier(result.data);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handlePrepareMe = () => {
    // TODO: Send dossier context to AI Assistant
    window.location.href = `/assistant`;
  };

  return (
    <div className="space-y-6">
      {/* Input form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Research Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              placeholder="Country (e.g., Syria)"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
            <Input
              placeholder="Committee (e.g., UNGA)"
              value={committee}
              onChange={(e) => setCommittee(e.target.value)}
            />
            <Input
              placeholder="Agenda (e.g., Ocean Governance)"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={!country || !committee || !agenda || loading}
            className="mt-3"
          >
            {loading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <FileText className="mr-2 size-4" />
            )}
            Generate 8-Page Dossier
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Dossier */}
      {dossier && (
        <>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              8 pages · Sourced · Tiered credibility
            </Badge>
            <Button size="sm" onClick={handlePrepareMe}>
              Prepare Me for Debate
              <ArrowRight className="ml-2 size-3" />
            </Button>
          </div>

          <Tabs defaultValue="executive" className="space-y-4">
            <TabsList className="flex-wrap h-auto gap-1">
              {PAGES.map((page) => (
                <TabsTrigger key={page.id} value={page.id} className="text-xs">
                  {page.icon} {page.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Page 1 — Executive Brief */}
            <TabsContent value="executive">
              <Card>
                <CardHeader>
                  <CardTitle>Page 1 — Executive Brief</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold">What is happening?</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{dossier.executiveBrief.whatIsHappening}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Why does it matter?</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{dossier.executiveBrief.whyItMatters}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">What does the UN say?</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{dossier.executiveBrief.whatDoesUnSay}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Current situation</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{dossier.executiveBrief.currentSituation}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Page 2 — Country Position */}
            <TabsContent value="country">
              <Card>
                <CardHeader>
                  <CardTitle>Page 2 — Country Position: {country}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold">Official Position</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{dossier.countryPosition.officialPosition}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Relevant Policies</h4>
                    <ul className="mt-1 space-y-1">
                      {dossier.countryPosition.relevantPolicies.map((p, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Voting Behavior</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{dossier.countryPosition.votingBehavior}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Alliances</h4>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {dossier.countryPosition.alliances.map((a, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Regional Interests</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{dossier.countryPosition.regionalInterests}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Page 3 — Agenda Deep Dive */}
            <TabsContent value="agenda">
              <Card>
                <CardHeader>
                  <CardTitle>Page 3 — Agenda Deep Dive</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold">Key Issues</h4>
                    <ul className="mt-1 space-y-1">
                      {dossier.agendaDeepDive.keyIssues.map((issue, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {issue}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Major Disputes</h4>
                    <ul className="mt-1 space-y-1">
                      {dossier.agendaDeepDive.majorDisputes.map((d, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {d}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Terminology</h4>
                    <div className="mt-1 space-y-2">
                      {dossier.agendaDeepDive.importantTerminology.map((t, i) => (
                        <div key={i}>
                          <span className="text-sm font-medium">{t.term}</span>
                          <span className="text-sm text-muted-foreground"> — {t.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Page 4 — Other Countries */}
            <TabsContent value="countries">
              <Card>
                <CardHeader>
                  <CardTitle>Page 4 — Other Countries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {dossier.otherCountries.map((c, i) => (
                      <div key={i} className="rounded-lg border p-4 space-y-2">
                        <h4 className="font-semibold">{c.country}</h4>
                        <p className="text-sm text-muted-foreground">{c.position}</p>
                        <div>
                          <span className="text-xs font-medium">Allies: </span>
                          {c.allies.map((a, j) => (
                            <Badge key={j} variant="secondary" className="mr-1 text-xs">{a}</Badge>
                          ))}
                        </div>
                        <div>
                          <span className="text-xs font-medium">Vulnerabilities: </span>
                          {c.vulnerabilities.map((v, j) => (
                            <span key={j} className="text-xs text-red-500">{v}{j < c.vulnerabilities.length - 1 ? ", " : ""}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Page 5 — UN Framework */}
            <TabsContent value="un">
              <Card>
                <CardHeader>
                  <CardTitle>Page 5 — UN/International Framework</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold">Relevant Resolutions</h4>
                    <div className="mt-1 space-y-2">
                      {dossier.unFramework.resolutions.map((r, i) => (
                        <div key={i} className="rounded border p-2">
                          <span className="text-sm font-mono font-medium">{r.symbol}</span>
                          <span className="text-sm text-muted-foreground"> — {r.title}</span>
                          <p className="text-xs text-muted-foreground mt-1">{r.relevance}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Relevant Agencies</h4>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {dossier.unFramework.agencies.map((a, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{a}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Page 6 — MUN Application */}
            <TabsContent value="mun">
              <Card>
                <CardHeader>
                  <CardTitle>Page 6 — MUN Application</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold">Realistic Proposals</h4>
                    <ul className="mt-1 space-y-1">
                      {dossier.munApplication.realisticProposals.map((p, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Draft Clauses</h4>
                    <ul className="mt-1 space-y-1">
                      {dossier.munApplication.clauses.map((c, i) => (
                        <li key={i} className="text-sm text-muted-foreground font-mono">• {c}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Funding Mechanisms</h4>
                    <ul className="mt-1 space-y-1">
                      {dossier.munApplication.fundingMechanisms.map((f, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {f}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Page 7 — Attack Material */}
            <TabsContent value="attack">
              <Card>
                <CardHeader>
                  <CardTitle>Page 7 — Attack Material</CardTitle>
                  <p className="text-xs text-muted-foreground">Diplomatic ammunition — factual contradictions, not personal attacks.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold">Contradictions</h4>
                    <ul className="mt-1 space-y-1">
                      {dossier.attackMaterial.contradictions.map((c, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {c}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Voting Inconsistencies</h4>
                    <ul className="mt-1 space-y-1">
                      {dossier.attackMaterial.votingInconsistencies.map((v, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {v}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Relevant Statistics</h4>
                    <ul className="mt-1 space-y-1">
                      {dossier.attackMaterial.relevantStatistics.map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Page 8 — Sources */}
            <TabsContent value="sources">
              <Card>
                <CardHeader>
                  <CardTitle>Page 8 — Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dossier.sources.map((s) => (
                      <div key={s.id} className="flex items-start gap-3 rounded border p-2">
                        <span className="text-xs font-mono text-muted-foreground">[{s.id}]</span>
                        <div className="flex-1 min-w-0">
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium hover:underline"
                          >
                            {s.title}
                          </a>
                          <p className="text-xs text-muted-foreground truncate">{s.url}</p>
                        </div>
                        <Badge
                          variant={s.tier === 1 ? "default" : s.tier === 2 ? "secondary" : "outline"}
                          className="text-[10px]"
                        >
                          Tier {s.tier}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{s.credibility}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
