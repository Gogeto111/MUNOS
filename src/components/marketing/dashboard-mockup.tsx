import {
  Award,
  Bell,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: User, label: "Profile", active: false },
  { icon: Award, label: "Portfolio", active: false },
  { icon: FileText, label: "Certificates", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const BARS = [42, 64, 52, 80, 60, 92, 74, 58, 86, 68, 48, 78];

const ACTIVITY = [
  { dot: "bg-emerald-500", text: "Certificate uploaded", time: "2m" },
  { dot: "bg-brand-500", text: "Award added to portfolio", time: "1h" },
  { dot: "bg-amber-500", text: "Profile 85% complete", time: "3h" },
];

export function DashboardMockup() {
  return (
    <div aria-hidden="true" className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-2xl shadow-brand-950/10 backdrop-blur-sm dark:bg-card/60 dark:shadow-black/40">
      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-border/70 bg-muted/40 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <div className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-background/80 px-3 py-1 text-[10px] text-muted-foreground">
          <Sparkles className="size-3 text-brand-500" />
          app.munos.org/dashboard
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-40 shrink-0 flex-col gap-1 border-r border-border/70 p-3 sm:flex">
          <div className="mb-3 flex items-center gap-1.5 px-1.5">
            <span className="grid size-5 place-items-center rounded-md bg-gradient-to-br from-brand-500 to-brand-800 text-[9px] font-bold text-white">
              M
            </span>
            <span className="text-[11px] font-semibold">MUNOS</span>
          </div>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-medium ${
                item.active
                  ? "bg-brand-500/12 text-brand-600 dark:text-brand-400"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="size-3" />
              {item.label}
            </div>
          ))}
          <div className="mt-auto flex items-center gap-1.5 rounded-md bg-muted px-2 py-1.5">
            <span className="grid size-4 place-items-center rounded-full bg-brand-500 text-[7px] font-bold text-white">
              AR
            </span>
            <span className="truncate text-[9px] text-muted-foreground">
              Alex Rivera
            </span>
          </div>
        </div>

        {/* Main panel */}
        <div className="flex-1 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                Welcome back
              </p>
              <p className="text-sm font-semibold">Good to see you, Alex</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-md border border-border/70 text-muted-foreground">
                <Search className="size-3" />
              </span>
              <span className="grid size-6 place-items-center rounded-md border border-border/70 text-muted-foreground">
                <Bell className="size-3" />
              </span>
            </div>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "MUNs attended", value: "14" },
              { label: "Awards won", value: "6" },
              { label: "Certificates", value: "9" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border/70 bg-muted/30 p-2.5"
              >
                <p className="text-base font-semibold leading-none sm:text-lg">
                  {stat.value}
                </p>
                <p className="mt-1 truncate text-[8px] text-muted-foreground sm:text-[9px]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="mt-2 flex items-end gap-1.5 rounded-lg border border-border/70 bg-muted/30 p-3">
            <div className="flex h-16 flex-1 items-end gap-1.5 sm:h-20">
              {BARS.map((height, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-sm bg-gradient-to-t from-brand-600 to-brand-400/70 opacity-80"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="mt-2 space-y-1.5 rounded-lg border border-border/70 bg-muted/30 p-3">
            <p className="flex items-center gap-1 text-[9px] font-medium text-muted-foreground">
              <TrendingUp className="size-3 text-emerald-500" />
              Recent activity
            </p>
            {ACTIVITY.map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-[9px]">
                <span className={`size-1.5 rounded-full ${item.dot}`} />
                <span className="flex-1 truncate text-muted-foreground">
                  {item.text}
                </span>
                <span className="text-muted-foreground/70">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
