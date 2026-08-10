import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { ConferenceAnalytics } from "@/components/analytics/conference-analytics";

export const metadata = { title: "Analytics | MUNOS" };

export default async function AnalyticsPage() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return (
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Please sign in to view your analytics.
          </p>
        </div>
      );
    }

    const db = getDb();

    const [, committees, , scores] =
      await Promise.all([
        db.award.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        }),
        db.committee.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        }),
        db.countryRepresented.findMany({
          where: { userId: user.id },
        }),
        db.aiScore.findMany({
          where: { workspace: { userId: user.id } },
          orderBy: { createdAt: "asc" },
        }),
      ]);

    // Build conference entries from committee records
    const conferenceMap = new Map<
      string,
      {
        name: string;
        date: string;
        scores: number[];
        committees: Map<string, number>;
        speakingMinutes: number;
      }
    >();

    for (const c of committees) {
      const confName = c.conferenceName || "Unknown Conference";
      if (!conferenceMap.has(confName)) {
        conferenceMap.set(confName, {
          name: confName,
          date: c.createdAt.toISOString(),
          scores: [],
          committees: new Map(),
          speakingMinutes: 0,
        });
      }
      const conf = conferenceMap.get(confName)!;
      conf.committees.set(c.name, (conf.committees.get(c.name) || 0) + 1);
      if (new Date(c.createdAt) < new Date(conf.date)) {
        conf.date = c.createdAt.toISOString();
      }
    }

    // Attach scores to conferences
    for (const s of scores) {
      const result = s.result as Record<string, unknown>;
      const scoreVal =
        typeof result?.overall === "number" ? result.overall : 0;
      // Use the most recent conference as a rough mapping
      const confEntries = [...conferenceMap.values()];
      if (confEntries.length > 0) {
        const lastConf = confEntries[confEntries.length - 1];
        if (lastConf) lastConf.scores.push(scoreVal);
      }
    }

    const conferenceEntries = [...conferenceMap.values()].map((c) => ({
      name: c.name,
      date: c.date,
      score:
        c.scores.length > 0
          ? Math.round(
              c.scores.reduce((a, b) => a + b, 0) / c.scores.length,
            )
          : 0,
      committee: [...c.committees.entries()].sort(
        (a, b) => b[1] - a[1],
      )[0]?.[0] || "General",
      speakingMinutes: c.speakingMinutes || 0,
    }));

    // Score data for line chart fallback
    const scoreTimeline = scores.slice(-10).map((s) => {
      const result = s.result as Record<string, unknown>;
      const scoreVal =
        typeof result?.overall === "number" ? result.overall : 0;
      const date = new Date(s.createdAt);
      return {
        label: `${date.getMonth() + 1}/${date.getDate()}`,
        score: scoreVal,
      };
    });

    // Committee distribution
    const committeeMap = new Map<string, number>();
    for (const c of committees) {
      committeeMap.set(c.name, (committeeMap.get(c.name) || 0) + 1);
    }
    const committeeDistribution = [...committeeMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Speaking time per committee
    const speakingMap = new Map<string, number>();
    for (const c of committees) {
      speakingMap.set(
        c.name,
        (speakingMap.get(c.name) || 0),
      );
    }
    const speakingData = [...speakingMap.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    return (
      <ConferenceAnalytics
        conferences={conferenceEntries}
        scores={scoreTimeline.map((s) => ({ label: s.label, value: s.score }))}
        committeeDistribution={committeeDistribution.map((c) => ({
          label: c.name,
          count: c.count,
        }))}
        speakingData={speakingData}
      />
    );
  } catch (error) {
    logger.error("Analytics page error", { error: String(error) });
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We couldn&apos;t load your analytics. Please try again.
        </p>
      </div>
    );
  }
}
