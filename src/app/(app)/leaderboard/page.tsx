import Link from "next/link";
import { getDb } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Medal } from "lucide-react";
import { type Metadata } from "next";

export const metadata: Metadata = { title: "Leaderboard | MUNOS" };

function computeScore(row: {
  _count: { awards: number; certificates: number; committees: number; countries: number; posts: number; badges: number };
}) {
  const c = row._count;
  return c.awards * 10 + c.certificates * 5 + c.committees * 3 + c.countries * 2 + c.posts * 1 + c.badges * 8;
}

interface PageProps {
  searchParams: Promise<{ country?: string }>;
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  try {
    const db = getDb();
    const currentUser = await getCurrentUser();
    const params = await searchParams;
    const countryFilter = params.country?.trim() || undefined;

    const whereClause = countryFilter ? { country: countryFilter } : undefined;

    const users = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        avatarUrl: true,
        country: true,
        _count: {
          select: {
            awards: true,
            certificates: true,
            committees: true,
            countries: true,
            posts: true,
            badges: true,
          },
        },
      },
      take: 50,
    });

    const ranked = users
      .map((u) => ({ ...u, score: computeScore(u) }))
      .sort((a, b) => b.score - a.score)
      .map((u, i) => ({ ...u, rank: i + 1 }));

    const uniqueCountries = await db.user.findMany({
      where: { country: { not: null } },
      select: { country: true },
      distinct: ["country"],
      orderBy: { country: "asc" },
    });

    const currentUserId = currentUser?.id;

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Trophy className="size-6 text-amber-500" />
              Global Leaderboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Top delegates ranked by awards, certificates, committees, and activity.
            </p>
          </div>
        </div>

        {/* Country Filter */}
        <form method="get" className="flex items-center gap-2">
          <select
            name="country"
            defaultValue={countryFilter ?? ""}
            className="h-8 rounded-lg border border-border bg-background px-2 text-sm"
          >
            <option value="">All Countries</option>
            {uniqueCountries.map((c) => (
              <option key={c.country} value={c.country!}>
                {c.country}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm" variant="outline">
            Filter
          </Button>
          {countryFilter && (
            <Button asChild size="sm" variant="ghost">
              <Link href="/leaderboard">Clear</Link>
            </Button>
          )}
        </form>

        {/* Score Formula */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Score formula:</span>{" "}
              Awards×10 + Certificates×5 + Committees×3 + Countries×2 + Posts×1 + Badges×8
            </p>
          </CardContent>
        </Card>

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Top {ranked.length} Delegates
              {countryFilter && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {countryFilter}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ranked.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No users found{countryFilter ? ` in ${countryFilter}` : ""}.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Delegate</TableHead>
                    <TableHead className="text-center">Awards</TableHead>
                    <TableHead className="text-center">Certs</TableHead>
                    <TableHead className="text-center">Comms</TableHead>
                    <TableHead className="text-center">Countries</TableHead>
                    <TableHead className="text-center">Posts</TableHead>
                    <TableHead className="text-center">Badges</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranked.map((entry) => {
                    const initials =
                      [entry.firstName?.[0], entry.lastName?.[0]]
                        .filter(Boolean)
                        .join("")
                        .toUpperCase() || "??";
                    const name =
                      [entry.firstName, entry.lastName].filter(Boolean).join(" ") ||
                      entry.username ||
                      "Delegate";
                    const isCurrentUser = entry.id === currentUserId;

                    return (
                      <TableRow
                        key={entry.id}
                        className={isCurrentUser ? "bg-brand-500/5" : ""}
                      >
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {entry.rank <= 3 && (
                              <Medal
                                className={`size-4 ${
                                  entry.rank === 1
                                    ? "text-amber-500"
                                    : entry.rank === 2
                                      ? "text-gray-400"
                                      : "text-amber-700"
                                }`}
                              />
                            )}
                            <span className="text-sm font-semibold tabular-nums">
                              {entry.rank}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/profile/${entry.id}`}
                            className="flex items-center gap-2 hover:underline"
                          >
                            {entry.avatarUrl ? (
                              <img
                                src={entry.avatarUrl}
                                alt={name}
                                className="size-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="grid size-8 place-items-center rounded-full bg-brand-500/10 text-xs font-bold text-brand-600 dark:text-brand-400">
                                {initials}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium leading-none">
                                {name}
                                {isCurrentUser && (
                                  <Badge variant="secondary" className="ml-1.5 text-[10px]">
                                    You
                                  </Badge>
                                )}
                              </p>
                              {entry.country && (
                                <p className="text-[10px] text-muted-foreground">
                                  {entry.country}
                                </p>
                              )}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="text-center text-sm tabular-nums">
                          {entry._count.awards}
                        </TableCell>
                        <TableCell className="text-center text-sm tabular-nums">
                          {entry._count.certificates}
                        </TableCell>
                        <TableCell className="text-center text-sm tabular-nums">
                          {entry._count.committees}
                        </TableCell>
                        <TableCell className="text-center text-sm tabular-nums">
                          {entry._count.countries}
                        </TableCell>
                        <TableCell className="text-center text-sm tabular-nums">
                          {entry._count.posts}
                        </TableCell>
                        <TableCell className="text-center text-sm tabular-nums">
                          {entry._count.badges}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-bold tabular-nums">
                            {entry.score.toLocaleString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    logger.error("Leaderboard page error", { error: String(error) });
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We couldn&apos;t load the leaderboard. Please try again.
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/leaderboard">Reload</Link>
        </Button>
      </div>
    );
  }
}
