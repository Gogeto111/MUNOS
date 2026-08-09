import { NextResponse } from "next/server";
import { getDb } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, organizer, website, country, city, startDate, endDate, fee, description, committees, email } = body;

    if (!name || !organizer || !country) {
      return NextResponse.json(
        { error: "Name, organizer, and country are required" },
        { status: 400 },
      );
    }

    const committeeList = committees
      ? committees.split(",").map((c: string) => c.trim()).filter(Boolean)
      : [];

    const pending = await getDb().pendingConference.create({
      data: {
        name,
        organizer,
        website: website || null,
        country,
        city: city || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        fee: fee ? parseFloat(fee) : null,
        description: description || null,
        committees: committeeList,
        email: email || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Conference submitted successfully. We'll review it and add it to the database.",
      id: pending.id,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 },
    );
  }
}
