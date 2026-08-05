import { Award, CheckCircle, Download, FileBadge, Globe, Share2, Shield, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { colorClasses } from "@/lib/colors";

export const metadata = { title: "Passport | MUNOS" };

export default async function PassportPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <h1 className="text-3xl font-bold tracking-tight">MUN Passport</h1>
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Shield className="mb-4 size-10 text-muted-foreground" />
              <p className="text-sm font-medium">Sign in to view your MUN Passport</p>
              <p className="mt-1 text-xs text-muted-foreground">Your verified portfolio of awards, conferences, and achievements.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const db = getDb();
  const [awards, certificates, countryRepresented] = await Promise.all([
    db.award.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    db.certificate.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    db.countryRepresented.findMany({ where: { userId: user.id } }),
  ]);

  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "??";
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Delegate";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">MUN Passport</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your verified MUN portfolio — awards, positions, and achievements.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Share2 className="size-3.5" /> Share
            </Button>
            <Button className="gap-2">
              <Download className="size-3.5" /> Export PDF
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="grid size-20 place-items-center rounded-full bg-brand-500/10 text-3xl font-bold text-brand-600 dark:text-brand-400">
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold">{displayName}</h2>
                <p className="text-sm text-muted-foreground">
                  {user.country ? `From ${user.country}` : "Delegate"} • {awards.length} award{awards.length !== 1 ? "s" : ""}
                </p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="secondary">
                    <Shield className="mr-1 size-3" /> Verified
                  </Badge>
                  {awards.length > 0 && (
                    <Badge variant="outline">
                      <Award className="mr-1 size-3" /> {awards.length} Award{awards.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {[
            { label: "Countries Represented", value: countryRepresented.length.toString(), icon: Globe, color: "brand" },
            { label: "Awards", value: awards.length.toString(), icon: Award, color: "amber" },
            { label: "Certificates", value: certificates.length.toString(), icon: FileBadge, color: "emerald" },
            { label: "Interests", value: user.interests?.length?.toString() || "0", icon: TrendingUp, color: "brand" },
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
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Awards History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {awards.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No awards yet. They&apos;ll appear here as you earn them.</p>
              ) : (
                awards.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                    <div className="grid size-10 place-items-center rounded-full bg-amber-500/10">
                      <Award className="size-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.issuer || "Unknown issuer"}{item.year ? ` • ${item.year}` : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Certificates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {certificates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No certificates yet. They&apos;ll appear here once issued.</p>
              ) : (
                certificates.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                    <div className="grid size-10 place-items-center rounded-full bg-emerald-500/10">
                      <CheckCircle className="size-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.issuer || "Unknown issuer"}{item.issueYear ? ` • ${item.issueYear}` : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
