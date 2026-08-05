import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organizer | MUNOS",
  description: "Conference management dashboard for MUN organizers.",
};

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
