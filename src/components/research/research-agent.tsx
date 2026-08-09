"use client";

import { useState, useMemo } from "react";
import { Loader2, FileText, ArrowRight, Copy, Check, Download, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateResearchDossier } from "@/lib/actions/research-dossier";
import type { ResearchDossier } from "@/lib/actions/research-dossier-types";

const SECTIONS = [
  { id: "executive", label: "Executive Brief", icon: "📋" },
  { id: "agenda", label: "Agenda Deep Dive", icon: "🔍" },
  { id: "country", label: "Country Position", icon: "🏳️" },
  { id: "interests", label: "Country Interests", icon: "🎯" },
  { id: "landscape", label: "International Landscape", icon: "🌍" },
  { id: "un", label: "UN Framework", icon: "🏛️" },
  { id: "current", label: "Current Affairs", icon: "📰" },
  { id: "evidence", label: "Key Evidence", icon: "📊" },
  { id: "attack", label: "Diplomatic Ammunition", icon: "⚔️" },
  { id: "poi", label: "POI Bank", icon: "💬" },
  { id: "defense", label: "Defense Bank", icon: "🛡️" },
  { id: "policy", label: "Policy Options", icon: "📋" },
  { id: "resolution", label: "Resolution Material", icon: "📜" },
  { id: "gsl", label: "GSL Material", icon: "🎤" },
  { id: "takeaways", label: "Key Takeaways", icon: "✅" },
  { id: "sources", label: "Sources", icon: "📚" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase text-muted-foreground">{label}</h4>
      <div className="mt-1 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-muted-foreground">• {item}</li>
      ))}
    </ul>
  );
}

export function ResearchAgent() {
  const [country, setCountry] = useState("");
  const [committee, setCommittee] = useState("");
  const [agenda, setAgenda] = useState("");
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<ResearchDossier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");

  const searchableText = useMemo(() => {
    if (!dossier) return "";
    const parts: string[] = [];
    const add = (v: unknown) => { if (typeof v === "string") parts.push(v); else if (Array.isArray(v)) v.forEach(add); else if (v && typeof v === "object") Object.values(v).forEach(add); };
    add(dossier);
    return parts.join(" ").toLowerCase();
  }, [dossier]);

  const sectionMatches = useMemo(() => {
    if (!search.trim() || !dossier) return null;
    const q = search.toLowerCase();
    const match = (text: string) => text.toLowerCase().includes(q);
    const m: Record<string, boolean> = {};
    m.executive = match(dossier.executiveBrief.whatIsHappening) || match(dossier.executiveBrief.whyItMatters);
    m.agenda = match(dossier.agendaDeepDive.historicalBackground) || match(dossier.agendaDeepDive.currentSituation);
    m.country = match(dossier.countryPosition.officialPosition);
    m.interests = dossier.countryInterests.whatDoesCountryWant.some(match);
    m.landscape = dossier.internationalLandscape.allies.some((a) => match(a.why));
    m.un = dossier.unFramework.charterProvisions.some(match);
    m.current = dossier.currentAffairs.some((c) => match(c.whatHappened));
    m.evidence = dossier.evidence.some((e) => match(e.content));
    m.attack = dossier.diplomaticAmmunition.contradictions.some(match);
    m.poi = dossier.poiBank.some((p) => match(p.text));
    m.defense = dossier.defenseBank.some((d) => match(d.bestResponse));
    m.policy = dossier.policyOptions.some((p) => match(p.proposal));
    m.resolution = dossier.resolutionMaterial.operativeClauses.some(match);
    m.gsl = match(dossier.gslMaterial.strongestOpeningHook);
    m.takeaways = dossier.takeaways.some(match);
    m.sources = dossier.sources.some((s) => match(s.title));
    return m;
  }, [search, dossier]);

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
    if (!dossier?.assistantContext) return;
    const params = new URLSearchParams({
      country,
      committee,
      agenda,
      context: dossier.assistantContext,
    });
    window.location.href = `/assistant?${params.toString()}`;
  };

  const copyAssistantContext = async () => {
    if (!dossier?.assistantContext) return;
    await navigator.clipboard.writeText(dossier.assistantContext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportMarkdown = () => {
    if (!dossier) return;
    const lines: string[] = [];
    const h1 = (t: string) => lines.push(`# ${t}\n`);
    const h2 = (t: string) => lines.push(`## ${t}\n`);
    const h3 = (t: string) => lines.push(`### ${t}\n`);
    const p = (t: string) => lines.push(`${t}\n`);
    const li = (t: string) => lines.push(`- ${t}`);
    const nl = () => lines.push("");

    h1(`Research Dossier — ${country} · ${committee}`);
    p(`*Agenda: ${agenda}*\n`);

    h2("Executive Brief");
    p(`**What is happening:** ${dossier.executiveBrief.whatIsHappening}`);
    p(`**Why it matters:** ${dossier.executiveBrief.whyItMatters}`);
    p(`**Current situation:** ${dossier.executiveBrief.currentSituation}`);
    p(`**Why the committee should care:** ${dossier.executiveBrief.whyCommitteeShouldCare}`);
    nl();

    h2("Agenda Deep Dive");
    p(`**Historical background:** ${dossier.agendaDeepDive.historicalBackground}`);
    p(`**Current situation:** ${dossier.agendaDeepDive.currentSituation}`);
    h3("Major Causes");
    dossier.agendaDeepDive.majorCauses.forEach(li);
    h3("Major Consequences");
    dossier.agendaDeepDive.majorConsequences.forEach(li);
    h3("Important Actors");
    dossier.agendaDeepDive.importantActors.forEach(li);
    h3("Major Disputes");
    dossier.agendaDeepDive.majorDisputes.forEach(li);
    h3("Key Terminology");
    dossier.agendaDeepDive.keyTerminology.forEach((t) => li(`**${t.term}:** ${t.definition}`));
    nl();

    h2("Country Position");
    p(`**Official position:** ${dossier.countryPosition.officialPosition}`);
    h3("Relevant Policies");
    dossier.countryPosition.relevantPolicies.forEach(li);
    h3("Voting Record");
    dossier.countryPosition.votingRecord.forEach(li);
    p(`**Economic interests:** ${dossier.countryPosition.economicInterests}`);
    p(`**Security interests:** ${dossier.countryPosition.securityInterests}`);
    p(`**Political interests:** ${dossier.countryPosition.politicalInterests}`);
    nl();

    h2("Country Interests");
    h3("Wants");
    dossier.countryInterests.whatDoesCountryWant.forEach(li);
    h3("Needs to Avoid");
    dossier.countryInterests.whatDoesCountryNeedToAvoid.forEach(li);
    nl();

    h2("International Landscape");
    h3("Allies");
    dossier.internationalLandscape.allies.forEach((a) => li(`**${a.country}:** ${a.why}`));
    h3("Opposing States");
    dossier.internationalLandscape.opposingStates.forEach((o) => li(`**${o.country}:** ${o.why}`));
    nl();

    h2("UN Framework");
    h3("Charter Provisions");
    dossier.unFramework.charterProvisions.forEach(li);
    h3("Resolutions");
    dossier.unFramework.resolutions.forEach((r) => li(`**${r.symbol} — ${r.title}:** ${r.relevance}`));
    nl();

    h2("Current Affairs");
    dossier.currentAffairs.forEach((c) => {
      p(`- **${c.when}:** ${c.whatHappened} — ${c.whyItMatters} *(Source: ${c.source})*`);
    });
    nl();

    h2("Evidence & Data");
    dossier.evidence.forEach((e) => li(`*[${e.type}]* ${e.content} *(Source: ${e.source})*`));
    nl();

    h2("Diplomatic Ammunition");
    h3("Contradictions");
    dossier.diplomaticAmmunition.contradictions.forEach(li);
    h3("Voting Contradictions");
    dossier.diplomaticAmmunition.votingContradictions.forEach(li);
    nl();

    h2("POI Bank");
    dossier.poiBank.forEach((poi) => li(`*[${poi.type} vs ${poi.targetCountry}]* ${poi.text} — _${poi.rationale}_`));
    nl();

    h2("Defense Bank");
    dossier.defenseBank.forEach((d) => li(`**Attack:** ${d.expectedAttack} → **Response:** ${d.bestResponse}`));
    nl();

    h2("Resolution Clauses");
    h3("Preambulatory");
    dossier.resolutionMaterial.preambulatoryClauses.forEach(li);
    h3("Operative");
    dossier.resolutionMaterial.operativeClauses.forEach(li);
    nl();

    h2("Key Takeaways");
    dossier.takeaways.forEach(li);
    nl();

    h2("Sources");
    dossier.sources.forEach((s) => li(`[${s.title}](${s.url}) — ${s.organization} — Tier ${s.tier}`));

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dossier-${country.toLowerCase().replace(/\s+/g, "-")}-${committee.toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
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
            {loading ? "Researching..." : "Generate Research Dossier"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {dossier && (
        <>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              16 sections · Sourced · Tiered credibility
            </Badge>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyAssistantContext}>
                {copied ? <Check className="mr-1 size-3" /> : <Copy className="mr-1 size-3" />}
                {copied ? "Copied" : "Copy Context"}
              </Button>
              <Button size="sm" variant="outline" onClick={exportMarkdown}>
                <Download className="mr-1 size-3" />
                Export .md
              </Button>
              <Button size="sm" onClick={handlePrepareMe}>
                Prepare Me for Debate
                <ArrowRight className="ml-2 size-3" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="executive" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search dossier..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="size-3" />
                  </button>
                )}
              </div>
              {search && sectionMatches && (
                <span className="text-[10px] text-muted-foreground">
                  {Object.values(sectionMatches).filter(Boolean).length}/{SECTIONS.length} sections match
                </span>
              )}
            </div>
            <TabsList className="flex-wrap h-auto gap-1">
              {SECTIONS.map((s) => {
                const hidden = sectionMatches && !sectionMatches[s.id];
                return (
                  <TabsTrigger key={s.id} value={s.id} className={`text-xs ${hidden ? "opacity-30" : ""}`}>
                    {s.icon} {s.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="executive">
              <Section title="Executive Brief">
                <Field label="What is happening?">{dossier.executiveBrief.whatIsHappening}</Field>
                <Field label="Why does it matter?">{dossier.executiveBrief.whyItMatters}</Field>
                <Field label="Current situation">{dossier.executiveBrief.currentSituation}</Field>
                <Field label="Why the committee should care">{dossier.executiveBrief.whyCommitteeShouldCare}</Field>
              </Section>
            </TabsContent>

            <TabsContent value="agenda">
              <Section title="Agenda Deep Dive">
                <Field label="Historical Background">{dossier.agendaDeepDive.historicalBackground}</Field>
                <Field label="Current Situation">{dossier.agendaDeepDive.currentSituation}</Field>
                <Field label="Major Causes"><List items={dossier.agendaDeepDive.majorCauses} /></Field>
                <Field label="Major Consequences"><List items={dossier.agendaDeepDive.majorConsequences} /></Field>
                <Field label="Important Actors"><List items={dossier.agendaDeepDive.importantActors} /></Field>
                <Field label="Major Disputes"><List items={dossier.agendaDeepDive.majorDisputes} /></Field>
                <Field label="Key Terminology">
                  <div className="space-y-1">
                    {dossier.agendaDeepDive.keyTerminology.map((t, i) => (
                      <div key={i}>
                        <span className="font-medium">{t.term}</span> — {t.definition}
                      </div>
                    ))}
                  </div>
                </Field>
              </Section>
            </TabsContent>

            <TabsContent value="country">
              <Section title={`Country Position: ${country}`}>
                <Field label="Official Position">{dossier.countryPosition.officialPosition}</Field>
                <Field label="Relevant Policies"><List items={dossier.countryPosition.relevantPolicies} /></Field>
                <Field label="Historical Involvement"><List items={dossier.countryPosition.historicalInvolvement} /></Field>
                <Field label="Treaties">
                  <div className="flex flex-wrap gap-1">
                    {dossier.countryPosition.treaties.map((t, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </Field>
                <Field label="Voting Record"><List items={dossier.countryPosition.votingRecord} /></Field>
                <Field label="Economic Interests">{dossier.countryPosition.economicInterests}</Field>
                <Field label="Security Interests">{dossier.countryPosition.securityInterests}</Field>
                <Field label="Political Interests">{dossier.countryPosition.politicalInterests}</Field>
                <Field label="Likely Negotiating Priorities"><List items={dossier.countryPosition.likelyNegotiatingPriorities} /></Field>
              </Section>
            </TabsContent>

            <TabsContent value="interests">
              <Section title="Country Interests">
                <Field label="What does this country WANT?"><List items={dossier.countryInterests.whatDoesCountryWant} /></Field>
                <Field label="What does this country NEED TO AVOID?"><List items={dossier.countryInterests.whatDoesCountryNeedToAvoid} /></Field>
                <Field label="What would be politically DIFFICULT to support?"><List items={dossier.countryInterests.whatWouldBePoliticallyDifficult} /></Field>
              </Section>
            </TabsContent>

            <TabsContent value="landscape">
              <Section title="International Landscape">
                <Field label="Allies">
                  <div className="space-y-1">
                    {dossier.internationalLandscape.allies.map((a, i) => (
                      <div key={i}><span className="font-medium">{a.country}</span> — {a.why}</div>
                    ))}
                  </div>
                </Field>
                <Field label="Likely Allies">
                  <div className="space-y-1">
                    {dossier.internationalLandscape.likelyAllies.map((a, i) => (
                      <div key={i}><span className="font-medium">{a.country}</span> — {a.why}</div>
                    ))}
                  </div>
                </Field>
                <Field label="Neutral States">
                  <div className="space-y-1">
                    {dossier.internationalLandscape.neutralStates.map((a, i) => (
                      <div key={i}><span className="font-medium">{a.country}</span> — {a.why}</div>
                    ))}
                  </div>
                </Field>
                <Field label="Opposing States">
                  <div className="space-y-1">
                    {dossier.internationalLandscape.opposingStates.map((a, i) => (
                      <div key={i}><span className="font-medium">{a.country}</span> — {a.why}</div>
                    ))}
                  </div>
                </Field>
                <Field label="Regional Blocs">
                  <div className="space-y-1">
                    {dossier.internationalLandscape.regionalBlocs.map((b, i) => (
                      <div key={i}><span className="font-medium">{b.name}</span> — {b.position}</div>
                    ))}
                  </div>
                </Field>
              </Section>
            </TabsContent>

            <TabsContent value="un">
              <Section title="UN / International Framework">
                <Field label="Charter Provisions"><List items={dossier.unFramework.charterProvisions} /></Field>
                <Field label="Resolutions">
                  <div className="space-y-2">
                    {dossier.unFramework.resolutions.map((r, i) => (
                      <div key={i} className="rounded border p-2">
                        <span className="font-mono font-medium">{r.symbol}</span> — {r.title}
                        <p className="text-xs text-muted-foreground mt-1">{r.relevance}</p>
                      </div>
                    ))}
                  </div>
                </Field>
                <Field label="Treaties">
                  <div className="space-y-1">
                    {dossier.unFramework.treaties.map((t, i) => (
                      <div key={i}><span className="font-medium">{t.name}</span> — {t.relevance}</div>
                    ))}
                  </div>
                </Field>
                <Field label="Relevant Agencies">
                  <div className="space-y-1">
                    {dossier.unFramework.relevantAgencies.map((a, i) => (
                      <div key={i}><span className="font-medium">{a.name}</span> — {a.role}</div>
                    ))}
                  </div>
                </Field>
              </Section>
            </TabsContent>

            <TabsContent value="current">
              <Section title="Current Affairs">
                {dossier.currentAffairs.map((a, i) => (
                  <div key={i} className="rounded border p-3 space-y-1">
                    <div className="font-medium text-sm">{a.whatHappened}</div>
                    <div className="text-xs text-muted-foreground">{a.when} · {a.source}</div>
                    <div className="text-sm text-muted-foreground">{a.whyItMatters}</div>
                    <div className="text-sm text-muted-foreground italic">To {country}: {a.whyItMattersToCountry}</div>
                  </div>
                ))}
              </Section>
            </TabsContent>

            <TabsContent value="evidence">
              <Section title="Key Evidence">
                {dossier.evidence.map((e, i) => (
                  <div key={i} className="rounded border p-2">
                    <Badge variant="outline" className="text-[10px] mb-1">{e.type}</Badge>
                    <p className="text-sm text-muted-foreground">{e.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">Source: {e.source}</p>
                  </div>
                ))}
              </Section>
            </TabsContent>

            <TabsContent value="attack">
              <Section title="Diplomatic Ammunition">
                <Field label="Contradictions"><List items={dossier.diplomaticAmmunition.contradictions} /></Field>
                <Field label="Inconsistent Policies"><List items={dossier.diplomaticAmmunition.inconsistentPolicies} /></Field>
                <Field label="Implementation Failures"><List items={dossier.diplomaticAmmunition.implementationFailures} /></Field>
                <Field label="Voting Contradictions"><List items={dossier.diplomaticAmmunition.votingContradictions} /></Field>
                <Field label="Relevant Historical Positions"><List items={dossier.diplomaticAmmunition.relevantHistoricalPositions} /></Field>
              </Section>
            </TabsContent>

            <TabsContent value="poi">
              <Section title="POI Bank">
                {dossier.poiBank.map((p, i) => (
                  <div key={i} className="rounded border p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{p.type}</Badge>
                      <span className="text-xs text-muted-foreground">vs {p.targetCountry}</span>
                    </div>
                    <p className="text-sm font-medium">{p.text}</p>
                    <p className="text-xs text-muted-foreground">{p.rationale}</p>
                  </div>
                ))}
              </Section>
            </TabsContent>

            <TabsContent value="defense">
              <Section title="Defense Bank">
                {dossier.defenseBank.map((d, i) => (
                  <div key={i} className="rounded border p-3 space-y-2">
                    <div className="text-sm font-medium text-red-500">Expected Attack: {d.expectedAttack}</div>
                    <div className="text-xs text-muted-foreground">Why: {d.whyTheyMayUseIt}</div>
                    <div className="text-sm text-green-500">Best Response: {d.bestResponse}</div>
                    <div className="text-xs text-muted-foreground">Follow-up: {d.followUpResponse}</div>
                  </div>
                ))}
              </Section>
            </TabsContent>

            <TabsContent value="policy">
              <Section title="Policy Options">
                {dossier.policyOptions.map((p, i) => (
                  <div key={i} className="rounded border p-3 space-y-2">
                    <div className="font-medium text-sm">{p.problem}</div>
                    <div className="text-sm text-muted-foreground">{p.proposal}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div><span className="font-medium">Implementation:</span> {p.implementation}</div>
                      <div><span className="font-medium">Funding:</span> {p.funding}</div>
                      <div><span className="font-medium">Monitoring:</span> {p.monitoring}</div>
                      <div><span className="font-medium">Obstacles:</span> {p.potentialObstacle}</div>
                    </div>
                  </div>
                ))}
              </Section>
            </TabsContent>

            <TabsContent value="resolution">
              <Section title="Resolution Material">
                <Field label="Preambulatory Clauses"><List items={dossier.resolutionMaterial.preambulatoryClauses} /></Field>
                <Field label="Operative Clauses"><List items={dossier.resolutionMaterial.operativeClauses} /></Field>
                <Field label="Implementation Mechanisms"><List items={dossier.resolutionMaterial.implementationMechanisms} /></Field>
                <Field label="Funding Mechanisms"><List items={dossier.resolutionMaterial.fundingMechanisms} /></Field>
                <Field label="Monitoring Mechanisms"><List items={dossier.resolutionMaterial.monitoringMechanisms} /></Field>
                <Field label="Responsible Organizations"><List items={dossier.resolutionMaterial.responsibleOrganizations} /></Field>
              </Section>
            </TabsContent>

            <TabsContent value="gsl">
              <Section title="GSL Material">
                <Field label="Strongest Opening Hook">{dossier.gslMaterial.strongestOpeningHook}</Field>
                <Field label="Strongest Country Position">{dossier.gslMaterial.strongestCountryPosition}</Field>
                <Field label="Strongest Evidence">{dossier.gslMaterial.strongestEvidence}</Field>
                <Field label="Strongest Solution">{dossier.gslMaterial.strongestSolution}</Field>
                <Field label="Strongest Closing Hook">{dossier.gslMaterial.strongestClosingHook}</Field>
              </Section>
            </TabsContent>

            <TabsContent value="takeaways">
              <Section title="Key Takeaways">
                <ol className="space-y-2">
                  {dossier.takeaways.map((t, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="font-mono font-medium text-foreground">{i + 1}.</span>
                      {t}
                    </li>
                  ))}
                </ol>
              </Section>
            </TabsContent>

            <TabsContent value="sources">
              <Section title="Sources">
                <div className="space-y-2">
                  {dossier.sources.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 rounded border p-2">
                      <div className="flex-1 min-w-0">
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium hover:underline"
                        >
                          {s.title}
                        </a>
                        <p className="text-xs text-muted-foreground">{s.organization} · {s.supports}</p>
                      </div>
                      <Badge
                        variant={s.tier === 1 ? "default" : s.tier === 2 ? "secondary" : "outline"}
                        className="text-[10px]"
                      >
                        Tier {s.tier}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Section>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
