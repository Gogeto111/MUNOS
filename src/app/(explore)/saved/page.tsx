import Link from "next/link";
import { Bookmark, Compass } from "lucide-react";
import { getDb } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/shared/container";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SavedConferencesList } from "@/components/explore/saved-conferences-list";
import {
  deriveConference,
  type ConferenceCardData,
} from "@/lib/conference";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Saved conferences | MUNOS",
  description: "Conferences you've bookmarked for later.",
};

export default async function SavedPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Container className="pt-10 pb-20">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Saved conferences</h1>
          <p className="mt-2 text-muted-foreground">Sign in to see your saved conferences.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/sign-in" className="inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Sign in
          </Link>
          <Link href="/sign-up" className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            Get started
          </Link>
        </div>
      </Container>
    );
  }

  const bookmarks = await getDb().bookmark.findMany({
    where: { userId: user.id },
    include: {
      conference: {
        include: {
          venue: true,
          organizer: true,
          committees: { take: 3, orderBy: { createdAt: "asc" as const } },
          socialLinks: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const items = bookmarks.map((b) => ({
    conference: b.conference as unknown as ConferenceCardData,
    derived: deriveConference(b.conference as unknown as ConferenceCardData, now),
  }));

  return (
    <div className="pb-20">
      <Container className="pt-10">
        <div className="mb-8 max-w-2xl">
          <Breadcrumbs
            items={[
              { label: "Discover", href: "/discover" },
              { label: "Saved" },
            ]}
          />
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Saved conferences
          </h1>
          <p className="mt-2 text-muted-foreground">
            {items.length === 0
              ? "No saved conferences yet. Browse and bookmark conferences to see them here."
              : `${items.length} conference${items.length !== 1 ? "s" : ""} saved.`}
          </p>
        </div>
        {items.length === 0 ? (
          <div className="flex flex-col items-start gap-4">
            <Bookmark className="size-10 text-muted-foreground" />
            <Link href="/discover" className="inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              <Compass className="mr-2 size-4" /> Discover Conferences
            </Link>
          </div>
        ) : (
          <SavedConferencesList items={items} />
        )}
      </Container>
    </div>
  );
}
