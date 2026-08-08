import { ConferenceWizard } from "@/components/organizer/conference-wizard";

export default function CreateConferencePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ConferenceWizard />
      </div>
    </div>
  );
}
