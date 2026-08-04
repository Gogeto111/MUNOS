"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Bookmark,
  Camera,
  Compass,
  FileBadge,
  FlaskConical,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Settings,
  ShoppingBag,
  Sparkles,
  Stamp,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";

const NAV_ITEMS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "MUNOS OS", href: "/os", icon: Sparkles },
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "Saved", href: "/saved", icon: Bookmark },
  { label: "Profile", href: "/profile", icon: UserRound },
  { label: "Certificates", href: "/certificates", icon: FileBadge },
  { label: "Portfolio", href: "/portfolio", icon: Award },
  { label: "Workspaces", href: "/workspaces", icon: FolderKanban },
  { label: "Simulator", href: "/simulator", icon: FlaskConical },
  { label: "Organizer", href: "/organizer", icon: FolderKanban },
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { label: "Coach", href: "/coach", icon: Camera },
  { label: "News", href: "/news", icon: Newspaper },
  { label: "Social", href: "/social", icon: MessageSquare },
  { label: "Passport", href: "/passport", icon: Stamp },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border/60 bg-background/60 backdrop-blur lg:flex">
      <div className="flex h-16 items-center border-b border-border/60 px-5">
        <Link href="/" aria-label="MUNOS home">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
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
      </nav>

      <div className="border-t border-border/60 p-4">
        <p className="text-xs text-muted-foreground">
          Phase 1 · v1.0.0
        </p>
      </div>
    </aside>
  );
}
