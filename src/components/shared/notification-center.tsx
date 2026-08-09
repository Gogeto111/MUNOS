"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Calendar,
  Trophy,
  FileText,
  AlertCircle,
  Check,
  Clock,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  clientGetNotifications,
  clientGetUnreadCount,
  clientMarkAsRead,
  clientMarkAllAsRead,
  type NotificationItem,
} from "@/lib/notification-helpers";

const TYPE_CONFIG: Record<
  NotificationItem["type"],
  { icon: typeof Bell; color: string; bg: string }
> = {
  conference_update: {
    icon: Calendar,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 dark:bg-blue-400/10",
  },
  submission_status: {
    icon: FileText,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10 dark:bg-orange-400/10",
  },
  achievement: {
    icon: Trophy,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-400/10",
  },
  reminder: {
    icon: Clock,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10 dark:bg-violet-400/10",
  },
  system: {
    icon: AlertCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10 dark:bg-red-400/10",
  },
};

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(() => {
    const all = clientGetNotifications();
    setNotifications(all);
    setUnreadCount(all.filter((n) => !n.read).length);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleMarkAsRead = (id: string) => {
    clientMarkAsRead(id);
    refresh();
  };

  const handleMarkAllAsRead = () => {
    clientMarkAllAsRead();
    refresh();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell
            className={cn(
              "size-4 transition-transform",
              unreadCount > 0 && "animate-bounce",
            )}
          />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Check className="size-3" />
              Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <div className="rounded-full bg-muted/60 p-3">
              <Inbox className="size-5 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">
              No notifications yet
            </p>
            <p className="text-xs text-muted-foreground/60">
              Updates will appear here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="divide-y divide-border/40">
              {notifications.map((n) => {
                const config = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
                const Icon = config.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => !n.read && handleMarkAsRead(n.id)}
                    className={cn(
                      "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                      !n.read && "bg-muted/20",
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                        config.bg,
                      )}
                    >
                      <Icon className={cn("size-4", config.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm leading-snug",
                            n.read
                              ? "text-muted-foreground"
                              : "font-medium text-foreground",
                          )}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="mt-1 size-2 shrink-0 rounded-full bg-blue-500" />
                        )}
                      </div>
                      {n.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground/80">
                          {n.description}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground/60">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
