import type { Metadata } from "next";
import { HomeDashboard } from "@/components/app/home-dashboard";

export const metadata: Metadata = {
  title: "Home | MUNOS",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <HomeDashboard />
    </div>
  );
}
