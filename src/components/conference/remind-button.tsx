"use client";

import * as React from "react";
import { Bell, BellRing, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useReminders, REMINDER_LABELS } from "@/hooks/use-reminders";
import { cn } from "@/lib/utils";
import type { ReminderType } from "@/generated/prisma/browser";

function defaultRemindAt(
  type: ReminderType,
  startDate: string,
  registrationDeadline: string | null,
): string {
  const DAY = 86_400_000;
  const deadline = registrationDeadline ? new Date(registrationDeadline).getTime() : null;
  const start = new Date(startDate).getTime();
  const offset =
    type === "REGISTRATION_DEADLINE"
      ? deadline !== null
        ? deadline - DAY
        : start - 7 * DAY
      : type === "COUNTRY_ALLOCATION"
        ? start - 7 * DAY
        : start - DAY;
  return new Date(offset).toISOString();
}

export function ReminderButton({
  conferenceId,
  startDate,
  registrationDeadline,
  className,
}: {
  conferenceId: string;
  startDate: string;
  registrationDeadline: string | null;
  className?: string;
}) {
  const { reminders, set, remove, permission, requestPermission } =
    useReminders(conferenceId);
  const hasAny = reminders.length > 0;
  const [open, setOpen] = React.useState(false);

  const setFor = async (type: ReminderType) => {
    await set(type, defaultRemindAt(type, startDate, registrationDeadline));
    if (permission !== "granted") {
      await requestPermission();
    }
  };

  const removeFor = async (type: ReminderType) => {
    await remove(type);
    toast.success(`${REMINDER_LABELS[type]} reminder removed`);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={hasAny ? "default" : "outline"}
          size="sm"
          className={cn("gap-1.5 rounded-full", hasAny && "bg-brand-500 text-white hover:bg-brand-600", className)}
          aria-label="Set a reminder"
        >
          {hasAny ? <BellRing className="size-4" /> : <Bell className="size-4" />}
          {hasAny ? "Reminders set" : "Remind me"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Remind me before the conference</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {permission !== "granted" ? (
          <div className="px-2 pb-1 pt-1.5">
            <p className="text-xs text-muted-foreground">
              Browser notifications are off. Enable them so reminders can reach you.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => void requestPermission()}
            >
              Enable notifications
            </Button>
          </div>
        ) : null}
        <div className="px-1 py-1">
          {(["REGISTRATION_DEADLINE", "COUNTRY_ALLOCATION", "CONFERENCE_STARTS"] as ReminderType[]).map(
            (type) => {
              const active = reminders.some((r) => r.type === type);
              return (
                <DropdownMenuItem
                  key={type}
                  onSelect={() => {
                    if (active) void removeFor(type);
                    else void setFor(type);
                  }}
                >
                  <span className="flex-1">{REMINDER_LABELS[type]}</span>
                  {active ? <Check className="size-4 text-brand-500" /> : null}
                </DropdownMenuItem>
              );
            },
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
