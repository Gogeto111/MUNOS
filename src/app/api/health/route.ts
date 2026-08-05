import { NextResponse } from "next/server";
import { getHealthReport } from "@/lib/health";

export async function GET() {
  const report = await getHealthReport();
  const statusCode = report.status === "unhealthy" ? 503 : 200;

  return NextResponse.json(report, { status: statusCode });
}
