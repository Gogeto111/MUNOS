import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAuthConfigured } from "@/lib/public-env";
import { getDb } from "@/lib/prisma";
import { uploadWorkspaceFile } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Signed-in upload endpoint for personal workspace files.
 * Any authenticated user may upload; the caller must own the target
 * workspace. File bytes are stored, the returned metadata is registered
 * via the `registerAttachment` server action.
 */
export async function POST(request: NextRequest) {
  if (isAuthConfigured) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const file = form.get("file");
  const workspaceId = String(form.get("workspaceId") ?? "").replace(/[^a-z0-9-_]/gi, "");
  const folder = String(form.get("folder") ?? "workspaces").replace(/[^a-z0-9-_]/gi, "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
  }

  if (isAuthConfigured) {
    const session = await auth();
    const owner = await getDb().user.findUnique({
      where: { clerkId: session.userId ?? "" },
      select: { id: true },
    });
    const workspace = owner
      ? await getDb().workspace.findFirst({
          where: { id: workspaceId, userId: owner.id },
          select: { id: true },
        })
      : null;
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 403 });
    }
  }

  const result = await uploadWorkspaceFile(file, folder || "workspaces");
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    url: result.url,
    key: result.key,
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  });
}
