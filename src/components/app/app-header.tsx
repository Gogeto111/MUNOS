"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { NotificationCenter } from "@/components/shared/notification-center";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserButton, useUser } from "@clerk/nextjs";
import { isAuthConfigured } from "@/lib/public-env";
import { NAV_ITEMS } from "@/lib/nav";
import { GlobalSearch } from "@/components/search/global-search";

export function AppHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const current =
    NAV_ITEMS.find((item) => pathname === item.href)?.label ?? "Dashboard";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="border-b border-border/60 px-5 py-4 text-left">
              <SheetTitle asChild>
                <Link href="/" onClick={() => setOpen(false)}>
                  <Logo />
                </Link>
              </SheetTitle>
            </SheetHeader>
            <nav className="space-y-1 p-3">
              {NAV_ITEMS.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
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
          </SheetContent>
        </Sheet>

        <div className="lg:hidden">
          <Logo showText={false} />
        </div>
        <span className="hidden text-sm font-medium text-muted-foreground lg:inline">
          {current}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <GlobalSearch className="hidden w-64 lg:block" />
        {isAuthConfigured && <NotificationCenter />}
        {isAuthConfigured ? (
          <ClerkAuthUser />
        ) : (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

function ClerkAuthUser() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <span className="size-8 animate-pulse rounded-full bg-muted" />;
  }
  if (!isSignedIn) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-muted-foreground sm:inline">
        {user.firstName ? `Welcome, ${user.firstName}` : "Welcome back"}
      </span>
      <UserButton />
    </div>
  );
}
