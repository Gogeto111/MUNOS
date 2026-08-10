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
  "/ai(.*)",
  "/research(.*)",
  "/research-agent(.*)",
  "/country-research(.*)",
  "/workspace(.*)",
  "/blocs(.*)",
  "/analytics(.*)",
  "/chair(.*)",
  "/onboarding(.*)",
  "/resolution-builder(.*)",
  "/scoring(.*)",
  "/speech-history(.*)",
  "/situation-room(.*)",
  "/debate-practice(.*)",
  "/tips(.*)",
  "/resources(.*)",
  "/resolutions(.*)",
]);

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
);

const clerk = hasClerkKeys
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    })
  : null;

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (!hasClerkKeys || !clerk) {
    return NextResponse.next();
  }
  return clerk(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/:path*",
    "/(api|trpc)(.*)",
  ],
};
