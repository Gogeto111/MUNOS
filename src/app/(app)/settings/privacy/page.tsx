"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Eye, User, Award, BarChart3, FileBadge, Activity, Wifi, Search, Ban } from "lucide-react";
import { toast } from "sonner";
import { getSettings, updateSettings, type SettingsInput } from "@/lib/actions/profile";

type PrivacySettings = Pick<
  SettingsInput,
  "profilePublic" | "showAwards" | "showCertificates" | "showStats" | "showActivityStatus" | "showOnlineStatus" | "searchEngineIndexing"
>;

export default function PrivacySettingsPage() {
  const [settings, setSettings] = useState<PrivacySettings>({
    profilePublic: true,
    showAwards: true,
    showCertificates: true,
    showStats: true,
    showActivityStatus: true,
    showOnlineStatus: true,
    searchEngineIndexing: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((result) => {
      if (result.status === "success" && result.data) {
        setSettings({
          profilePublic: result.data.profilePublic,
          showAwards: result.data.showAwards,
          showCertificates: result.data.showCertificates,
          showStats: result.data.showStats,
          showActivityStatus: result.data.showActivityStatus,
          showOnlineStatus: result.data.showOnlineStatus,
          searchEngineIndexing: result.data.searchEngineIndexing,
        });
      }
      setLoading(false);
    });
  }, []);

  async function handleToggle(key: keyof PrivacySettings, value: boolean) {
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

  const profileItems = [
    { key: "profilePublic" as const, label: "Public Profile", description: "Allow others to view your profile", icon: User },
    { key: "showAwards" as const, label: "Show Awards", description: "Display awards on your public profile", icon: Award },
    { key: "showCertificates" as const, label: "Show Certificates", description: "Display certificates on your public profile", icon: FileBadge },
    { key: "showStats" as const, label: "Show Stats", description: "Display MUN statistics on your public profile", icon: BarChart3 },
  ];

  const activityItems = [
    { key: "showActivityStatus" as const, label: "Activity Status", description: "Show when you were last active", icon: Activity },
    { key: "showOnlineStatus" as const, label: "Online Status", description: "Show when you are currently online", icon: Wifi },
  ];

  const indexingItems = [
    { key: "searchEngineIndexing" as const, label: "Search Engine Indexing", description: "Allow search engines to index your public profile", icon: Search },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Eye className="size-4" /> Profile Visibility
          </CardTitle>
          <CardDescription>Control what others can see on your profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileItems.map((item, i) => (
            <div key={item.key}>
              {i > 0 && <Separator className="mb-4" />}
              <div className="flex items-center justify-between">
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
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="size-4" /> Activity & Presence
          </CardTitle>
          <CardDescription>Control who can see your activity and online status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activityItems.map((item, i) => (
            <div key={item.key}>
              {i > 0 && <Separator className="mb-4" />}
              <div className="flex items-center justify-between">
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
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Search className="size-4" /> Discovery
          </CardTitle>
          <CardDescription>Control how others can find you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {indexingItems.map((item, i) => (
            <div key={item.key}>
              {i > 0 && <Separator className="mb-4" />}
              <div className="flex items-center justify-between">
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
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Ban className="size-4" /> Block List
          </CardTitle>
          <CardDescription>
            Manage users who cannot see your profile or interact with you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You haven&apos;t blocked anyone yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
