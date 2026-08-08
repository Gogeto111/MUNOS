"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getSettings, updateSettings, type SettingsInput } from "@/lib/actions/profile";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function AppearanceSettingsPage() {
  const [settings, setSettings] = useState<SettingsInput>({ theme: "system" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((result) => {
      if (result.status === "success" && result.data) {
        setSettings({ theme: result.data.theme });
      }
      setLoading(false);
    });
  }, []);

  async function handleToggle(key: keyof SettingsInput, value: boolean | string) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    setSaving(true);
    const result = await updateSettings({ [key]: value } as SettingsInput);
    setSaving(false);
    if (result.status === "success") {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Monitor className="size-4" /> Appearance
        </CardTitle>
        <CardDescription>Choose your preferred theme</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => handleToggle("theme", t.value)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors ${
                settings.theme === t.value
                  ? "border-brand-500 bg-brand-500/5"
                  : "border-border/60 hover:border-border"
              }`}
            >
              <t.icon className="size-5" />
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
