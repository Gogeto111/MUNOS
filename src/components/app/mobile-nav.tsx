"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Bot, Search, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_NAV = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "AI", href: "/assistant", icon: Bot },
  { label: "Research", href: "/research-agent", icon: Search },
  { label: "More", href: "/passport", icon: UserRound },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-sm lg:hidden">
      <div className="flex items-center justify-around px-2 py-1.5">
        {MOBILE_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[10px] font-medium transition-colors min-w-[48px]",
                active
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
