import type { Metadata } from "next";
import { PassportDashboard } from "@/components/passport/passport-dashboard";

export const metadata: Metadata = {
  title: "MUN Passport | MUNOS",
};

export default function PassportPage() {
  return (
    <div className="space-y-6">
      <PassportDashboard />
    </div>
  );
}
