"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { NAV_ITEMS, type NavItem } from "@/lib/nav";

export function AppSidebar() {
  const pathname = usePathname();
  const coreItems = NAV_ITEMS.filter((i) => i.group === "core");
  const systemItems = NAV_ITEMS.filter((i) => i.group === "system");

  return (
    <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-border/60 bg-background/60 backdrop-blur lg:flex">
      <div className="flex h-14 items-center border-b border-border/60 px-4">
        <Link href="/" aria-label="MUNOS home">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-3">
        {coreItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-500/10 text-brand-700 dark:text-brand-300"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 px-2 py-2">
        {systemItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-500/10 text-brand-700 dark:text-brand-300"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
        <p className="px-3 pt-2 text-[10px] text-muted-foreground/60">MUNOS v3.0</p>
      </div>
    </aside>
  );
}
