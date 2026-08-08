import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { PersonalInfoForm } from "@/components/profile/personal-info-form";
import { MunProfileForm } from "@/components/profile/mun-profile-form";
import { AwardsManager } from "@/components/profile/awards-manager";
import { CommitteesManager } from "@/components/profile/committees-manager";
import { CountriesManager } from "@/components/profile/countries-manager";
import { SocialLinksManager } from "@/components/profile/social-links-manager";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, FileBadge, Globe, Shield, FolderKanban } from "lucide-react";
import { PassportCardActions } from "@/components/profile/passport-card-actions";

export const metadata = { title: "Profile | MUNOS" };

export default async function ProfilePage() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return (
        <div className="space-y-8 text-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to manage your profile.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      );
    }

    const db = getDb();
    const full = await db.user.findUnique({
      where: { id: user.id },
      include: {
        awards: { orderBy: [{ year: "desc" }, { createdAt: "desc" }] },
        committees: { orderBy: [{ year: "desc" }, { createdAt: "desc" }] },
        countries: { orderBy: [{ year: "desc" }, { createdAt: "desc" }] },
        socialLinks: { orderBy: { createdAt: "asc" } },
        certificates: { orderBy: { createdAt: "desc" } },
        workspaces: { include: { conference: { select: { name: true, slug: true } } }, orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!full) {
      return (
        <div className="space-y-8 text-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your profile could not be loaded. Please try again.
            </p>
          </div>
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      );
    }

    const initials = [full.firstName?.[0], full.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "??";
    const displayName = [full.firstName, full.lastName].filter(Boolean).join(" ") || full.username || "Delegate";

      return (
        <div className="space-y-8">
          <div>
            <Breadcrumbs
              items={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Profile" },
              ]}
            />
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">Profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your MUN identity. Edit info, view portfolio, manage certificates.
            </p>
          </div>

        {/* Passport Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="grid size-20 place-items-center rounded-full bg-brand-500/10 text-3xl font-bold text-brand-600 dark:text-brand-400">
                {initials}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{displayName}</h2>
                <p className="text-sm text-muted-foreground">
                  {full.country ? `From ${full.country}` : "Delegate"} • {full.awards.length} award{full.awards.length !== 1 ? "s" : ""}
                </p>
                <div className="mt-2 flex gap-2">
                  {full.emailVerified && (
                    <Badge variant="secondary">
                      <Shield className="mr-1 size-3" /> Verified
                    </Badge>
                  )}
                  {full.awards.length > 0 && (
                    <Badge variant="outline">
                      <Award className="mr-1 size-3" /> {full.awards.length}
                    </Badge>
                  )}
                  {full.certificates.length > 0 && (
                    <Badge variant="outline">
                      <FileBadge className="mr-1 size-3" /> {full.certificates.length}
                    </Badge>
                  )}
                </div>
              </div>
              <PassportCardActions passportUrl="/passport" />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Awards", value: full.awards.length, icon: Award, color: "text-amber-600 bg-amber-500/10" },
            { label: "Certificates", value: full.certificates.length, icon: FileBadge, color: "text-emerald-600 bg-emerald-500/10" },
            { label: "Committees", value: full.committees.length, icon: FolderKanban, color: "text-brand-600 bg-brand-500/10" },
            { label: "Countries", value: full.countries.length, icon: Globe, color: "text-purple-600 bg-purple-500/10" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`grid size-10 place-items-center rounded-lg ${stat.color}`}>
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

        {/* Edit Forms */}
        <div className="grid gap-6">
          <PersonalInfoForm user={user} />
          <MunProfileForm user={user} />
          <AwardsManager awards={full.awards} />
          <CommitteesManager committees={full.committees} />
          <CountriesManager countries={full.countries} />
          <SocialLinksManager links={full.socialLinks} />
        </div>

        {/* Recent Workspaces */}
        {full.workspaces.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Recent Workspaces</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {full.workspaces.map((ws) => (
                <Link key={ws.id} href={`/workspaces/${ws.id}`}>
                  <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/40">
                    <div>
                      <p className="text-sm font-medium">{ws.title || ws.conference?.name || "Workspace"}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {ws.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">Open</Badge>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    logger.error("Profile page error", { error: String(error) });
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We couldn&apos;t load your profile. Please try again.
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/profile">Reload</Link>
        </Button>
      </div>
    );
  }
}
