import { Quote } from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";

const TESTIMONIALS = [
  {
    quote:
      "MUNOS turned four years of scattered certificates into a portfolio that landed me my first chairing invite. Unreal.",
    name: "Amara K.",
    role: "Head Delegate · Lagos",
    initials: "AK",
    tone: "from-brand-500 to-brand-700",
  },
  {
    quote:
      "The dashboard is genuinely gorgeous. It feels like the tools my parents use at work, not another school app.",
    name: "Miguel J.",
    role: "Delegate · Mexico City",
    initials: "MJ",
    tone: "from-sky-500 to-brand-600",
  },
  {
    quote:
      "I uploaded my certificates and the public portfolio built itself. My university interviewers were impressed.",
    name: "Sofia R.",
    role: "Delegate · Buenos Aires",
    initials: "SR",
    tone: "from-violet-500 to-fuchsia-600",
  },
  {
    quote:
      "Dark mode, buttery animations, and everything loads instantly. Whoever built this cares about craft.",
    name: "Priya L.",
    role: "Committee Chair · New Delhi",
    initials: "PL",
    tone: "from-emerald-500 to-teal-600",
  },
  {
    quote:
      "My whole MUN club migrated in a week. Tracking everyone's achievements finally stopped being a spreadsheet nightmare.",
    name: "Daniel O.",
    role: "Secretary-General · Nairobi",
    initials: "DO",
    tone: "from-amber-500 to-orange-600",
  },
  {
    quote:
      "Free forever actually means free forever. No paywall surprise after my first conference. Respect.",
    name: "Lena H.",
    role: "Delegate · Berlin",
    initials: "LH",
    tone: "from-rose-500 to-pink-600",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-muted/20" />
      <Container>
        <SectionHeading
          eyebrow="Loved by delegates"
          title={
            <>
              Words from the <span className="text-gradient">diplomatic corps</span>
            </>
          }
          description="Early delegates, chairs, and secretaries-general are already calling MUNOS home."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <FadeIn key={testimonial.name} delay={(index % 3) * 0.07}>
              <figure className="card-hover flex h-full flex-col rounded-2xl border border-border/70 bg-card/60 p-6">
                <Quote className="size-5 text-brand-500/70" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span
                    className={`grid size-9 place-items-center rounded-full bg-gradient-to-br ${testimonial.tone} text-xs font-semibold text-white`}
                  >
                    {testimonial.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
