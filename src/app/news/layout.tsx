import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI News Engine | MUNOS",
  description: "UN feeds, global events, and AI-powered summaries for MUN preparation.",
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
