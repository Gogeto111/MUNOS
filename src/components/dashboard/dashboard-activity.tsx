"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
} from "lucide-react";

interface Trend {
  label: string;
  current: number;
  previous: number;
  icon: React.ElementType;
  color: string;
}

interface DashboardActivityProps {
  trends: Trend[];
  recentActions: Array<{
    id: string;
    action: string;
    target: string;
    timestamp: string;
    user: string;
  }>;
}

export function DashboardActivity({ trends, recentActions }: DashboardActivityProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="size-4" /> Activity Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {trends.map((trend) => {
            const change = trend.current - trend.previous;
            const percent = trend.previous > 0 ? Math.round((change / trend.previous) * 100) : 0;
            const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;

            return (
              <div key={trend.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`grid size-8 place-items-center rounded-lg ${trend.color}`}>
                    <trend.icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{trend.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {trend.previous} last month
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold tabular-nums">{trend.current}</p>
                  <p className={`flex items-center gap-1 text-xs ${change > 0 ? "text-emerald-600" : change < 0 ? "text-red-600" : "text-muted-foreground"}`}>
                    <TrendIcon className="size-3" />
                    {change > 0 ? "+" : ""}{change} ({percent > 0 ? "+" : ""}{percent}%)
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Calendar className="size-4" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActions.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {recentActions.map((action) => (
                <div key={action.id} className="flex items-start gap-3">
                  <div className="mt-1 size-2 shrink-0 rounded-full bg-brand-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{action.user}</span>{" "}
                      <span className="text-muted-foreground">{action.action}</span>{" "}
                      <span className="font-medium">{action.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{action.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
