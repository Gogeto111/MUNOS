import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace | MUNOS",
  description: "Resolution templates, position papers, research guides, and more.",
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
