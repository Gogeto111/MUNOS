import { NextResponse } from "next/server";

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

    const submission = {
      name,
      organizer,
      website: website || null,
      country,
      city: city || null,
      startDate: startDate || null,
      endDate: endDate || null,
      fee: fee || null,
      description: description || null,
      committees: committees ? committees.split(",").map((c: string) => c.trim()) : [],
      email: email || null,
      submittedAt: new Date().toISOString(),
      status: "pending",
    };

    // TODO: Store in database (PendingConference table) or send to admin email
    // For now, log to console
    console.log("New conference submission:", JSON.stringify(submission, null, 2));

    return NextResponse.json({
      success: true,
      message: "Conference submitted successfully. We'll review it and add it to the database.",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 },
    );
  }
}
