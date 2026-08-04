import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceDetailLoading() {
  return (
    <div className="flex h-[calc(100dvh-4rem)]">
      <div className="hidden w-60 border-r border-border/60 p-4 space-y-3 lg:block">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded" />
        ))}
      </div>
      <div className="flex-1 p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}