import type { Metadata } from "next";
import { AssistantChat } from "@/components/app/assistant-chat";

export const metadata: Metadata = {
  title: "AI Assistant | MUNOS",
};

export default function AssistantPage() {
  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col">
      <AssistantChat />
    </div>
  );
}
