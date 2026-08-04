"use client";

import { useCallback, useEffect, useState } from "react";
import { Brain, Loader2, Save } from "lucide-react";
import { listAiMemories, upsertAiMemory } from "@/lib/actions/ai-sources";
import { SectionCard } from "@/components/profile/section-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ProfileEntry {
  category: string;
  label: string;
  content: string;
  updatedAt: Date;
}

/**
 * Coach Profile editor — the AI's persistent memory of how this delegate
 * debates. Injected into every committee generation so answers stay tailored.
 */
export function CoachProfileSection({ workspaceId }: { workspaceId: string }) {
  const [entries, setEntries] = useState<ProfileEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await listAiMemories(workspaceId);
    if (result.status === "success" && result.data) {
      setEntries(result.data.categories);
    }
  }, [workspaceId]);

  useEffect(() => {
    void refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const handleSave = async (category: string) => {
    const entry = entries.find((item) => item.category === category);
    if (!entry) return;
    setSaving(category);
    try {
      const result = await upsertAiMemory(workspaceId, {
        category: entry.category,
        content: entry.content,
      });
      if (result.status === "success") toast.success(result.message);
      else toast.error(result.message);
    } finally {
      setSaving(null);
    }
  };

  return (
    <SectionCard
      title="Coach profile"
      description="What the AI coach remembers about you as a delegate. Used to tailor every brief, strategy, and reply."
      icon={Brain}
    >
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading profile&hellip;
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {entries.map((entry) => (
            <div key={entry.category} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor={`memory-${entry.category}`}>{entry.label}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 px-2 text-xs"
                  disabled={saving === entry.category}
                  onClick={() => void handleSave(entry.category)}
                >
                  {saving === entry.category ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Save className="size-3" />
                  )}
                  Save
                </Button>
              </div>
              <Textarea
                id={`memory-${entry.category}`}
                rows={3}
                placeholder="Not set yet — add a note for the coach…"
                value={entry.content}
                onChange={(event) =>
                  setEntries((current) =>
                    current.map((item) =>
                      item.category === entry.category
                        ? { ...item, content: event.target.value }
                        : item,
                    ),
                  )
                }
                className="resize-y"
              />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
