"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  conferenceDraftSchema,
  type ConferenceDraftInput,
  type ConferenceDraftFormValues,
} from "@/lib/validation/conference";
import {
  createConference,
  updateConference,
  type ConferenceDraft,
} from "@/lib/actions/conference";
import type { ActionState } from "@/lib/actions";
import { useServerAction } from "@/components/profile/use-server-action";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { emptyDraft } from "./empty-draft";
import { BasicsSection } from "./basics";
import { DatesFeesSection } from "./dates-fees";
import { ContactHostingSection } from "./contact-hosting";
import { OrganizerSection } from "./organizer";
import { VenueSection } from "./venue";
import { CommitteesSection } from "./committees";
import { AgendaSection } from "./agenda";
import { BrochuresSection } from "./brochures";
import { GallerySection } from "./gallery";
import { SocialLinksSection } from "./social-links";
import { AwardsSection } from "./awards";
import { FaqsSection } from "./faqs";
import { SecretariatSection } from "./secretariat";

export function ConferenceForm({
  mode,
  initial,
  conferenceId,
}: {
  mode: "create" | "edit";
  initial?: ConferenceDraft;
  conferenceId?: string;
}) {
  const router = useRouter();
  const form = useForm<ConferenceDraftFormValues, unknown, ConferenceDraftInput>({
    resolver: zodResolver(conferenceDraftSchema),
    defaultValues: (initial ?? emptyDraft()) as ConferenceDraftFormValues,
  });

  const runAction = async (values: ConferenceDraftFormValues): Promise<ActionState> => {
    const result =
      mode === "edit"
        ? await updateConference(conferenceId!, values as ConferenceDraft)
        : await createConference(values as ConferenceDraft);
    return result as ActionState;
  };
  const { isPending, run } = useServerAction(runAction, form.setError);

  const onSubmit = (values: ConferenceDraftInput) => {
    run(values).then((result) => {
      if (result.status === "success") {
        router.push("/admin/conferences");
        router.refresh();
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <BasicsSection />
        <DatesFeesSection />
        <ContactHostingSection />
        <OrganizerSection />
        <VenueSection />
        <CommitteesSection />
        <AgendaSection />
        <BrochuresSection />
        <GallerySection />
        <SocialLinksSection />
        <AwardsSection />
        <FaqsSection />
        <SecretariatSection />

        <div className="sticky bottom-4 z-10 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full bg-background/90 backdrop-blur"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="gap-2 rounded-full">
            {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {mode === "edit" ? "Save changes" : "Create conference"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
