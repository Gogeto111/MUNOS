"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Bloc } from "@/lib/bloc-types";
import { addBlocMessage } from "@/lib/bloc-store";

interface BlocChatProps {
  bloc: Bloc;
  currentUserId?: string;
}

export function BlocChat({ bloc, currentUserId }: BlocChatProps) {
  const [messages, setMessages] = useState(bloc.messages);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(bloc.messages);
  }, [bloc.messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !currentUserId) return;
    const member = bloc.members.find((m) => m.userId === currentUserId);
    const msg = addBlocMessage(bloc.id, {
      senderId: currentUserId,
      senderName: member?.displayName ?? "Unknown",
      content: input.trim(),
    });
    if (msg) {
      setMessages((prev) => [...prev, msg]);
    }
    setInput("");
  };

  return (
    <div className="flex flex-col rounded-lg border bg-muted/30">
      <div
        ref={scrollRef}
        className="h-48 overflow-y-auto p-3"
      >
        {messages.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            No messages yet. Start the conversation!
          </p>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className="text-xs">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-medium text-foreground">
                    {msg.senderName.split(" ")[0]}
                  </span>
                  <span className="text-muted-foreground/60">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-0.5 text-muted-foreground">{msg.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 border-t p-2">
        <Input
          placeholder="Share a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="h-8 text-xs"
        />
        <Button
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
