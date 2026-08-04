import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/profile(.*)",
  "/certificates(.*)",
  "/portfolio(.*)",
  "/settings(.*)",
  "/saved(.*)",
  "/admin(.*)",
  "/os(.*)",
  "/simulator(.*)",
  "/coach(.*)",
  "/news(.*)",
  "/social(.*)",
  "/passport(.*)",
  "/marketplace(.*)",
  "/organizer(.*)",
  "/workspaces(.*)",
]);

const clerk = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  // Without Clerk keys (local demo mode) every route stays public.
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_bmV1dHJhbC1nZWNrby03NS5jbGVyay5hY2NvdW50cy5kZXYk";
  const secretKey = process.env.CLERK_SECRET_KEY || "sk_test_95TI9LtlT9Ag6mi9jYHgi49Bw2UCqe14yxiNAhkylf";
  if (!publishableKey || !secretKey) {
    return NextResponse.next();
  }
  return clerk(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for Clerk's auto-proxy path
    "/__clerk/:path*",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
