import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certificates | MUNOS",
  description: "Upload, preview, and organize your MUN certificates.",
};

export default function CertificatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
