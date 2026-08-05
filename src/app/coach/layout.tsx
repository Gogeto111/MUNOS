import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Video Coach | MUNOS",
  description: "Upload speeches, get AI-powered feedback on delivery, persuasion, and clarity.",
};

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return children;
}
