import type { Metadata } from "next";
import { SituationRoom } from "@/components/app/situation-room";

export const metadata: Metadata = {
  title: "Situation Room | MUNOS",
};

export default function SituationRoomPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Situation Room</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live context during committee sessions — breaking news, talking points, and real-time POIs.
        </p>
      </div>
      <SituationRoom />
    </div>
  );
}
