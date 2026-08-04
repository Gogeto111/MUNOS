"use client";

import { ExternalLink, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveButton } from "@/components/conference/save-button";
import { ShareButton } from "@/components/conference/share-button";
import { ReminderButton } from "@/components/conference/remind-button";
import { CalendarButton } from "@/components/conference/calendar-button";
import type { ConferenceCalendarPayload } from "@/lib/ics";

export function ConferenceActions({
  conferenceId,
  website,
  registrationOpen,
  startDate,
  registrationDeadline,
  calendarPayload,
  shareUrl,
  shareTitle,
}: {
  conferenceId: string;
  website: string | null;
  registrationOpen: boolean;
  startDate: string;
  registrationDeadline: string | null;
  calendarPayload: ConferenceCalendarPayload;
  shareUrl: string;
  shareTitle: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {website ? (
        <Button asChild className="gap-1.5 rounded-full">
          <a href={website} target="_blank" rel="noopener noreferrer">
            {registrationOpen ? "Register now" : "Conference website"}
            <ExternalLink className="size-4" />
          </a>
        </Button>
      ) : (
        <Button disabled className="gap-1.5 rounded-full">
          <LoaderCircle className="size-4" />
          Registration link coming soon
        </Button>
      )}
      <CalendarButton payload={calendarPayload} />
      <SaveButton conferenceId={conferenceId} className="h-9 w-9" />
      <ShareButton url={shareUrl} title={shareTitle} />
      <ReminderButton
        conferenceId={conferenceId}
        startDate={startDate}
        registrationDeadline={registrationDeadline}
      />
    </div>
  );
}
