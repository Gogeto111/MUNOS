import Link from "next/link";
import {
  Gavel,
  Search,
  Users,
  BarChart3,
  ArrowRight,
  Sparkles,
  Globe,
  BookOpen,
  Quote,
} from "lucide-react";
import { LogoMark } from "@/components/shared/logo";
import { Container } from "@/components/shared/container";
import { StatsCounter } from "@/components/marketing/stats-counter";
import { ExploreFooter } from "@/components/explore/explore-footer";

const FEATURES = [
  {
    icon: Gavel,
    title: "AI Simulator",
    description:
      "Practice MUN debate with AI-powered delegates. Pick a committee, topic, and country — then deliver your speeches in real time.",
    href: "/simulator",
  },
  {
    icon: BookOpen,
    title: "Research Assistant",
    description:
      "Get instant background guides, resolution drafts, and country position papers powered by AI.",
    href: "/os",
  },
  {
    icon: Users,
    title: "Social Network",
    description:
      "Connect with delegates worldwide. Share portfolios, find conference buddies, and build your diplomatic network.",
    href: "/social",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Track your speaking scores, committee performance, and growth across every conference you attend.",
    href: "/coach",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "MUNOS completely transformed how I prepare for conferences. The AI simulator lets me practice speeches at 2 AM without needing a partner.",
    name: "Aisha Patel",
    role: "Delegate, HMUN",
  },
  {
    quote:
      "Finding conferences used to take hours of digging through Instagram pages. MUNOS discover search is a game changer.",
    name: "Lucas Fernández",
    role: "Secretary-General, ModelUN Madrid",
  },
  {
    quote:
      "The analytics dashboard helped me see exactly where I needed to improve. Went from verbal commendation to best delegate in one season.",
    name: "Priya Nair",
    role: "Best Delegate, THIMUN Singapore",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Create your portfolio",
    description:
      "Sign up, build your delegate profile, and log the conferences you've attended.",
  },
  {
    number: "02",
    title: "Practice with AI",
    description:
      "Use the committee simulator to rehearse speeches, negotiate blocs, and refine your diplomacy skills.",
  },
  {
    number: "03",
    title: "Discover & perform",
    description:
      "Find your next conference, track your progress, and climb the delegate leaderboard.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-500/[0.08] via-transparent to-transparent" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-brand-500/15 blur-[160px]" />
        <div className="pointer-events-none absolute top-1/2 left-3/4 h-64 w-[30rem] -translate-x-1/2 rounded-full bg-purple-500/10 blur-[120px]" />

        <Container className="relative pb-20 pt-24 sm:pb-28 sm:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-700 dark:text-brand-300">
              <Sparkles className="size-3.5" />
              AI-Powered MUN Platform
            </span>

            <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              The operating system for{" "}
              <span className="text-gradient">Model United Nations</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              Research, simulate, connect, and track your delegate journey — all
              in one platform. From first-timer to best delegate.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700 hover:shadow-brand-600/30"
              >
                Get Started
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-7 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-brand-500/40 hover:bg-brand-500/5"
              >
                <Search className="size-4" />
                Explore Conferences
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="border-y border-border/60 bg-muted/20">
        <Container className="py-12">
          <StatsCounter />
        </Container>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
              Everything you need
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Built for delegates, by delegates
            </h2>
            <p className="mt-3 text-muted-foreground">
              MUNOS combines AI practice, conference discovery, and performance
              tracking into one seamless experience.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group relative rounded-2xl border border-border/60 bg-card p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5"
                >
                  <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 transition-colors group-hover:bg-brand-500/15 dark:text-brand-400">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors group-hover:gap-2 dark:text-brand-400">
                    Learn more
                    <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="border-y border-border/60 bg-muted/20 py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
              Simple workflow
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              How MUNOS works
            </h2>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-10 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand-500/10 text-lg font-bold text-brand-600 dark:text-brand-400">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
              Trusted by delegates
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              What delegates say
            </h2>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="relative rounded-2xl border border-border/60 bg-card p-7"
              >
                <Quote className="mb-3 size-8 text-brand-500/25" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-5 border-t border-border/60 pt-4">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="border-y border-border/60 bg-gradient-to-b from-brand-500/[0.06] to-transparent py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Globe className="mx-auto mb-4 size-10 text-brand-500/40" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to elevate your MUN experience?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Join thousands of delegates using MUNOS to research, practice, and
              perform at their best.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700 hover:shadow-brand-600/30"
              >
                Get Started — it&apos;s free
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 rounded-full border border-border/70 px-7 py-3 text-sm font-semibold text-foreground transition-all hover:border-brand-500/40 hover:bg-brand-500/5"
              >
                Browse Conferences
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <ExploreFooter />
    </div>
  );
}
