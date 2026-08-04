import { getDb } from "@/lib/prisma";
import { Container } from "@/components/shared/container";
import { SavedConferencesList } from "@/components/explore/saved-conferences-list";
import {
  conferenceListInclude,
  deriveConference,
  type ConferenceCardData,
} from "@/lib/conference";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Saved conferences | MUNOS",
  description: "Your saved Model United Nations conferences, all in one place.",
};

export default async function SavedPage() {
  const conferences = (await getDb().conference.findMany({
    where: { published: true },
    orderBy: { startDate: "asc" },
    include: conferenceListInclude,
  })) as ConferenceCardData[];

  const now = new Date();
  const items = conferences.map((conference) => ({
    conference,
    derived: deriveConference(conference, now),
  }));

  return (
    <div className="pb-20">
      <Container className="pt-10">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Saved conferences
          </h1>
          <p className="mt-2 text-muted-foreground">
            Conferences you&apos;ve hearted across the platform. Saved on this
            device, and synced to your account when you&apos;re signed in.
          </p>
        </div>
        <SavedConferencesList items={items} />
      </Container>
    </div>
  );
}
