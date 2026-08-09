import type { Metadata } from "next";
import { ResearchAgent } from "@/components/research/research-agent";
import { KnowledgeBase } from "@/components/shared/knowledge-base";

export const metadata = {
  title: "Research | MUNOS",
};

export default function ResearchAgentPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Research</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deep country, committee, and agenda intelligence — plus the MUN knowledge base.
        </p>
      </div>
      <ResearchAgent />
      <KnowledgeBase />
    </div>
  );
}
