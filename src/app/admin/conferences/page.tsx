import Link from "next/link";
import { Plus } from "lucide-react";
import { getDb } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConferenceRowActions } from "@/components/admin/conference-row-actions";
import {
  conferenceDateRange,
  deriveConference,
  FORMAT_LABELS,
} from "@/lib/conference";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Manage conferences | MUNOS Admin" };

export default async function AdminConferencesPage() {
  const now = new Date();
  const conferences = await getDb().conference.findMany({
    orderBy: { startDate: "asc" },
    include: { venue: true, organizer: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conferences</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {conferences.length} conferences in the database.
          </p>
        </div>
        <Button asChild className="gap-1.5 rounded-full">
          <Link href="/admin/conferences/new">
            <Plus className="size-4" />
            New conference
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Conference</th>
              <th className="px-4 py-3 font-medium">Dates</th>
              <th className="px-4 py-3 font-medium">Format</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {conferences.map((conference) => {
              const derived = deriveConference(conference, now);
              return (
                <tr key={conference.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/conference/${conference.slug}`}
                        className="font-semibold hover:underline"
                      >
                        {conference.name}
                      </Link>
                      {conference.featured ? (
                        <Badge className="bg-brand-500 text-[10px] text-white">Featured</Badge>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {conferenceDateRange(conference.startDate, conference.endDate)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {FORMAT_LABELS[conference.format]}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        derived.status === "past"
                          ? "bg-muted text-muted-foreground"
                          : derived.status === "open"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                            : derived.status === "closing"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                              : "bg-sky-500/15 text-sky-700 dark:text-sky-400",
                      )}
                    >
                      {derived.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-medium",
                        conference.published ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          conference.published ? "bg-emerald-500" : "bg-muted-foreground",
                        )}
                      />
                      {conference.published ? "Live" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ConferenceRowActions id={conference.id} published={conference.published} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
