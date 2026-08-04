import { Check, Circle } from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { cn } from "@/lib/utils";

const PHASES = [
  {
    phase: "Phase 1",
    label: "Today",
    title: "The Delegate Operating System",
    description:
      "Profile, portfolio, certificates, dashboard, and settings — a complete, polished foundation.",
    items: ["Delegate profile & MUN profile", "Certificate manager", "Public portfolio + PDF export", "Dashboard & analytics", "Full theming & settings"],
    status: "live" as const,
  },
  {
    phase: "Phase 2",
    label: "Next",
    title: "AI Research Engine",
    description:
      "Position papers, research briefs, and topic deep-dives generated from verified sources.",
    items: ["AI research assistant", "Position paper builder", "Topic briefings"],
    status: "planned" as const,
  },
  {
    phase: "Phase 3",
    label: "Soon",
    title: "Conference Discovery",
    description:
      "Find the world's best MUNs. Filter by region, size, committee, and travel budget.",
    items: ["Conference marketplace", "Smart recommendations", "Organizer profiles"],
    status: "planned" as const,
  },
  {
    phase: "Phase 4",
    label: "Later",
    title: "Committee Workspace",
    description:
      "Collaborative workspaces with live debate assistance for chairs and delegates.",
    items: ["Committee workspaces", "Live debate assistant", "Resolution builder"],
    status: "planned" as const,
  },
  {
    phase: "Phase 5",
    label: "Vision",
    title: "Networking & Community",
    description:
      "A global community of delegates — alumni networks, mentorship, and learning.",
    items: ["Delegate networking", "Community", "Learning platform"],
    status: "planned" as const,
  },
];

export function Roadmap() {
  return (
    <section id="roadmap" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-muted/20" />
      <Container>
        <SectionHeading
          eyebrow="Roadmap"
          title={
            <>
              From portfolio to <span className="text-gradient">ecosystem</span>
            </>
          }
          description="MUNOS is built phase by phase, on one scalable architecture. Here's the journey."
        />

        <div className="relative mx-auto mt-16 max-w-3xl">
          <div className="absolute bottom-4 left-4 top-4 w-px bg-gradient-to-b from-brand-500/60 via-border to-transparent" />
          <div className="space-y-10">
            {PHASES.map((item, index) => (
              <FadeIn key={item.phase} delay={index * 0.05}>
                <div className="relative pl-12">
                  <span
                    className={cn(
                      "absolute left-0 top-1 grid size-8 place-items-center rounded-full border",
                      item.status === "live"
                        ? "border-brand-500/40 bg-brand-500/12 text-brand-600 dark:text-brand-400"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {item.status === "live" ? (
                      <Check className="size-4" />
                    ) : (
                      <Circle className="size-3.5" />
                    )}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                        item.status === "live"
                          ? "bg-brand-600 text-white"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.phase}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {item.items.map((listItem) => (
                      <li
                        key={listItem}
                        className="rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs text-muted-foreground"
                      >
                        {listItem}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
