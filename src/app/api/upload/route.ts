import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAuthConfigured } from "@/lib/public-env";
import { getDb } from "@/lib/prisma";
import { uploadConferenceAsset } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isAdmin(): Promise<boolean> {
  if (!isAuthConfigured) return true;
  const { userId } = await auth();
  if (!userId) return false;
  const user = await getDb().user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

/**
 * Internal asset upload endpoint used by the admin panel.
 * Persists to Supabase Storage when configured, otherwise to the
 * local `public/uploads` directory.
 */
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const file = form.get("file");
  const folder = String(form.get("folder") ?? "conferences").replace(/[^a-z0-9-_]/gi, "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const result = await uploadConferenceAsset(file, folder || "conferences");
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ url: result.url, key: result.key });
}
