"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { NAV_ITEMS, type NavItem } from "@/lib/nav";

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div>
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        {label}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
      </div>
    </div>
  );
}

export function AppSidebar() {
  const mainItems = NAV_ITEMS.filter((i) => i.group === "main");
  const prepItems = NAV_ITEMS.filter((i) => i.group === "preparation");
  const optItems = NAV_ITEMS.filter((i) => i.group === "optional");

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border/60 bg-background/60 backdrop-blur lg:flex">
      <div className="flex h-16 items-center border-b border-border/60 px-5">
        <Link href="/" aria-label="MUNOS home">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-6 px-3 py-4">
        <NavGroup label="Main" items={mainItems} />
        <NavGroup label="Preparation" items={prepItems} />
        <NavGroup label="Optional" items={optItems} />
      </nav>

      <div className="border-t border-border/60 p-4">
        <p className="text-xs text-muted-foreground">
          MUNOS v2.0
        </p>
      </div>
    </aside>
  );
}
