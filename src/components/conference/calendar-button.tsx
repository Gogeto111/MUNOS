"use client";

import * as React from "react";
import { Calendar, CalendarPlus, Download, Mail } from "lucide-react";
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
import {
  googleCalendarUrl,
  outlookCalendarUrl,
  icsDownloadUrl,
  type ConferenceCalendarPayload,
} from "@/lib/ics";
import { cn } from "@/lib/utils";

export function CalendarButton({
  payload,
  className,
}: {
  payload: ConferenceCalendarPayload;
  className?: string;
}) {
  const download = () => {
    try {
      const url = icsDownloadUrl(payload);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      toast.success("Calendar file downloaded");
    } catch {
      toast.error("Could not download the calendar file.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-1.5 rounded-full", className)} aria-label="Add to calendar">
          <CalendarPlus className="size-4" />
          Add to calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-1.5">
          <Calendar className="size-4" />
          Add to calendar
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={googleCalendarUrl(payload)} target="_blank" rel="noopener noreferrer">
            Google Calendar
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={outlookCalendarUrl(payload)} target="_blank" rel="noopener noreferrer">
            <Mail className="mr-2 size-4" />
            Outlook
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={download}>
          <Download className="mr-2 size-4" />
          Download .ics file
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
