import {
  Home,
  Compass,
  Bot,
  Search,
  FolderKanban,
  UserRound,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  group: "core" | "system";
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home, group: "core" },
  { label: "Discover", href: "/discover", icon: Compass, group: "core" },
  { label: "AI Assistant", href: "/assistant", icon: Bot, group: "core" },
  { label: "Research", href: "/research-agent", icon: Search, group: "core" },
  { label: "Workspace", href: "/workspaces", icon: FolderKanban, group: "core" },
  { label: "Passport", href: "/passport", icon: UserRound, group: "core" },
  { label: "Settings", href: "/settings", icon: Settings, group: "system" },
];
