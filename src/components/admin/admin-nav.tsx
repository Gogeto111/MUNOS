"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Library, Plus, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/conferences", label: "Conferences", icon: Library },
  { href: "/admin/conferences/new", label: "Add conference", icon: Plus },
];

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="border-b border-border/60 bg-card">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
        <span className="mr-2 inline-flex items-center gap-1.5 text-sm font-bold">
          <ShieldAlert className="size-4 text-brand-500" />
          Admin
        </span>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
              isActive(link.href)
                ? "bg-brand-500/10 text-brand-700 dark:text-brand-300"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <link.icon className="size-3.5" />
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
