import type { Metadata } from "next";
import { AssistantShell } from "@/components/app/assistant-shell";

export const metadata: Metadata = {
  title: "AI Assistant | MUNOS",
};

export default function AssistantPage() {
  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col">
      <AssistantShell />
    </div>
  );
}
