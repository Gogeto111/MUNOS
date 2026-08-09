import type { Metadata } from "next";
import { BlocDashboard } from "@/components/bloc/bloc-dashboard";

export const metadata: Metadata = {
  title: "Blocs | MUNOS",
};

export default function BlocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Blocs & Alliances</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Form blocs, coordinate positions, and share notes with allied delegates.
        </p>
      </div>
      <BlocDashboard />
    </div>
  );
}
