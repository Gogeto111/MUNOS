import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { Sparkles, Brain, Mic, Search } from "lucide-react";

const CAPABILITIES = [
  {
    icon: Brain,
    title: "AI Research Agent",
    description:
      "Generate 8-page research dossiers with country positions, UN frameworks, attack material, and sourced claims — not generic summaries.",
  },
  {
    icon: Mic,
    title: "Speech & Debate Coach",
    description:
      "Get scored on clarity, diplomacy, persuasiveness, and delivery. Receive specific feedback like 'move your strongest argument to the 10-second mark.'",
  },
  {
    icon: Search,
    title: "Live Web Intelligence",
    description:
      "Research pulls from real UN sources, government positions, and think tanks — with source hierarchy so you know what to trust.",
  },
  {
    icon: Sparkles,
    title: "MUN Command Center",
    description:
      "GSL builder, POI engine, resolution drafter, and committee simulation — all understanding your country, committee, and agenda.",
  },
];

export function Testimonials() {
  return (
    <section id="capabilities" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-muted/20" />
      <Container>
        <SectionHeading
          eyebrow="What MUNOS actually does"
          title={
            <>
              AI that understands <span className="text-gradient">Model United Nations</span>
            </>
          }
          description="Not a generic chatbot. Every feature is built around how MUN actually works — committees, resolutions, POIs, and diplomatic protocol."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((cap, index) => (
            <FadeIn key={cap.title} delay={(index % 4) * 0.08}>
              <div className="card-hover group h-full rounded-2xl border border-border/70 bg-card/60 p-6">
                <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg">
                  <cap.icon className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">
                  {cap.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {cap.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
