"use client";

import { useState } from "react";
import { Radio, MessageSquare, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssistantChat } from "./assistant-chat";
import { MidSessionDashboard } from "./mid-session-dashboard";

type Mode = "chat" | "mid-session";

export function AssistantShell() {
  const [mode, setMode] = useState<Mode>("chat");

  return (
    <div className="flex h-full flex-col">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 border-b border-border/50 px-4 py-2">
        <button
          onClick={() => setMode("chat")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "chat"
              ? "bg-brand-500/10 text-brand-600"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Chat
        </button>
        <button
          onClick={() => setMode("mid-session")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "mid-session"
              ? "bg-green-500/10 text-green-600"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Radio className="h-3.5 w-3.5" />
          Mid-Session
          <Zap className="h-3 w-3" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {mode === "chat" ? <AssistantChat /> : <MidSessionDashboard />}
      </div>
    </div>
  );
}
