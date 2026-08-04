import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getDb } from "@/lib/prisma";

const CLERK_SECRET = process.env.CLERK_SECRET_KEY || "sk_test_95TI9LtlT9Ag6mi9jYHgi49Bw2UCqe14yxiNAhkylf";

const isAuthConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    CLERK_SECRET,
);

type ExperienceLevel = "FIRST_TIMER" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" | null;

interface UserShape {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  avatarUrl: string | null;
  phoneNumber: string | null;
  school: string | null;
  university: string | null;
  grade: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  bio: string | null;
  interests: string[];
  role: string;
  munProfile: {
    experienceLevel: ExperienceLevel;
    munsAttended: number;
    awardsWon: number;
  } | null;
}

function toUserShape(user: NonNullable<Awaited<ReturnType<typeof fetchUser>>>): UserShape {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    avatarUrl: user.avatarUrl,
    phoneNumber: user.phoneNumber,
    school: user.school,
    university: user.university,
    grade: user.grade,
    city: user.city,
    state: user.state,
    country: user.country,
    bio: user.bio,
    interests: user.interests,
    role: user.role,
    munProfile: user.munProfile
      ? {
          experienceLevel: user.munProfile.experienceLevel,
          munsAttended: user.munProfile.munsAttended,
          awardsWon: user.munProfile.awardsWon,
        }
      : null,
  };
}

function fetchUser(userId: string) {
  return getDb().user.findUnique({
    where: { clerkId: userId },
    include: { munProfile: true },
  });
}

/**
 * Resolves the authenticated user from Clerk and hydrates the local
 * database record with its one-to-one relations. Returns `null` for
 * unauthenticated requests or when auth is not configured.
 */
export async function getCurrentUser(): Promise<UserShape | null> {
  if (!isAuthConfigured) return null;

  const session = await auth();
  if (!session.userId) return null;

  let user = await fetchUser(session.userId);

  // The Clerk webhook is the canonical sync path, but it only fires after
  // webhook setup. Fall back to a self-healing upsert so a first sign-in
  // never lands on an empty dashboard.
  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    user = await getDb().user.upsert({
      where: { clerkId: session.userId },
      create: {
        clerkId: session.userId,
        email:
          clerkUser.primaryEmailAddress?.emailAddress ??
          `${session.userId}@users.munos.app`,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        username: clerkUser.username,
        avatarUrl: clerkUser.imageUrl,
        settings: { create: {} },
        munProfile: { create: {} },
      },
      update: {},
      include: { munProfile: true },
    });
  }

  return toUserShape(user);
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/**
 * Requires an authenticated session and an existing local user record.
 * Callers should catch `AUTH_REQUIRED` and redirect to sign-in.
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("AUTH_REQUIRED");
  }
  return user;
}
