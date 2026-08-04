import { Award, ExternalLink, Share2 } from "lucide-react";

const AWARDS = [
  { title: "Best Delegate", committee: "Security Council", year: "2025" },
  { title: "Honorable Mention", committee: "UNSC", year: "2024" },
  { title: "Verbal Commendation", committee: "UNHRC", year: "2023" },
];

const COUNTRIES = ["Japan", "Canada", "Germany", "Brazil"];

export function PortfolioMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-2xl shadow-brand-950/10 backdrop-blur-sm dark:bg-card/60">
      <div className="flex items-center justify-between border-b border-border/70 bg-muted/40 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-md bg-gradient-to-br from-brand-500 to-brand-800 text-white">
            <Award className="size-3.5" />
          </span>
          <p className="text-xs font-semibold">Public portfolio</p>
          <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
            Live
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="grid size-6 place-items-center rounded-md border border-border/70">
            <Share2 className="size-3" />
          </span>
          <span className="grid size-6 place-items-center rounded-md border border-border/70">
            <ExternalLink className="size-3" />
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5 sm:flex-row">
        <div className="flex flex-1 gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white">
            AR
          </span>
          <div>
            <p className="text-sm font-semibold">Alex Rivera</p>
            <p className="text-[10px] text-muted-foreground">
              Delegate · Riverside High School · Geneva
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {["Intermediate", "14 MUNs", "6 awards"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[9px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:w-56">
          {[
            { value: "14", label: "MUNs" },
            { value: "6", label: "Awards" },
            { value: "4", label: "Countries" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border/70 bg-muted/30 p-2 text-center"
            >
              <p className="text-sm font-semibold">{stat.value}</p>
              <p className="text-[8px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 p-5 pt-0 sm:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
          <p className="mb-2 text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
            Awards
          </p>
          <div className="space-y-1.5">
            {AWARDS.map((award) => (
              <div key={award.title} className="flex items-center justify-between text-[10px]">
                <span className="font-medium">{award.title}</span>
                <span className="text-muted-foreground">{award.year}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
          <p className="mb-2 text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
            Countries represented
          </p>
          <div className="flex flex-wrap gap-1.5">
            {COUNTRIES.map((country) => (
              <span
                key={country}
                className="rounded-full border border-border/70 bg-card px-2.5 py-1 text-[10px] font-medium"
              >
                {country}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
