import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/prisma";
import { buildIcs, conferenceCalendarPayload } from "@/lib/ics";
import { publicEnv } from "@/lib/public-env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const conference = await getDb().conference.findUnique({
    where: { id },
    select: {
      name: true,
      slug: true,
      description: true,
      startDate: true,
      endDate: true,
      website: true,
      email: true,
      venue: {
        select: { name: true, city: true, state: true, country: true },
      },
      organizer: {
        select: { name: true, email: true, website: true },
      },
    },
  });

  if (!conference) {
    return NextResponse.json({ error: "Conference not found." }, { status: 404 });
  }

  const baseUrl = publicEnv.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const payload = conferenceCalendarPayload(
    conference,
    conference.slug,
    conference.venue,
    baseUrl,
  );

  const icsContent = buildIcs({
    ...payload,
    url: conference.website ?? payload.url,
  });

  const filename = `${conference.slug}.ics`;

  return new NextResponse(icsContent, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
