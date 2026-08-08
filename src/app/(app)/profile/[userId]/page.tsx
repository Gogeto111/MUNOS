import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { FollowButton } from "@/components/profile/follow-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Award,
  FileBadge,
  Globe,
  FolderKanban,
  ArrowLeft,
  ExternalLink,
  Shield,
  Trophy,
} from "lucide-react";
import { type Metadata } from "next";

interface Props {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  const db = getDb();
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, username: true },
  });
  if (!user) return { title: "User Not Found | MUNOS" };
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "User";
  return { title: `${name} | MUNOS` };
}

export default async function PublicProfilePage({ params }: Props) {
  try {
    const { userId } = await params;
    const db = getDb();

    const profileUser = await db.user.findUnique({
      where: { id: userId },
      include: {
        awards: { orderBy: [{ year: "desc" }, { createdAt: "desc" }] },
        committees: { orderBy: [{ year: "desc" }, { createdAt: "desc" }] },
        countries: { orderBy: [{ year: "desc" }, { createdAt: "desc" }] },
        socialLinks: { orderBy: { createdAt: "asc" } },
        certificates: { orderBy: { createdAt: "desc" } },
        badges: { orderBy: { earnedAt: "desc" } },
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!profileUser) notFound();

    const initials =
      [profileUser.firstName?.[0], profileUser.lastName?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase() || "??";
    const displayName =
      [profileUser.firstName, profileUser.lastName].filter(Boolean).join(" ") ||
      profileUser.username ||
      "Delegate";

    return (
      <div className="space-y-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/social">
            <ArrowLeft className="mr-1 size-4" />
            Back to Social
          </Link>
        </Button>

        {/* Passport Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-6">
              {profileUser.avatarUrl ? (
                <img
                  src={profileUser.avatarUrl}
                  alt={displayName}
                  className="size-20 rounded-full object-cover"
                />
              ) : (
                <div className="grid size-20 place-items-center rounded-full bg-brand-500/10 text-3xl font-bold text-brand-600 dark:text-brand-400">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold truncate">{displayName}</h2>
                  {profileUser.emailVerified && (
                    <Badge variant="secondary">
                      <Shield className="mr-1 size-3" /> Verified
                    </Badge>
                  )}
                </div>
                {profileUser.bio && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {profileUser.bio}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {profileUser.country && (
                    <span className="flex items-center gap-1">
                      <Globe className="size-3" />
                      {profileUser.country}
                    </span>
                  )}
                  {profileUser.school && <span>{profileUser.school}</span>}
                  {profileUser.university && <span>{profileUser.university}</span>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <FollowButton
                  targetUserId={profileUser.id}
                  initialFollowing={false}
                  initialFollowerCount={profileUser._count.followers}
                />
                <span className="text-xs text-muted-foreground">
                  {profileUser._count.following} following
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Awards", value: profileUser.awards.length, icon: Award, color: "text-amber-600 bg-amber-500/10" },
            { label: "Certificates", value: profileUser.certificates.length, icon: FileBadge, color: "text-emerald-600 bg-emerald-500/10" },
            { label: "Committees", value: profileUser.committees.length, icon: FolderKanban, color: "text-brand-600 bg-brand-500/10" },
            { label: "Countries", value: profileUser.countries.length, icon: Globe, color: "text-purple-600 bg-purple-500/10" },
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

        {/* Awards */}
        {profileUser.awards.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Award className="size-4" />
                Awards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {profileUser.awards.map((award) => (
                <div
                  key={award.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{award.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {[award.issuer, award.category, award.year].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {award.year && (
                    <Badge variant="outline" className="text-[10px]">{award.year}</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Committees */}
        {profileUser.committees.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FolderKanban className="size-4" />
                Committees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {profileUser.committees.map((committee) => (
                <div
                  key={committee.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{committee.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[committee.role, committee.conferenceName, committee.year]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  {committee.year && (
                    <Badge variant="outline" className="text-[10px]">{committee.year}</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Countries */}
        {profileUser.countries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="size-4" />
                Countries Represented
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {profileUser.countries.map((country) => (
                <div
                  key={country.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{country.country}</p>
                    <p className="text-xs text-muted-foreground">
                      {[country.conferenceName, country.year].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {country.year && (
                    <Badge variant="outline" className="text-[10px]">{country.year}</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Achievement Badges */}
        {profileUser.badges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Trophy className="size-4" />
                Achievement Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profileUser.badges.map((badge) => (
                  <Badge key={badge.id} variant="secondary" className="gap-1">
                    {badge.badgeName}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Links */}
        {profileUser.socialLinks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profileUser.socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/40"
                  >
                    <ExternalLink className="size-3" />
                    {link.platform}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    logger.error("Public profile page error", { error: String(error) });
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We couldn&apos;t load this profile. Please try again.
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/social">Back to Social</Link>
        </Button>
      </div>
    );
  }
}
