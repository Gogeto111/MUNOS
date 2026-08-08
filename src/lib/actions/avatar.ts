"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail, toActionError, type ActionState } from "@/lib/actions";

export async function uploadAvatar(formData: FormData): Promise<ActionState<{ url: string }>> {
  try {
    const user = await requireUser();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return fail("No file provided.");
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return fail("Only JPEG, PNG, WebP, and GIF images are supported.");
    }

    if (file.size > 5 * 1024 * 1024) {
      return fail("Image is too large (max 5 MB).");
    }

    const { uploadConferenceAsset } = await import("@/lib/upload");
    const result = await uploadConferenceAsset(file, "avatars");
    if ("error" in result) {
      return fail(result.error);
    }

    await getDb().user.update({
      where: { id: user.id },
      data: { avatarUrl: result.url },
    });

    revalidatePath("/profile");
    revalidatePath("/settings");
    return ok("Avatar updated.", { url: result.url });
  } catch (error) {
    return toActionError(error);
  }
}
