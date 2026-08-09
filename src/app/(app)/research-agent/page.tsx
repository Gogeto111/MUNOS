import type { Metadata } from "next";
import { ResearchAgent } from "@/components/research/research-agent";

export const metadata: Metadata = {
  title: "Research Agent | MUNOS",
};

export default function ResearchAgentPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Research Agent</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate comprehensive 8-page research dossiers with country positions, UN frameworks, and sourced claims.
        </p>
      </div>
      <ResearchAgent />
    </div>
  );
}
