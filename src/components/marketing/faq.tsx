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
      "MUNOS is an AI-powered operating system for Model United Nations delegates. It centralizes research, speech preparation, committee simulation, and your MUN career — profile, awards, certificates — in one platform.",
  },
  {
    question: "Is it really free?",
    answer:
      "Yes. MUNOS is free to use. AI features use your own API keys (Gemini, OpenAI, etc.) — you control the cost. We don't charge subscription fees.",
  },
  {
    question: "How does the AI research agent work?",
    answer:
      "输入 a country, committee, and agenda topic. MUNOS generates a 16-section research dossier with country positions, UN frameworks, attack material, resolution clauses, and sourced claims. It pulls from real UN sources, government positions, and think tanks — with source hierarchy so you know what to trust.",
  },
  {
    question: "What's the GSL builder?",
    answer:
      "It generates General Speaker's List speeches for your specific country, committee, and agenda. You can customize length (60/90/120 seconds), tone (aggressive/diplomatic), and complexity. Then practice with the speech coach.",
  },
  {
    question: "How does the POI engine work?",
    answer:
      "After an AI delegate gives a speech, MUNOS generates POIs you can ask — based on contradictions, policy inconsistencies, and diplomatic openings. You can also practice answering POIs and get scored on relevance, diplomacy, and confidence.",
  },
  {
    question: "Can I use MUNOS during actual conferences?",
    answer:
      "Yes — the Situation Room provides live context during committee sessions. It tracks breaking news, committee developments, and generates real-time talking points and POIs based on what's happening.",
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
