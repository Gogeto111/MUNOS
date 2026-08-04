import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ComingSoon({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <Card className="flex min-h-72 flex-col items-center justify-center border-dashed text-center">
        <CardHeader className="items-center">
          <div className="mb-3 grid size-12 place-items-center rounded-2xl border border-brand-500/25 bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Icon className="size-6" />
          </div>
          <CardTitle className="text-lg">Coming in this phase</CardTitle>
          <CardDescription className="mx-auto max-w-sm">
            This section is part of the MUNOS Phase 1 roadmap and is being
            built right after the profile editor.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
