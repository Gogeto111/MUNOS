import {
  Home,
  Compass,
  Bot,
  Search,
  FolderKanban,
  UserRound,
  Settings,
  Building2,
  BarChart3,
  Gavel,
  Users,
  Globe,
  FileText,
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
  { label: "Country Research", href: "/country-research", icon: Globe, group: "core" },
  { label: "Workspace", href: "/workspaces", icon: FolderKanban, group: "core" },
  { label: "Resolution Builder", href: "/resolution-builder", icon: FileText, group: "core" },
  { label: "Chair Mode", href: "/chair", icon: Gavel, group: "core" },
  { label: "Blocs", href: "/blocs", icon: Users, group: "core" },
  { label: "Passport", href: "/passport", icon: UserRound, group: "core" },
  { label: "Organizer", href: "/organizer", icon: Building2, group: "core" },
  { label: "Analytics", href: "/analytics", icon: BarChart3, group: "core" },
  { label: "Settings", href: "/settings", icon: Settings, group: "system" },
];
