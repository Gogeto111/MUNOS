import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Social | MUNOS",
  description: "Connect with delegates, share research, and build your MUN network.",
};

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  return children;
}
