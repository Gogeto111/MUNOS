"use client";

import { useState } from "react";
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
  MessageSquare,
  Star,
  Save,
} from "lucide-react";

interface NotificationSettings {
  eventReminders: boolean;
  emailNotifications: boolean;
  certificateUploads: boolean;
  newFeatures: boolean;
  reviewNotifications: boolean;
  workspaceUpdates: boolean;
  socialActivity: boolean;
  weeklyDigest: boolean;
}

export function NotificationPreferences() {
  const [settings, setSettings] = useState<NotificationSettings>({
    eventReminders: true,
    emailNotifications: true,
    certificateUploads: true,
    newFeatures: true,
    reviewNotifications: false,
    workspaceUpdates: true,
    socialActivity: false,
    weeklyDigest: true,
  });

  const toggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="size-4 text-muted-foreground" />
              <div>
                <Label className="text-sm">Social Activity</Label>
                <p className="text-xs text-muted-foreground">Notifications for follows, messages, and mentions</p>
              </div>
            </div>
            <Switch checked={settings.socialActivity} onCheckedChange={() => toggle("socialActivity")} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="size-4 text-muted-foreground" />
              <div>
                <Label className="text-sm">Weekly Digest</Label>
                <p className="text-xs text-muted-foreground">Summary of your MUN activity each week</p>
              </div>
            </div>
            <Switch checked={settings.weeklyDigest} onCheckedChange={() => toggle("weeklyDigest")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="gap-2">
          <Save className="size-3.5" /> Save Preferences
        </Button>
      </div>
    </div>
  );
}
