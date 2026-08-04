import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "What exactly is MUNOS?",
    answer:
      "MUNOS is an operating system for Model United Nations delegates. It centralizes your MUN career — profile, awards, certificates, committees, and portfolio — in one fast, beautiful platform, with more capabilities arriving in later phases.",
  },
  {
    question: "Is it really free forever?",
    answer:
      "Yes. Phase 1 is completely free — every feature, no trial, no credit card, no hidden paywall. If we introduce premium capabilities in later phases, everything you use today stays free.",
  },
  {
    question: "How does the public portfolio work?",
    answer:
      "Your portfolio is generated automatically from your profile data. It gets a public URL you can share with universities, clubs, and conference secretariats. You control exactly what's public through your privacy settings.",
  },
  {
    question: "Can I export my portfolio as a PDF?",
    answer:
      "Absolutely. One click exports a beautifully formatted PDF of your entire portfolio — timeline, awards, certificates, committees, and countries — perfect for applications.",
  },
  {
    question: "Where are my certificates stored?",
    answer:
      "Certificates are stored securely in the cloud and are private to you by default. You can preview, search, filter, and organize them — or choose to feature them on your public portfolio.",
  },
  {
    question: "Which countries and schools are supported?",
    answer:
      "All of them. MUNOS is global by design — any country, any school, any grade. We're built to serve delegates from every corner of the world.",
  },
  {
    question: "Will you add AI and conference discovery?",
    answer:
      "Yes — that's the roadmap. AI research assistance, conference discovery, committee workspaces, and a global delegate community are planned for later phases, all on the same architecture you're using today.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Yes. Authentication is handled by Clerk, data lives in a managed PostgreSQL database, files are stored in Supabase with signed uploads, and every server action validates input with Zod. We never sell or share your data.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <Container className="max-w-3xl">
        <SectionHeading
          eyebrow="FAQ"
          title={
            <>
              Questions? <span className="text-gradient">Answered.</span>
            </>
          }
          description="Everything you need to know before you dive in."
        />

        <FadeIn delay={0.1}>
          <Accordion type="single" collapsible className="mt-12 w-full">
            {FAQS.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-[15px] font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </Container>
    </section>
  );
}
