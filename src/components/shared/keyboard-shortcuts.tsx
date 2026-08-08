"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  Keyboard,
  LayoutDashboard,
  FlaskConical,
  Bell,
  Settings,
  Command,
  X,
} from "lucide-react";

const shortcuts = [
  { keys: ["Ctrl", "K"], label: "Command palette", icon: Command },
  { keys: ["Ctrl", "D"], label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { keys: ["Ctrl", "S"], label: "Simulator", icon: FlaskConical, href: "/simulator" },
  { keys: ["Ctrl", "N"], label: "Notifications", icon: Bell, href: "/notifications" },
  { keys: ["Ctrl", ","], label: "Settings", icon: Settings, href: "/settings" },
  { keys: ["?"], label: "Show shortcuts", icon: Keyboard },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      if (e.key === "?") {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "k":
            break;
          case "d":
            e.preventDefault();
            router.push("/dashboard");
            break;
          case "s":
            e.preventDefault();
            router.push("/simulator");
            break;
          case "n":
            e.preventDefault();
            router.push("/notifications");
            break;
          case ",":
            e.preventDefault();
            router.push("/settings");
            break;
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [router, isSignedIn]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex size-9 items-center justify-center rounded-lg border bg-background/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-muted"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="size-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-xl border bg-background p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Keyboard Shortcuts</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-2">
              {shortcuts.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <s.icon className="size-3.5 text-muted-foreground" />
                    <span>{s.label}</span>
                  </div>
                  <div className="flex gap-1">
                    {s.keys.map((key) => (
                      <kbd
                        key={key}
                        className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
