import { notFound } from "next/navigation";
import { getDb } from "@/lib/prisma";
import { ConferenceForm } from "@/components/admin/conference-form";
import { conferenceDetailInclude, type ConferenceWithDetail } from "@/lib/conference";
import { conferenceToDraft } from "@/lib/admin-draft";

export const metadata = { title: "Edit conference | MUNOS Admin" };

export default async function EditConferencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conference = (await getDb().conference.findUnique({
    where: { id },
    include: conferenceDetailInclude,
  })) as ConferenceWithDetail | null;

  if (!conference) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit conference</h1>
        <p className="mt-1 text-sm text-muted-foreground">{conference.name}</p>
      </div>
      <ConferenceForm mode="edit" initial={conferenceToDraft(conference)} conferenceId={conference.id} />
    </div>
  );
}
