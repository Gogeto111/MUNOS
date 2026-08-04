import {
  Award,
  FileCheck2,
  Globe2,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";

const FEATURES = [
  {
    icon: Award,
    title: "Auto-generated portfolio",
    description:
      "Every award, certificate, committee, and country becomes a polished, public, shareable portfolio — zero design work.",
    accent: "from-brand-500 to-brand-700",
  },
  {
    icon: FileCheck2,
    title: "Certificate manager",
    description:
      "Upload, preview, search, and organize certificates. Grid or list view, categorized, always a tap from export.",
    accent: "from-sky-500 to-brand-600",
  },
  {
    icon: LayoutDashboard,
    title: "Delegate dashboard",
    description:
      "A command center for your MUN career — stats, upcoming conferences, activity, and notifications at a glance.",
    accent: "from-violet-500 to-fuchsia-600",
  },
  {
    icon: Globe2,
    title: "Global MUN profile",
    description:
      "Schools, committees, countries represented, awards, interests — one canonical profile that follows you everywhere.",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    icon: Settings2,
    title: "Granular settings",
    description:
      "Theme, privacy, notifications, and connected accounts — everything tuned the way you want, synced across devices.",
    accent: "from-amber-500 to-orange-600",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    description:
      "You control what's public. Share only what you're proud of, keep the rest locked down.",
    accent: "from-rose-500 to-pink-600",
  },
];

const UPCOMING = [
  { icon: Sparkles, label: "AI research & briefs", phase: "Phase 2" },
  { icon: Globe2, label: "Conference discovery", phase: "Phase 3" },
  { icon: Users, label: "Committee workspaces", phase: "Phase 4" },
  { icon: Video, label: "Live debate assistant", phase: "Phase 4" },
];

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Everything you need"
          title={
            <>
              Built for delegates, <span className="text-gradient">designed to scale</span>
            </>
          }
          description="Phase 1 ships the complete delegate operating system — every feature architected so the platform can grow into the full MUN ecosystem without breaking."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <FadeIn key={feature.title} delay={(index % 3) * 0.08}>
              <div className="card-hover group h-full rounded-2xl border border-border/70 bg-card/60 p-6">
                <div
                  className={`grid size-11 place-items-center rounded-xl bg-gradient-to-br ${feature.accent} text-white shadow-lg`}
                >
                  <feature.icon className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.1}>
          <div className="mt-14 rounded-2xl border border-dashed border-border/80 bg-muted/30 p-6 sm:p-8">
            <p className="text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Coming in later phases
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {UPCOMING.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-4 py-3"
                >
                  <item.icon className="size-5 shrink-0 text-brand-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.phase}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
