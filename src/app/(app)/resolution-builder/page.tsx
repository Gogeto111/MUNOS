import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResolutionBuilder } from "@/components/workspace/resolution-builder";

export const metadata = { title: "Resolution Builder | MUNOS" };

export default function ResolutionBuilderPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/workspaces" className="inline-flex items-center gap-1.5 hover:text-foreground">
          <ArrowLeft className="size-4" />
          Workspaces
        </Link>
      </div>
      <ResolutionBuilder />
    </div>
  );
}
