import type { Conference, Venue } from "@/generated/prisma/browser";

export interface CalendarEventInput {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  url?: string;
}

function toIcsDate(date: Date, allDay: boolean): string {
  if (allDay) {
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(date.getUTCDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  }
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function unfoldLines(lines: string[]): string {
  return lines.map((line) => (line.length > 60 ? line.replace(/(.{60})/g, "$1\r\n ") : line)).join("\r\n");
}

/** Builds a valid iCalendar (RFC 5545) document for a conference. */
export function buildIcs(event: CalendarEventInput): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MUNOS//MUN Conference//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:munos-${toIcsDate(event.startDate, event.allDay ?? false)}-${escapeIcs(event.title).replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)}@munos.app`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    event.allDay
      ? `DTSTART;VALUE=DATE:${toIcsDate(event.startDate, true)}`
      : `DTSTART:${toIcsDate(event.startDate, false)}`,
    event.allDay
      ? `DTEND;VALUE=DATE:${toIcsDate(new Date(event.endDate.getTime() + 86_400_000), true)}`
      : `DTEND:${toIcsDate(event.endDate, false)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
  ];

  if (event.description) lines.push(`DESCRIPTION:${escapeIcs(event.description)}`);
  if (event.location) lines.push(`LOCATION:${escapeIcs(event.location)}`);
  if (event.url) lines.push(`URL:${event.url}`);
  if (event.allDay) lines.push("X-MICROSOFT-CDO-ALLDAYEVENT:TRUE");

  lines.push("END:VEVENT", "END:VCALENDAR");
  return unfoldLines(lines);
}

export function icsDownloadUrl(event: CalendarEventInput): string {
  const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" });
  return URL.createObjectURL(blob);
}

function googleDateParam(date: Date, allDay: boolean): string {
  if (allDay) {
    return date.toISOString().slice(0, 10).replace(/-/g, "");
  }
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** "Add to Google Calendar" link. */
export function googleCalendarUrl(event: CalendarEventInput): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${googleDateParam(event.startDate, event.allDay ?? false)}/${
      event.allDay
        ? new Date(event.endDate.getTime() + 86_400_000).toISOString().slice(0, 10).replace(/-/g, "")
        : googleDateParam(event.endDate, false)
    }`,
    details: event.description ?? "",
  });
  if (event.location) params.set("location", event.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** "Add to Outlook" deeplink. */
export function outlookCalendarUrl(event: CalendarEventInput): string {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    startdt: event.startDate.toISOString(),
    enddt: event.endDate.toISOString(),
    subject: event.title,
    body: event.description ?? "",
  });
  if (event.location) params.set("location", event.location);
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export interface ConferenceCalendarPayload {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  url: string;
}

export function conferenceCalendarPayload(
  conference: Pick<Conference, "name" | "description" | "startDate" | "endDate">,
  slug: string,
  venue: Pick<Venue, "name" | "city" | "state" | "country"> | null,
  baseUrl: string,
): ConferenceCalendarPayload {
  const location = venue
    ? [venue.name, venue.city, venue.state, venue.country].filter(Boolean).join(", ")
    : "";
  return {
    title: conference.name,
    description: conference.description.slice(0, 400),
    location,
    startDate: conference.startDate,
    endDate: conference.endDate,
    allDay: true,
    url: `${baseUrl.replace(/\/$/, "")}/conference/${slug}`,
  };
}
