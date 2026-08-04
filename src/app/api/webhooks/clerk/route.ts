import { NextResponse } from "next/server";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { env } from "@/lib/env";
import { getDb } from "@/lib/prisma";
import { removeUserStoragePrefix } from "@/lib/storage";

export const runtime = "nodejs";

type UserLifecycleEvent = Extract<
  WebhookEvent,
  { type: "user.created" | "user.updated" }
>;

function resolvePrimaryEmail(user: UserLifecycleEvent["data"]): string {
  const primaryId =
    "primary_email_address_id" in user ? user.primary_email_address_id : null;
  const primary =
    user.email_addresses.find((e) => e.id === primaryId) ??
    user.email_addresses[0];
  return primary?.email_address ?? `${user.id}@users.munos.app`;
}

async function syncUser(user: UserLifecycleEvent["data"]) {
  const clerkId = user.id;
  const email = resolvePrimaryEmail(user);
  const firstName = "first_name" in user ? user.first_name : null;
  const lastName = "last_name" in user ? user.last_name : null;
  const username = "username" in user ? user.username : null;
  const avatarUrl = "image_url" in user ? user.image_url : null;

  await getDb().user.upsert({
    where: { clerkId },
    create: {
      clerkId,
      email,
      firstName,
      lastName,
      username,
      avatarUrl,
      settings: { create: {} },
      munProfile: { create: {} },
    },
    update: {
      email,
      firstName,
      lastName,
      username,
      avatarUrl,
    },
  });
}

async function deleteUser(event: WebhookEvent) {
  const clerkId = event.data.id;
  const db = getDb();

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  // Remove every object under this user's storage prefix (all user-owned
  // uploads, including any future certificate files).
  if (user) {
    await removeUserStoragePrefix(user.id).catch(() => undefined);
  }

  await db.user.delete({ where: { clerkId } }).catch(() => undefined);
}

export async function POST(req: Request) {
  if (!env.CLERK_WEBHOOK_SECRET) {
    return NextResponse.json(
      { ok: false, error: "CLERK_WEBHOOK_SECRET is not configured" },
      { status: 503 },
    );
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { ok: false, error: "Missing svix headers" },
      { status: 400 },
    );
  }

  const payload = await req.text();

  let event: WebhookEvent;
  try {
    const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Signature verification failed" },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated":
        await syncUser(event.data);
        break;
      case "user.deleted":
        await deleteUser(event);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("[webhook:clerk] sync failed:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to process event" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, received: event.type });
}
