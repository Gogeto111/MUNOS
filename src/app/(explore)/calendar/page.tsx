import { getDb } from "@/lib/prisma";
import { CalendarGrid } from "@/components/explore/calendar-grid";
import { Calendar } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Conference Calendar | MUNOS",
  description: "Browse upcoming MUN conferences on a monthly calendar view.",
};

export default async function CalendarPage() {
  const db = getDb();
  const now = new Date();

  const conferences = await db.conference.findMany({
    where: { published: true },
    select: {
      id: true,
      name: true,
      slug: true,
      startDate: true,
      endDate: true,
      city: true,
      country: true,
      difficulty: true,
    },
    orderBy: { startDate: "asc" },
  });

  const serialized = conferences.map((c) => ({
    ...c,
    startDate: c.startDate.toISOString(),
    endDate: c.endDate.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-brand-500/[0.07] via-transparent to-transparent">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[120px]" />
        <div className="relative pt-12 text-center sm:pt-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <Calendar className="size-3.5" />
            Conference calendar
          </span>
          <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Conference <span className="text-brand-600 dark:text-brand-400">Calendar</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-muted-foreground">
            View upcoming conferences on a monthly calendar. Click any day to see what starts then.
          </p>
        </div>
      </section>

      <div className="px-4 sm:px-6">
        <CalendarGrid
          conferences={serialized}
          initialMonth={now.getMonth()}
          initialYear={now.getFullYear()}
        />
      </div>
    </div>
  );
}
