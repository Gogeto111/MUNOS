import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-muted/60">
        <Icon className="size-8 text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-sm font-semibold">{title}</h3>
      <p className="mb-4 max-w-sm text-xs text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
