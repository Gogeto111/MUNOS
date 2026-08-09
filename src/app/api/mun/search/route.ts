import { NextResponse } from "next/server";
import { getDb } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  // Search the database for matching conferences
  const conferences = await getDb().conference.findMany({
    where: {
      published: true,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { tagline: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { city: { contains: query, mode: "insensitive" } },
        { country: { contains: query, mode: "insensitive" } },
        { theme: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      committees: { select: { name: true } },
      venue: { select: { name: true, city: true, country: true } },
    },
    take: 20,
    orderBy: { startDate: "asc" },
  });

  const results = conferences.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    tagline: c.tagline,
    city: c.city,
    country: c.country,
    startDate: c.startDate,
    endDate: c.endDate,
    fee: c.fee,
    currency: c.currency,
    format: c.format,
    difficulty: c.difficulty,
    venue: c.venue?.name ?? null,
    committees: c.committees.map((comm) => comm.name),
    source: "database",
  }));

  return NextResponse.json({ results, total: results.length });
}
