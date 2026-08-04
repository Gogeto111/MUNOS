"use client";

import { useEffect, useState } from "react";
import { Award, FileBadge, Globe, Loader2, Share2, Shield, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserPortfolio } from "@/lib/actions/profile";

interface PortfolioData {
  name: string;
  role: string;
  awards: Array<{ title: string; issuer: string | null; category: string | null; year: number | null }>;
  certificates: Array<{ title: string; issuer: string | null; category: string; year: number | null }>;
  committees: Array<{ name: string; role: string; conferenceName: string | null; year: number | null }>;
  countries: Array<{ country: string; conferenceName: string | null }>;
  stats: { awards: number; certificates: number; committees: number; countries: number };
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserPortfolio().then((result) => {
      if (result.status === "success" && result.data) {
        setPortfolio(result.data);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-sm text-muted-foreground">Failed to load portfolio data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-sm text-muted-foreground">
            Your public MUN portfolio, generated from your profile data.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Share2 className="size-3.5" /> Share Portfolio
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="grid size-20 place-items-center rounded-full bg-brand-500/10 text-3xl font-bold text-brand-600 dark:text-brand-400">
              {portfolio.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{portfolio.name}</h2>
              <p className="text-sm text-muted-foreground">MUN Delegate</p>
              <div className="mt-2 flex gap-2">
                <Badge variant="secondary">
                  <Shield className="mr-1 size-3" /> Profile
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Awards", value: portfolio.stats.awards, icon: Award, color: "amber" },
          { label: "Certificates", value: portfolio.stats.certificates, icon: FileBadge, color: "emerald" },
          { label: "Committees", value: portfolio.stats.committees, icon: Users, color: "brand" },
          { label: "Countries", value: portfolio.stats.countries, icon: Globe, color: "brand" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`grid size-10 place-items-center rounded-lg bg-${stat.color}-500/10 text-${stat.color}-600`}>
                  <stat.icon className="size-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {portfolio.awards.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Awards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {portfolio.awards.map((award, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                  <div className="grid size-8 place-items-center rounded-full bg-amber-500/10">
                    <Award className="size-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{award.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {award.issuer ?? "Unknown"}{award.year && ` • ${award.year}`}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {portfolio.committees.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Committee Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {portfolio.committees.map((c, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                  <div className="grid size-8 place-items-center rounded-full bg-brand-500/10">
                    <Users className="size-4 text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.role}{c.conferenceName && ` • ${c.conferenceName}`}{c.year && ` • ${c.year}`}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {portfolio.countries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Countries Represented</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {portfolio.countries.map((c, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                  <div className="grid size-8 place-items-center rounded-full bg-emerald-500/10">
                    <Globe className="size-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.country}</p>
                    {c.conferenceName && (
                      <p className="text-xs text-muted-foreground">{c.conferenceName}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {portfolio.certificates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Certificates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {portfolio.certificates.map((cert, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                  <div className="grid size-8 place-items-center rounded-full bg-purple-500/10">
                    <FileBadge className="size-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{cert.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {cert.issuer ?? "Unknown"}{cert.year && ` • ${cert.year}`}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
