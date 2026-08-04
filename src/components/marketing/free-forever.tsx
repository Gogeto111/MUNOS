import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Container } from "@/components/shared/container";
import { FadeIn } from "@/components/shared/fade-in";
import { Button } from "@/components/ui/button";

const INCLUDED = [
  "Delegate profile & MUN profile",
  "Auto-generated public portfolio",
  "PDF portfolio export",
  "Unlimited certificate uploads",
  "Dashboard with analytics",
  "Full theming — dark, light, system",
  "Privacy controls & notifications",
  "All future Phase 1 features",
];

export function FreeForever() {
  return (
    <section id="free-forever" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[380px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand-500/12 to-sky-400/8 blur-3xl" />
      </div>

      <Container>
        <FadeIn>
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border/70 bg-card/70 p-8 text-center backdrop-blur-sm sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand-500/12 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 size-48 rounded-full bg-sky-400/10 blur-2xl" />

            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/8 px-3 py-1 text-xs font-medium uppercase tracking-widest text-brand-600 dark:text-brand-400">
              <Sparkles className="size-3.5" />
              Free forever
            </span>

            <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything you need.
              <br />
              <span className="text-gradient">Nothing you have to pay for.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
              MUNOS is free for every delegate, forever. No trials, no credit
              cards, no surprises.
            </p>

            <div className="mx-auto mt-8 max-w-md text-left">
              <ul className="space-y-3">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <Check className="size-3" />
                    </span>
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/sign-up">
                  Create your free account
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="#demo">Explore the product</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Join delegates from 50+ countries. No credit card required.
            </p>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
