import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MUNOS OS | MUNOS",
  description: "Your unified platform for MUN — research, simulation, networking, and achievements.",
};

export default function OSLayout({ children }: { children: React.ReactNode }) {
  return children;
}
