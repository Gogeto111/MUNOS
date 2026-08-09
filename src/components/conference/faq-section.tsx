"use client";

import * as React from "react";
import { HelpCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/conference/conference-sections";
import { submitFaqQuestion } from "@/lib/actions/conference";


export function FaqSection({
  conferenceId,
  faqs,
}: {
  conferenceId: string;
  faqs: { id: string; question: string; answer: string }[];
}) {
  const [question, setQuestion] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const result = await submitFaqQuestion(conferenceId, trimmed);
      if (result.status === "success") {
        toast.success("Question sent to the organizer!");
        setSubmitted(true);
        setQuestion("");
      } else {
        toast.error(result.message ?? "Could not send question.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <SectionHeading icon={HelpCircle} title="Frequently asked questions" />

      {faqs.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="mb-4 text-sm text-muted-foreground">
          No questions yet. Be the first to ask!
        </p>
      )}

      <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-4">
        {submitted ? (
          <p className="text-sm text-muted-foreground">
            Your question has been sent to the organizer. Thank you!
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="text-sm font-medium">Ask a question</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question…"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                disabled={submitting}
              />
              <Button
                type="submit"
                size="sm"
                disabled={submitting || !question.trim()}
                className="gap-1.5 rounded-full"
              >
                <Send className="size-3.5" />
                {submitting ? "Sending…" : "Send"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
