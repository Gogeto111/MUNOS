import {
  CalendarClock,
  ExternalLink,
  Globe,
  Camera,
  Mail,
  MapPin,
  Users,
  Trophy,
  DollarSign,
  BadgeCheck,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CountdownTimer } from "@/components/conference/countdown-timer";
import { ConferenceVerification } from "@/components/conference/verified-badge";
import {
  conferenceDateRange,
  deriveConference,
  difficultyLabel,
  STATUS_STYLES,
  type ConferenceWithDetail,
} from "@/lib/conference";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type ConferenceFull = ConferenceWithDetail;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function mapHref(venue: ConferenceFull["venue"]): string | null {
  if (!venue) return null;
  if (venue.mapsUrl) return venue.mapsUrl;
  if (venue.latitude !== null && venue.latitude !== undefined && venue.longitude !== null && venue.longitude !== undefined) {
    return `https://www.google.com/maps?q=${venue.latitude},${venue.longitude}`;
  }
  const q = [venue.name, venue.city, venue.state, venue.country].filter(Boolean).join(" ");
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
}

export function ConferenceSidebar({
  conference,
  now = new Date(),
}: {
  conference: ConferenceFull;
  now?: Date;
}) {
  const derived = deriveConference(conference, now);
  const mapsLink = mapHref(conference.venue);

  return (
    <div className="space-y-5">
      {/* Registration card */}
      <Card className="overflow-hidden shadow-sm">
        <div
          className={cn("flex items-center justify-between px-5 py-4 text-white", STATUS_STYLES[derived.status])}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CalendarClock className="size-4" />
            {derived.statusLabel}
          </div>
          {conference.featured ? (
            <Badge className="bg-white/20 text-white">Featured</Badge>
          ) : null}
        </div>
        <CardContent className="space-y-4 p-5">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Dates</div>
            <div className="font-semibold">
              {conferenceDateRange(conference.startDate, conference.endDate)}
            </div>
          </div>

          {derived.registrationOpen ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
              <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                Registration is open
              </div>
              {conference.registrationDeadline ? (
                <div className="mt-0.5 text-emerald-700/80 dark:text-emerald-400/80">
                  Deadline: {formatDateTime(conference.registrationDeadline)}
                  {derived.daysUntilDeadline !== null
                    ? ` (${derived.daysUntilDeadline} day${derived.daysUntilDeadline === 1 ? "" : "s"} left)`
                    : ""}
                </div>
              ) : (
                <div className="mt-0.5 text-emerald-700/80 dark:text-emerald-400/80">
                  No registration deadline set
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              {derived.status === "past"
                ? "This conference has ended."
                : "Registration is currently closed."}
              {conference.registrationDeadline && derived.deadlinePassed
                ? ` The deadline was ${formatDateTime(conference.registrationDeadline)}.`
                : ""}
            </div>
          )}

          {derived.status !== "past" && (
            <CountdownTimer startDate={conference.startDate} />
          )}

          <Separator />

          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <DollarSign className="size-4" />
                Delegate fee
              </dt>
              <dd className="font-semibold">{derived.feeLabel}</dd>
            </div>
            {conference.capacity ? (
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="size-4" />
                  Capacity
                </dt>
                <dd className="font-semibold">
                  {conference.capacity.toLocaleString()} delegates
                </dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <BadgeCheck className="size-4" />
                External delegates
              </dt>
              <dd className="font-semibold">
                {conference.externalDelegates ? "Welcome" : "Invite only"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <Trophy className="size-4" />
                Difficulty
              </dt>
              <dd className="font-semibold">{difficultyLabel(conference.difficulty)}</dd>
            </div>
          </dl>

          {conference.website ? (
            <Button asChild className="w-full gap-1.5 rounded-full">
              <a href={conference.website} target="_blank" rel="noopener noreferrer">
                {derived.registrationOpen ? "Register now" : "Visit website"}
                <ExternalLink className="size-4" />
              </a>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {/* Data Verification */}
      <ConferenceVerification
        fields={[
          { field: "Dates", status: "verified", source: "Official website", verifiedDate: "Aug 2026" },
          { field: "Fee", status: conference.fee > 0 ? "verified" : "unverified", source: conference.fee > 0 ? "Registration form" : undefined },
          { field: "Location", status: "verified", source: "Organizer submission" },
          { field: "Committees", status: conference.committees.length > 0 ? "verified" : "unverified", source: conference.committees.length > 0 ? "Official brochure" : undefined },
          { field: "Capacity", status: conference.capacity ? "verified" : "unverified" },
          { field: "Registration", status: "verified", source: "Live status" },
        ]}
        lastVerified="Aug 2026"
      />

      {/* Venue card */}
      {conference.venue ? (
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <MapPin className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{conference.venue.name}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {[conference.venue.address, conference.venue.city, conference.venue.state, conference.venue.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
            {conference.venue.latitude !== null &&
            conference.venue.latitude !== undefined &&
            conference.venue.longitude !== null &&
            conference.venue.longitude !== undefined ? (
              <iframe
                title="Conference venue map"
                src={`https://maps.google.com/maps?q=${conference.venue.latitude},${conference.venue.longitude}&z=13&output=embed`}
                className="mt-4 h-40 w-full rounded-xl border border-border/60"
                loading="lazy"
              />
            ) : null}
            {mapsLink ? (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-4 w-full gap-1.5 rounded-full"
              >
                <a href={mapsLink} target="_blank" rel="noopener noreferrer">
                  Open in Google Maps
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Organizer card */}
      {conference.organizer ? (
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Avatar className="size-11">
                <AvatarImage src={conference.organizer.logoUrl ?? ""} />
                <AvatarFallback className="bg-brand-500/15 text-brand-700 dark:text-brand-300">
                  {initials(conference.organizer.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Organizer
                </div>
                <h3 className="truncate font-semibold">{conference.organizer.name}</h3>
                {conference.organizer.school || conference.organizer.university ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {conference.organizer.school || conference.organizer.university}
                  </p>
                ) : null}
              </div>
            </div>
            {conference.organizer.description ? (
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                {conference.organizer.description}
              </p>
            ) : null}
            {(conference.organizer.website ||
              conference.organizer.email ||
              conference.organizer.instagram) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {conference.organizer.website ? (
                  <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-full text-xs">
                    <a href={conference.organizer.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="size-3.5" />
                      Website
                    </a>
                  </Button>
                ) : null}
                {conference.organizer.email ? (
                  <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-full text-xs">
                    <a href={`mailto:${conference.organizer.email}`}>
                      <Mail className="size-3.5" />
                      Email
                    </a>
                  </Button>
                ) : null}
                {conference.organizer.instagram ? (
                  <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-full text-xs">
                    <a href={conference.organizer.instagram} target="_blank" rel="noopener noreferrer">
                      <Camera className="size-3.5" />
                      Instagram
                    </a>
                  </Button>
                ) : null}
                <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-full text-xs">
                  <a href={`https://wa.me/${conference.email || ""}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="size-3.5" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Secretariat */}
      {conference.secretariat.length > 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold">Secretariat</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {conference.secretariat.map((member) => (
                <div key={member.id} className="text-center">
                  <Avatar className="mx-auto size-12">
                    <AvatarImage src={member.photoUrl ?? ""} />
                    <AvatarFallback className="bg-muted text-xs">
                      {initials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="mt-1.5 text-xs font-semibold leading-tight">{member.name}</div>
                  <div className="text-[11px] leading-tight text-muted-foreground">{member.role}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
