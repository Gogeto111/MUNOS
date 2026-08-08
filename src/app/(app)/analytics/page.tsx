import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreChart } from "@/components/analytics/score-chart";
import { CategoryChart } from "@/components/analytics/category-chart";
import {
  Trophy,
  MapPin,
  BarChart3,
  Target,
} from "lucide-react";

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

    const [awards, committees, countries, scores, activities, simulations] =
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
        db.activity.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        db.committeeSimulation.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);

    const totalAwards = awards.length;
    const uniqueConferences = new Set(
      committees.map((c) => c.conferenceName).filter(Boolean),
    ).size;
    const uniqueCountries = new Set(countries.map((c) => c.country)).size;

    const avgScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, s) => {
              const result = s.result as Record<string, unknown>;
              const scoreVal =
                typeof result?.overall === "number" ? result.overall : 0;
              return sum + scoreVal;
            }, 0) / scores.length,
          )
        : 0;

    // Awards by category
    const categoryMap = new Map<string, number>();
    for (const award of awards) {
      const cat = award.category || "Other";
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    }
    const categoryData = [...categoryMap.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    // Scores over time (last 10)
    const scoreData = scores.slice(-10).map((s, i) => {
      const result = s.result as Record<string, unknown>;
      const scoreVal =
        typeof result?.overall === "number" ? result.overall : 0;
      const date = new Date(s.createdAt);
      const label = `${date.getMonth() + 1}/${date.getDate()}`;
      return { label, score: scoreVal };
    });

    // Committee participation
    const committeeMap = new Map<string, number>();
    for (const c of committees) {
      committeeMap.set(c.name, (committeeMap.get(c.name) || 0) + 1);
    }
    const committeeData = [...committeeMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Monthly activity (last 6 months)
    const now = new Date();
    const monthlyActivity: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString("en-US", {
        month: "short",
      });
      const count = activities.filter((a) => {
        const ad = new Date(a.createdAt);
        return (
          ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear()
        );
      }).length;
      monthlyActivity.push({ month: monthLabel, count });
    }
    const maxActivity = Math.max(...monthlyActivity.map((m) => m.count), 1);

    // Stats cards
    const stats = [
      {
        label: "Total Awards",
        value: totalAwards,
        icon: Trophy,
        color: "text-amber-500",
      },
      {
        label: "Conferences",
        value: uniqueConferences,
        icon: MapPin,
        color: "text-blue-500",
      },
      {
        label: "Avg AI Score",
        value: avgScore || "—",
        icon: BarChart3,
        color: "text-emerald-500",
      },
      {
        label: "Countries",
        value: uniqueCountries,
        icon: Target,
        color: "text-rose-500",
      },
    ];

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your MUN performance, awards, and activity over time.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className={`size-4 ${stat.color}`} />
                </div>
                <p className="mt-2 text-3xl font-semibold tabular-nums">
                  {stat.value}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryChart data={categoryData} />
          <ScoreChart data={scoreData} />
        </div>

        {/* Committee Participation */}
        <Card>
          <CardHeader>
            <CardTitle>Committee Participation</CardTitle>
            <CardDescription>Your most frequent committees</CardDescription>
          </CardHeader>
          <CardContent>
            {committeeData.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No committees recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {committeeData.map((c) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {c.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{
                            width: `${(c.count / committeeData[0].count) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="w-6 text-right text-sm font-medium tabular-nums text-muted-foreground">
                        {c.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Activity</CardTitle>
            <CardDescription>Your recent activity timeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2" style={{ height: 140 }}>
              {monthlyActivity.map((m) => (
                <div
                  key={m.month}
                  className="flex min-w-0 flex-1 flex-col items-center gap-1"
                >
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {m.count}
                  </span>
                  <div
                    className="w-full rounded-t-sm bg-brand-500/70 transition-all"
                    style={{
                      height: `${(m.count / maxActivity) * 100}px`,
                      minHeight: m.count > 0 ? 4 : 0,
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {m.month}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Simulations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Simulations</CardTitle>
            <CardDescription>Your latest committee simulations</CardDescription>
          </CardHeader>
          <CardContent>
            {simulations.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No simulations yet. Try the simulator to practice!
              </p>
            ) : (
              <div className="space-y-3">
                {simulations.map((sim) => (
                  <div
                    key={sim.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {sim.committeeName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sim.topic || "No topic"} · {sim.country || "—"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        sim.status === "FINISHED" ? "default" : "secondary"
                      }
                      className="ml-4 shrink-0"
                    >
                      {sim.status.toLowerCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
