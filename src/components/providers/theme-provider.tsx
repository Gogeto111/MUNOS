"use client";

import { useEffect, useState } from "react";
import { getSettings } from "@/lib/actions/profile";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "munos-theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Apply cached theme immediately to avoid flash
    const cached = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (cached) {
      applyTheme(cached);
    }

    // Fetch actual theme from DB
    getSettings().then((result) => {
      if (result.status === "success" && result.data) {
        const theme = (result.data.theme as Theme) || "system";
        applyTheme(theme);
        localStorage.setItem(STORAGE_KEY, theme);
      }
      setMounted(true);
    });

    // Listen for system preference changes
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === "system" || !stored) {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", handler);

    return () => mq.removeEventListener("change", handler);
  }, []);

  // Sync theme when storage changes (e.g., from settings page in another tab)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        applyTheme(e.newValue as Theme);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return <>{children}</>;
}
