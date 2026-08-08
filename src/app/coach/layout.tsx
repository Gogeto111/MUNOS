import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Video Coach",
  description:
    "Get instant AI-powered feedback on your MUN speeches — confidence, clarity, persuasion, and structure scoring with actionable suggestions.",
  openGraph: {
    title: "AI Video Coach | MUNOS",
    description:
      "AI-powered speech analysis for MUN delegates. Score and improve your delivery.",
  },
};

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
