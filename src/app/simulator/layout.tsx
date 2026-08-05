import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Simulator | MUNOS",
  description: "Practice MUN speeches and debates with AI-powered committee simulations.",
};

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
