import { Gauge, Layers, Palette, Zap } from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";

const STATS = [
  { value: "50+", label: "Countries using MUNOS" },
  { value: "10k", label: "Conferences tracked" },
  { value: "100%", label: "Free, forever" },
  { value: "0", label: "Hidden fees" },
];

const REASONS = [
  {
    icon: Zap,
    title: "Fast by default",
    description:
      "Server-rendered pages, optimized images, and zero-jank animations. Lighthouse scores we actually care about.",
  },
  {
    icon: Palette,
    title: "Premium by design",
    description:
      "A design system inspired by the world's best products — dark mode, glass surfaces, and micro-interactions that feel alive.",
  },
  {
    icon: Layers,
    title: "One profile, everywhere",
    description:
      "Your portfolio is generated from your real data. Update once, and every surface — public page, exports, future apps — follows.",
  },
  {
    icon: Gauge,
    title: "Built to scale to millions",
    description:
      "Feature-based architecture, normalized data, and server actions. MUNOS grows from one delegate to one million without a rewrite.",
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
              Engineering you can <span className="text-gradient">feel</span>
            </>
          }
          description="MUNOS isn't another to-do app for delegates. It's a platform built with the discipline of the products you already love."
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
