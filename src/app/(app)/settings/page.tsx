"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor, Bell, Mail, FileBadge, Star, Calendar, Eye, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getSettings, updateSettings, type SettingsInput } from "@/lib/actions/profile";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsInput>({
    theme: "system",
    notificationsEnabled: true,
    emailNotifications: true,
    certificateUploads: true,
    newFeatures: true,
    eventReminders: true,
    profilePublic: true,
    showAwards: true,
    showCertificates: true,
    showStats: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((result) => {
      if (result.status === "success" && result.data) {
        setSettings(result.data);
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
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your theme, notifications, and privacy preferences.
        </p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bell className="size-4" /> Notifications
          </CardTitle>
          <CardDescription>Control what notifications you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "notificationsEnabled" as const, label: "Push Notifications", description: "Receive in-app notifications", icon: Bell },
            { key: "emailNotifications" as const, label: "Email Notifications", description: "Receive email updates", icon: Mail },
            { key: "certificateUploads" as const, label: "Certificate Uploads", description: "Notify when certificates are uploaded", icon: FileBadge },
            { key: "newFeatures" as const, label: "New Features", description: "Get notified about new MUNOS features", icon: Star },
            { key: "eventReminders" as const, label: "Event Reminders", description: "Reminders before conference deadlines", icon: Calendar },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <item.icon className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <Switch
                checked={Boolean(settings[item.key])}
                onCheckedChange={(checked) => handleToggle(item.key, checked)}
                disabled={saving}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Eye className="size-4" /> Privacy
          </CardTitle>
          <CardDescription>Control what others can see on your profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "profilePublic" as const, label: "Public Profile", description: "Allow others to view your profile" },
            { key: "showAwards" as const, label: "Show Awards", description: "Display awards on your public profile" },
            { key: "showCertificates" as const, label: "Show Certificates", description: "Display certificates on your public profile" },
            { key: "showStats" as const, label: "Show Stats", description: "Display MUN statistics on your public profile" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Switch
                checked={Boolean(settings[item.key])}
                onCheckedChange={(checked) => handleToggle(item.key, checked)}
                disabled={saving}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
