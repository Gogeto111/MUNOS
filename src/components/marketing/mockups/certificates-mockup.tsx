import { FileText, Search, Upload } from "lucide-react";

const ITEMS = [
  { title: "Best Delegate", issuer: "Geneva MUN 2025", tone: "from-brand-500 to-brand-700" },
  { title: "Participation", issuer: "WorldMUN Europe 2024", tone: "from-sky-500 to-brand-600" },
  { title: "Verbal Commendation", issuer: "National Model UN 2023", tone: "from-violet-500 to-fuchsia-600" },
];

export function CertificatesMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-2xl shadow-brand-950/10 backdrop-blur-sm dark:bg-card/60">
      <div className="flex items-center justify-between border-b border-border/70 bg-muted/40 px-5 py-3.5">
        <p className="text-xs font-semibold">Certificate manager</p>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-md border border-border/70 bg-background/70 px-2.5 py-1 text-[9px] text-muted-foreground">
            <Search className="size-3" />
            Search…
          </span>
          <span className="flex items-center gap-1 rounded-md bg-brand-600 px-2.5 py-1 text-[9px] font-medium text-white">
            <Upload className="size-3" />
            Upload
          </span>
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-3">
        {ITEMS.map((item) => (
          <div
            key={item.title}
            className="group overflow-hidden rounded-xl border border-border/70 bg-muted/30"
          >
            <div
              className={`flex h-24 items-center justify-center bg-gradient-to-br ${item.tone} opacity-90`}
            >
              <FileText className="size-8 text-white/85" />
            </div>
            <div className="p-3">
              <p className="truncate text-[11px] font-semibold">{item.title}</p>
              <p className="truncate text-[9px] text-muted-foreground">
                {item.issuer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
