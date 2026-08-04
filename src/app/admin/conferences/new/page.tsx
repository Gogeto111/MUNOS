import { ConferenceForm } from "@/components/admin/conference-form";

export const metadata = { title: "New conference | MUNOS Admin" };

export default function NewConferencePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New conference</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in the essentials — delegates will see this on the discover page
          immediately after you publish.
        </p>
      </div>
      <ConferenceForm mode="create" />
    </div>
  );
}
