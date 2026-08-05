"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Save,
  Trash2,
} from "lucide-react";

interface ConferenceSettingsProps {
  conference: {
    id: string;
    name: string;
    slug: string;
    tagline: string | null;
    description: string;
    website: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    published: boolean;
    registrationOpen: boolean;
    featured: boolean;
    fee: number | null;
    currency: string;
    capacity: number | null;
  };
  onSave?: (data: Record<string, unknown>) => void;
  onDelete?: () => void;
  onPublish?: (published: boolean) => void;
}

export function ConferenceSettings({
  conference,
  onSave,
  onDelete,
  onPublish,
}: ConferenceSettingsProps) {
  const [name, setName] = useState(conference.name);
  const [tagline, setTagline] = useState(conference.tagline ?? "");
  const [description, setDescription] = useState(conference.description);
  const [website, setWebsite] = useState(conference.website ?? "");
  const [fee, setFee] = useState(conference.fee?.toString() ?? "");
  const [capacity, setCapacity] = useState(conference.capacity?.toString() ?? "");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Settings className="size-4" /> Conference Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="conf-name">Name</Label>
            <Input
              id="conf-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conf-tagline">Tagline</Label>
            <Input
              id="conf-tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Optional tagline"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conf-desc">Description</Label>
            <Textarea
              id="conf-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="conf-website">Website</Label>
              <Input
                id="conf-website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conf-fee">Fee</Label>
              <Input
                id="conf-fee"
                type="number"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="0 for free"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conf-capacity">Capacity</Label>
            <Input
              id="conf-capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="No limit"
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Published</Label>
                <p className="text-xs text-muted-foreground">Visible on Discover</p>
              </div>
              <Switch
                checked={conference.published}
                onCheckedChange={(checked) => onPublish?.(checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Registration Open</Label>
                <p className="text-xs text-muted-foreground">Allow delegate registration</p>
              </div>
              <Switch checked={conference.registrationOpen} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Featured</Label>
                <p className="text-xs text-muted-foreground">Show in featured section</p>
              </div>
              <Switch checked={conference.featured} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="destructive"
          size="sm"
          className="gap-1"
          onClick={onDelete}
        >
          <Trash2 className="size-3" /> Delete Conference
        </Button>
        <Button className="gap-2" onClick={() => onSave?.({ name, tagline, description, website, fee: Number(fee) || null, capacity: Number(capacity) || null })}>
          <Save className="size-3.5" /> Save Changes
        </Button>
      </div>
    </div>
  );
}
