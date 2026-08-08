import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Committee Simulator",
  description:
    "Practice MUN debate with AI-powered delegates. Pick a committee, topic, and country, then deliver speeches in real time.",
  openGraph: {
    title: "AI Committee Simulator | MUNOS",
    description:
      "Practice MUN debate with AI-powered delegates in real time.",
  },
};

export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
