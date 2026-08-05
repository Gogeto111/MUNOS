import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  Globe,
  Library,
  Plus,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { getDb } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  conferenceDateRange,
  deriveConference,
  difficultyLabel,
} from "@/lib/conference";
import { isAuthConfigured } from "@/lib/public-env";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin | MUNOS" };

export default async function AdminDashboard() {
  if (isAuthConfigured) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") redirect("/dashboard");
  }
  const db = getDb();
  const now = new Date();

  const [total, published, regOpen, upcoming, organizers, bookmarks, reviews] =
    await Promise.all([
      db.conference.count(),
      db.conference.count({ where: { published: true } }),
      db.conference.count({ where: { registrationOpen: true } }),
      db.conference.count({ where: { endDate: { gte: now } } }),
      db.organizer.count(),
      db.bookmark.count(),
      db.review.count(),
    ]);

  const recent = await db.conference.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { venue: true, organizer: true },
  });

  const stats = [
    { label: "Total conferences", value: total, icon: Library },
    { label: "Published", value: published, icon: Globe },
    { label: "Registration open", value: regOpen, icon: Wallet },
    { label: "Upcoming", value: upcoming, icon: CalendarDays },
    { label: "Organizers", value: organizers, icon: Users },
    { label: "Bookmarks", value: bookmarks, icon: Star },
    { label: "Reviews", value: reviews, icon: Star },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the MUNOS conference database.
          </p>
        </div>
        <Link
          href="/admin/conferences/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Plus className="size-4" />
          New conference
        </Link>
      </div>

      {!isAuthConfigured ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          Authentication is not configured, so this panel is open. When you add
          Clerk keys, only ADMIN accounts can access it.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="flex flex-col gap-1 p-4">
              <stat.icon className="size-4 text-brand-500" />
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Recently added</h2>
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Conference</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Dates</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Location</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Fee</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((conference) => {
                const derived = deriveConference(conference, now);
                return (
                  <tr key={conference.id} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{conference.name}</span>
                        {!conference.published ? (
                          <Badge variant="secondary" className="text-[10px]">
                            Draft
                          </Badge>
                        ) : null}
                        <Badge variant="outline" className="hidden text-[10px] lg:inline-flex">
                          {difficultyLabel(conference.difficulty)}
                        </Badge>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {conferenceDateRange(conference.startDate, conference.endDate)}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {derived.locationLabel}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          derived.status === "past"
                            ? "bg-muted text-muted-foreground"
                            : derived.status === "ongoing"
                              ? "bg-brand-500/15 text-brand-700 dark:text-brand-300"
                              : derived.status === "closing"
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                : derived.status === "open"
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                  : "bg-sky-500/15 text-sky-700 dark:text-sky-400",
                        )}
                      >
                        {derived.statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{derived.feeLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
