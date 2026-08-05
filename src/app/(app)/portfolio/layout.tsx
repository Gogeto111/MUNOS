import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio | MUNOS",
  description: "Your public MUN delegate portfolio.",
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
