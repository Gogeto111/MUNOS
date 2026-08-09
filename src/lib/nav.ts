import {
  Bot,
  Compass,
  FolderKanban,
  LayoutDashboard,
  Search,
  Settings,
  Shield,
  Target,
  Trophy,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  group: "main" | "preparation" | "optional";
}

export const NAV_ITEMS: NavItem[] = [
  // MAIN
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "main" },
  { label: "AI Assistant", href: "/assistant", icon: Bot, group: "main" },
  { label: "Research Agent", href: "/research-agent", icon: Search, group: "main" },
  { label: "Discover MUNs", href: "/discover", icon: Compass, group: "main" },
  { label: "Profile", href: "/profile", icon: UserRound, group: "main" },

  // PREPARATION
  { label: "Workspaces", href: "/workspaces", icon: FolderKanban, group: "preparation" },
  { label: "Simulator", href: "/simulator", icon: Target, group: "preparation" },
  { label: "Situation Room", href: "/situation-room", icon: Shield, group: "preparation" },
  { label: "Performance", href: "/scoring", icon: Trophy, group: "preparation" },

  // OPTIONAL
  { label: "Settings", href: "/settings", icon: Settings, group: "optional" },
];
