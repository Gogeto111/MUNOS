"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Compass,
  FolderKanban,
  FlaskConical,
  Settings,
  MessageSquare,
  Newspaper,
  Trophy,
  UserRound,
  Search,
  LayoutDashboard,
  Camera,
  BarChart3,
  ScrollText,
} from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "Workspaces", href: "/workspaces", icon: FolderKanban },
  { label: "Simulator", href: "/simulator", icon: FlaskConical },
  { label: "Coach", href: "/coach", icon: Camera },
  { label: "News", href: "/news", icon: Newspaper },
  { label: "Social", href: "/social", icon: MessageSquare },
  { label: "Profile", href: "/profile", icon: UserRound },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Resolutions", href: "/resolutions", icon: ScrollText },
  { label: "Settings", href: "/settings", icon: Settings },
];

const RECENT_KEY = "munos-recent-pages";
const MAX_RECENT = 5;

function getRecentPages(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addRecentPage(href: string) {
  if (typeof window === "undefined") return;
  const recent = getRecentPages().filter((r) => r !== href);
  recent.unshift(href);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function navigate(href: string) {
    addRecentPage(href);
    setOpen(false);
    router.push(href);
  }

  const recentPages = getRecentPages()
    .map((href) => QUICK_ACTIONS.find((a) => a.href === href))
    .filter(Boolean) as typeof QUICK_ACTIONS;

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command Palette" description="Navigate and search MUNOS">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {recentPages.length > 0 && (
          <CommandGroup heading="Recent">
            {recentPages.map((action) => {
              const Icon = action.icon;
              return (
                <CommandItem
                  key={action.href}
                  value={action.label}
                  onSelect={() => navigate(action.href)}
                >
                  <Icon className="size-4" />
                  <span>{action.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        <CommandGroup heading="Navigation">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <CommandItem
                key={action.href}
                value={action.label}
                onSelect={() => navigate(action.href)}
              >
                <Icon className="size-4" />
                <span>{action.label}</span>
                <CommandShortcut>{action.href}</CommandShortcut>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Search">
          <CommandItem value="global-search" onSelect={() => { setOpen(false); navigate("/discover?q=search"); }}>
            <Search className="size-4" />
            <span>Search conferences</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
