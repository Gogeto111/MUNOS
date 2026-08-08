import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, FileBadge, Globe, MapPin, Shield, Users } from "lucide-react";
import { getPublicPortfolio } from "@/lib/actions/public-portfolio";
import { colorClasses } from "@/lib/colors";
import { Container } from "@/components/shared/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCountryFlag } from "@/lib/country-flags";

export const metadata = { title: "Public Portfolio | MUNOS" };

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const portfolio = await getPublicPortfolio(userId);

  if (!portfolio) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Container className="py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← View on MUNOS
          </Link>
          <Badge variant="secondary" className="gap-1">
            <Shield className="size-3" /> Public Portfolio
          </Badge>
        </div>

        <div className="mx-auto max-w-3xl space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="grid size-20 place-items-center rounded-full bg-brand-500/10 text-3xl font-bold text-brand-600 dark:text-brand-400">
                  {portfolio.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold">{portfolio.name}</h1>
                  <p className="text-sm text-muted-foreground">MUN Delegate</p>
                  {portfolio.bio && (
                    <p className="mt-2 text-sm text-muted-foreground">{portfolio.bio}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {(portfolio.city || portfolio.state || portfolio.country) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {[portfolio.city, portfolio.state, portfolio.country].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {portfolio.school && <span>{portfolio.school}</span>}
                    {portfolio.university && <span>{portfolio.university}</span>}
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
                    <div className={`grid size-10 place-items-center rounded-lg ${colorClasses(stat.color).bg} ${colorClasses(stat.color).text}`}>
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
                      <div className="grid size-8 place-items-center rounded-full bg-emerald-500/10 text-lg">
                        {getCountryFlag(c.country)}
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

          <div className="text-center pt-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">Back to MUNOS</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
