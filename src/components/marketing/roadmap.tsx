import { Check, Circle } from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { cn } from "@/lib/utils";

const PHASES = [
  {
    phase: "Phase 1",
    label: "Live",
    title: "The Delegate Operating System",
    description:
      "Profile, portfolio, certificates, dashboard, and settings — a complete, polished foundation.",
    items: ["Delegate profile & MUN profile", "Certificate manager", "Public portfolio + PDF export", "Dashboard & analytics", "Full theming & settings"],
    status: "live" as const,
  },
  {
    phase: "Phase 2",
    label: "Live",
    title: "AI Research Engine",
    description:
      "8-page research dossiers with country positions, UN frameworks, attack material, and sourced claims.",
    items: ["Research agent (8-page dossier)", "Position paper builder", "Topic briefings", "Source hierarchy (Tier 1/2/3)", "Live web search integration"],
    status: "live" as const,
  },
  {
    phase: "Phase 3",
    label: "Live",
    title: "Conference Discovery",
    description:
      "Find MUNs worldwide. Filter by region, committee, format, and difficulty.",
    items: ["Conference listings", "Organizer profiles", "Committee details", "Country matrices", "Reviews & ratings"],
    status: "live" as const,
  },
  {
    phase: "Phase 4",
    label: "Building",
    title: "AI Debate Assistant",
    description:
      "GSL builder, POI engine, speech coach, and committee simulation — all understanding your context.",
    items: ["GSL builder (60/90/120s)", "POI engine (ask + answer)", "Speech coach (0-100 scoring)", "Committee simulation", "Voice mode (STT/TTS)"],
    status: "building" as const,
  },
  {
    phase: "Phase 5",
    label: "Next",
    title: "MUN Command Center",
    description:
      "Personal AI memory, scoring engine, situation room, and research-to-debate pipeline.",
    items: ["Personal AI memory", "MUN scoring engine", "Situation room", "Research → debate conversion", "AI fallback system"],
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
              From portfolio to <span className="text-gradient">AI command center</span>
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
                        : item.status === "building"
                          ? "border-amber-500/40 bg-amber-500/12 text-amber-600 dark:text-amber-400"
                          : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {item.status === "live" ? (
                      <Check className="size-4" />
                    ) : item.status === "building" ? (
                      <Circle className="size-3.5 animate-pulse" />
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
                          : item.status === "building"
                            ? "bg-amber-600 text-white"
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
