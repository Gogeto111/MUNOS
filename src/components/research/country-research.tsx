"use client";

import { useState } from "react";
import {
  Loader2,
  Globe,
  Landmark,
  Users,
  TrendingUp,
  FileText,
  ScrollText,
  BarChart3,
  Newspaper,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountrySearch } from "./country-search";
import { CountryFlag } from "@/components/shared/country-flag";
import { generateCountryProfile } from "@/lib/actions/country-research";
import type { CountryProfile } from "@/lib/actions/country-research";
import { fetchRestCountryData } from "@/lib/actions/rest-countries";
import type { RestCountryData } from "@/lib/actions/rest-countries";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase text-muted-foreground">{label}</h4>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 text-muted-foreground" />
        {title}
      </div>
      <div className="space-y-3 pl-6">{children}</div>
    </div>
  );
}

export function CountryResearch() {
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<CountryProfile | null>(null);
  const [restData, setRestData] = useState<RestCountryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!country.trim()) return;
    setLoading(true);
    setError(null);
    setProfile(null);
    setRestData(null);

    const [restResult, aiResult] = await Promise.all([
      fetchRestCountryData(country.trim()),
      generateCountryProfile(country.trim()),
    ]);

    if (restResult) setRestData(restResult);

    if (aiResult.status === "success" && aiResult.data) {
      setProfile(aiResult.data);
    } else {
      setError(aiResult.message ?? "Failed to generate profile");
    }
    setLoading(false);
  };

  const formatPopulation = (pop: number) => {
    if (pop >= 1_000_000_000) return `${(pop / 1_000_000_000).toFixed(1)} billion`;
    if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)} million`;
    return pop.toLocaleString();
  };

  const formatCurrency = (currencies?: Record<string, { name: string; symbol: string }>) => {
    if (!currencies) return "N/A";
    return Object.values(currencies).map((c) => `${c.name} (${c.symbol})`).join(", ");
  };

  const formatLanguages = (languages?: Record<string, string>) => {
    if (!languages) return "N/A";
    return Object.values(languages).join(", ");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Country Lookup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <CountrySearch
                value={country}
                onChange={setCountry}
                onSearch={handleSearch}
                disabled={loading}
              />
            </div>
            <Button onClick={handleSearch} disabled={!country.trim() || loading}>
              {loading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Globe className="mr-2 size-4" />
              )}
              {loading ? "Researching..." : "Look Up"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <CountryFlag country={profile.name} size="xl" />
              <div>
                <div className="text-lg font-bold">{profile.name}</div>
                <div className="text-xs font-normal text-muted-foreground">
                  {restData?.subregion || profile.subRegion}
                  {restData?.unMember && (
                    <Badge variant="outline" className="ml-2 text-[10px]">UN Member</Badge>
                  )}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[600px] overflow-y-auto pr-2">
              <div className="space-y-6">
                <Section title="Quick Facts" icon={Flag}>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Field label="Capital">{restData?.capital?.[0] || profile.capital}</Field>
                    <Field label="Population">{restData?.population ? formatPopulation(restData.population) : profile.population}</Field>
                    <Field label="Government">{profile.government}</Field>
                    <Field label="Head of State">{profile.leader}</Field>
                    <Field label="Region">{restData?.region || profile.region}</Field>
                    <Field label="UN Member Since">{profile.unMember}</Field>
                  </div>
                </Section>

                <Section title="Languages & Currency" icon={Globe}>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Currency">{restData?.currencies ? formatCurrency(restData.currencies) : profile.economy.currency}</Field>
                    <Field label="Languages">{restData?.languages ? formatLanguages(restData.languages) : "See profile"}</Field>
                  </div>
                </Section>

                <Section title="Economy" icon={TrendingUp}>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                    <Field label="GDP (Nominal)">{profile.economy.gdp}</Field>
                    <Field label="Currency">{profile.economy.currency}</Field>
                  </div>
                  <Field label="Major Exports">
                    <div className="flex flex-wrap gap-1">
                      {profile.economy.majorExports.map((exp, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{exp}</Badge>
                      ))}
                    </div>
                  </Field>
                  {profile.economy.tradeBloc.length > 0 && (
                    <Field label="Trade Blocs">
                      <div className="flex flex-wrap gap-1">
                        {profile.economy.tradeBloc.map((bloc, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{bloc}</Badge>
                        ))}
                      </div>
                    </Field>
                  )}
                </Section>

                <Section title="Foreign Policy" icon={Landmark}>
                  <p className="text-sm text-muted-foreground">{profile.foreignPolicy.overview}</p>
                  <Field label="Key Alliances">
                    <div className="flex flex-wrap gap-1">
                      {profile.foreignPolicy.keyAlliances.map((a, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>
                      ))}
                    </div>
                  </Field>
                  <Field label="UN Voting Pattern">
                    <p className="text-sm text-muted-foreground">{profile.foreignPolicy.unVoting}</p>
                  </Field>
                  {profile.foreignPolicy.nonAligned && (
                    <Badge variant="outline" className="text-xs">Non-Aligned Movement Member</Badge>
                  )}
                </Section>

                <Section title="Key MUN Issues" icon={Users}>
                  <ul className="space-y-1">
                    {profile.keyIssues.map((issue, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {issue}</li>
                    ))}
                  </ul>
                </Section>

                <Section title="Recent Developments" icon={Newspaper}>
                  <ul className="space-y-2">
                    {profile.recentDevelopments.map((dev, i) => (
                      <li key={i} className="rounded border p-2 text-sm text-muted-foreground">
                        {dev}
                      </li>
                    ))}
                  </ul>
                </Section>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t pt-4">
              <Button size="sm" variant="outline">
                <FileText className="mr-1.5 size-3.5" />
                Generate Position Paper
              </Button>
              <Button size="sm" variant="outline">
                <ScrollText className="mr-1.5 size-3.5" />
                Find Related Resolutions
              </Button>
              <Button size="sm" variant="outline">
                <BarChart3 className="mr-1.5 size-3.5" />
                View UN Voting Record
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              Generating profile for {country}...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
