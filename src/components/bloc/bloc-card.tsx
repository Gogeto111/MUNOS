"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  LogOut,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Bloc } from "@/lib/bloc-types";
import { leaveBloc, dissolveBloc } from "@/lib/bloc-store";
import { BlocChat } from "./bloc-chat";

const STANCE_COLORS: Record<string, string> = {
  pro: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  con: "bg-red-500/15 text-red-400 border-red-500/30",
  neutral: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

const STANCE_LABELS: Record<string, string> = {
  pro: "Pro",
  con: "Con",
  neutral: "Neutral",
};

interface BlocCardProps {
  bloc: Bloc;
  currentUserId?: string;
  onUpdate?: () => void;
  compact?: boolean;
}

export function BlocCard({
  bloc,
  currentUserId,
  onUpdate,
  compact,
}: BlocCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isMember = currentUserId
    ? bloc.members.some((m) => m.userId === currentUserId)
    : false;
  const isCreator = currentUserId ? bloc.createdBy === currentUserId : false;

  const handleLeave = () => {
    if (!currentUserId) return;
    leaveBloc(currentUserId);
    onUpdate?.();
  };

  const handleDissolve = () => {
    dissolveBloc(bloc.id);
    onUpdate?.();
  };

  const lastMessages = bloc.messages.slice(-3);

  return (
    <Card className="overflow-hidden transition-all hover:ring-2 hover:ring-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
              style={{ backgroundColor: `${bloc.color}20` }}
            >
              {bloc.emoji}
            </div>
            <div>
              <h3 className="font-semibold leading-tight">{bloc.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {bloc.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("text-xs", STANCE_COLORS[bloc.stance])}
            >
              {STANCE_LABELS[bloc.stance]}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {bloc.members.length}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {!compact && lastMessages.length > 0 && (
          <div className="space-y-1.5 rounded-lg bg-muted/50 p-2.5">
            {lastMessages.map((msg) => (
              <p key={msg.id} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {msg.senderName.split(" ")[0]}:
                </span>{" "}
                {msg.content.length > 80
                  ? msg.content.slice(0, 80) + "..."
                  : msg.content}
              </p>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {bloc.members.map((m) => (
            <div
              key={m.userId}
              className="flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs"
            >
              <span className="font-medium">{m.country}</span>
              <span className="text-muted-foreground">
                {m.displayName.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          {!compact && (
            <>
              {isMember && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setExpanded(!expanded)}
                  className="gap-1.5"
                >
                  {expanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  {expanded ? "Hide Chat" : "Open Chat"}
                </Button>
              )}
              {isMember && !isCreator && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLeave}
                  className="gap-1.5 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-3 w-3" />
                  Leave
                </Button>
              )}
              {isCreator && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDissolve}
                  className="gap-1.5 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                  Dissolve
                </Button>
              )}
            </>
          )}
          {compact && !isMember && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExpanded(!expanded)}
              className="gap-1.5"
            >
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              Details
            </Button>
          )}
        </div>

        {expanded && isMember && (
          <div className="pt-2">
            <BlocChat bloc={bloc} currentUserId={currentUserId} />
          </div>
        )}

        {expanded && !isMember && (
          <div className="pt-2 text-xs text-muted-foreground">
            <p className="font-medium">{bloc.description}</p>
            <p className="mt-1">
              Created {new Date(bloc.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
