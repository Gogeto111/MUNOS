"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Mail,
  Calendar,
  Award,
  Star,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { getNotificationSettings, updateNotificationSettings } from "@/lib/actions/settings";

export function NotificationPreferences() {
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    eventReminders: true,
    emailNotifications: true,
    certificateUploads: true,
    newFeatures: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getNotificationSettings().then((result) => {
      if (result.status === "success" && result.data) {
        setSettings(result.data);
      }
      setLoading(false);
    });
  }, []);

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updateNotificationSettings(settings);
    if (result.status === "success") {
      toast.success("Preferences saved.");
    } else {
      toast.error(result.message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Bell className="size-4" /> Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="size-4 text-muted-foreground" />
              <div>
                <Label className="text-sm">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Enable in-app notifications</p>
              </div>
            </div>
            <Switch checked={settings.notificationsEnabled} onCheckedChange={() => toggle("notificationsEnabled")} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="size-4 text-muted-foreground" />
              <div>
                <Label className="text-sm">Event Reminders</Label>
                <p className="text-xs text-muted-foreground">Get notified before conferences start</p>
              </div>
            </div>
            <Switch checked={settings.eventReminders} onCheckedChange={() => toggle("eventReminders")} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-muted-foreground" />
              <div>
                <Label className="text-sm">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive email updates about your account</p>
              </div>
            </div>
            <Switch checked={settings.emailNotifications} onCheckedChange={() => toggle("emailNotifications")} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="size-4 text-muted-foreground" />
              <div>
                <Label className="text-sm">Certificate Uploads</Label>
                <p className="text-xs text-muted-foreground">Notify when new certificates are issued</p>
              </div>
            </div>
            <Switch checked={settings.certificateUploads} onCheckedChange={() => toggle("certificateUploads")} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="size-4 text-muted-foreground" />
              <div>
                <Label className="text-sm">New Features</Label>
                <p className="text-xs text-muted-foreground">Get notified about new MUNOS features</p>
              </div>
            </div>
            <Switch checked={settings.newFeatures} onCheckedChange={() => toggle("newFeatures")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="gap-2" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
