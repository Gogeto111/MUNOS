"use client";

import { useEffect, useState } from "react";
import { ListChecks } from "lucide-react";
import { getWorkspaceProgress } from "@/lib/actions/workspace";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function WorkspaceProgress({
  workspaceId,
  initialDone,
  initialTotal,
  initialPercent,
}: {
  workspaceId: string;
  initialDone: number;
  initialTotal: number;
  initialPercent: number;
}) {
  const [done, setDone] = useState(initialDone);
  const [total, setTotal] = useState(initialTotal);
  const [percent, setPercent] = useState(initialPercent);

  useEffect(() => {
    void getWorkspaceProgress(workspaceId).then((res) => {
      if (res.status === "success" && res.data) {
        setDone(res.data.done);
        setTotal(res.data.total);
        setPercent(res.data.percent);
      }
    });
  }, [workspaceId]);

  const color =
    percent >= 50
      ? "bg-green-500"
      : percent >= 25
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <ListChecks className="size-4 text-muted-foreground" />
          Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              color,
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {done} of {total} tasks completed
          </span>
          <span className="font-medium text-foreground">{percent}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
