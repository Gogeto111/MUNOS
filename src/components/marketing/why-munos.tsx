import { Brain, Gauge, Layers, Zap } from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";

const STATS = [
  { value: "8", label: "Page research dossiers" },
  { value: "0-100", label: "Scoring system" },
  { value: "3", label: "Source trust tiers" },
  { value: "∞", label: "Practice sessions" },
];

const REASONS = [
  {
    icon: Brain,
    title: "AI that knows MUN",
    description:
      "Not a generic chatbot. Understands committees, resolutions, POIs, diplomatic protocol, and country positions.",
  },
  {
    icon: Zap,
    title: "Fast by default",
    description:
      "Server-rendered pages, optimized images, and zero-jank animations. Lighthouse scores we actually care about.",
  },
  {
    icon: Layers,
    title: "Research to debate pipeline",
    description:
      "Research a topic, then instantly convert it into GSLs, POIs, resolution clauses, and speech practice — one continuous flow.",
  },
  {
    icon: Gauge,
    title: "Honest scoring",
    description:
      "Every score comes with specific, actionable feedback. Not 'speak confidently' — 'move your strongest argument to the 10-second mark.'",
  },
];

export function WhyMUNOS() {
  return (
    <section id="why" className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Why MUNOS"
          title={
            <>
              AI that understands <span className="text-gradient">how MUN actually works</span>
            </>
          }
          description="Built by delegates who were tired of generic AI tools that don't understand committees, resolutions, or diplomatic protocol."
        />

        <FadeIn delay={0.08}>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border/70 bg-card/60 p-6 text-center"
              >
                <p className="text-gradient text-3xl font-semibold tracking-tight sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason, index) => (
            <FadeIn key={reason.title} delay={index * 0.06}>
              <div className="card-hover h-full rounded-2xl border border-border/70 bg-card/60 p-6">
                <reason.icon className="size-6 text-brand-500" />
                <h3 className="mt-4 font-semibold tracking-tight">{reason.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {reason.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
