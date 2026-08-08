import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Compass, LayoutDashboard, FlaskConical, Newspaper } from "lucide-react";

const LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "Simulator", href: "/simulator", icon: FlaskConical },
  { label: "News", href: "/news", icon: Newspaper },
];

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      {/* Animated CSS shapes */}
      <div className="pointer-events-none relative mb-8 size-48" aria-hidden="true">
        <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-brand-400/20 to-brand-600/10" />
        <div className="absolute left-1/2 top-1/2 size-32 -translate-x-1/2 -translate-y-1/2 animate-[spin_12s_linear_infinite] rounded-full border-2 border-dashed border-brand-300/30" />
        <div className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 animate-[spin_8s_linear_infinite_reverse] rounded-full border border-brand-400/20" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 text-white shadow-[0_4px_20px_-4px_rgba(79,70,229,0.5)]">
            <span className="text-2xl font-bold">?</span>
          </div>
        </div>
        {/* Floating dots */}
        <div className="absolute left-4 top-8 size-2 rounded-full bg-brand-400/40 animate-[bounce_3s_infinite]" />
        <div className="absolute right-6 top-12 size-1.5 rounded-full bg-brand-500/30 animate-[bounce_4s_infinite_0.5s]" />
        <div className="absolute bottom-8 left-10 size-1 rounded-full bg-brand-300/50 animate-[bounce_2.5s_infinite_1s]" />
      </div>

      {/* 404 text */}
      <h1 className="text-gradient text-8xl font-black tracking-tighter tabular-nums select-none sm:text-9xl">
        404
      </h1>
      <h2 className="mt-3 text-xl font-semibold tracking-tight">Page not found</h2>
      <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you
        back on track.
      </p>

      {/* Search bar */}
      <form
        action="/discover"
        method="GET"
        className="mt-6 w-full max-w-sm"
      >
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2 shadow-sm transition-colors focus-within:border-brand-500/50 focus-within:ring-2 focus-within:ring-brand-500/20">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            name="q"
            placeholder="Search conferences..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <Button type="submit" size="sm" variant="ghost" className="h-7 px-3 text-xs">
            Search
          </Button>
        </div>
      </form>

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="group transition-colors hover:border-brand-500/50 hover:bg-brand-500/5">
              <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                <link.icon className="size-5 text-muted-foreground transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400" />
                <span className="text-xs font-medium">{link.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
