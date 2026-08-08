import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const conferences = await getDb().conference.findMany({
    where: {
      published: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { country: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      city: true,
      country: true,
      slug: true,
    },
    take: 8,
    orderBy: [
      { featured: "desc" },
      { startDate: "asc" },
    ],
  });

  return NextResponse.json(conferences);
}
