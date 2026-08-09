"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Brain, Target, Lightbulb, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getPersonalMemories,
  upsertMemory,
  deleteMemory,
} from "@/lib/actions/ai-memory";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "strength", label: "Strength", icon: Target, color: "text-green-500" },
  { value: "weakness", label: "Weakness", icon: BarChart3, color: "text-red-500" },
  { value: "preference", label: "Preference", icon: Lightbulb, color: "text-yellow-500" },
  { value: "style", label: "Style", icon: Users, color: "text-blue-500" },
  { value: "history", label: "History", icon: Brain, color: "text-purple-500" },
];

interface Mem {
  category: string;
  key: string;
  value: string;
  confidence: number;
}

export default function MemoryPage() {
  const [memories, setMemories] = useState<Mem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [category, setCategory] = useState("strength");
  const [content, setContent] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { loadMemories(); }, []);

  const loadMemories = async () => {
    const result = await getPersonalMemories();
    setMemories(result);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!content.trim()) return;
    setAdding(true);
    const result = await upsertMemory(category, content.trim().slice(0, 80), content.trim());
    if (result.status === "success") {
      toast.success("Memory saved");
      setContent("");
      setShowAdd(false);
      loadMemories();
    } else {
      toast.error(result.message || "Failed");
    }
    setAdding(false);
  };

  const handleDelete = async (cat: string, key: string) => {
    const result = await deleteMemory(cat, key);
    if (result.status === "success") {
      toast.success("Deleted");
      loadMemories();
    }
  };

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: memories.filter((m) => m.category === cat.value),
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Personal AI Memory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The AI remembers your strengths, weaknesses, and preferences across sessions.
          </p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="mr-1 size-4" /> Add Memory
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader><CardTitle className="text-sm">New Memory</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    category === cat.value
                      ? "border-brand-500 bg-brand-500/10 text-brand-600"
                      : "border-border/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <cat.icon className={`size-3 ${cat.color}`} />
                  {cat.label}
                </button>
              ))}
            </div>
            <Textarea
              placeholder="What should the AI remember about you?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={adding || !content.trim()}>
                {adding ? <Loader2 className="mr-1 size-4 animate-spin" /> : null} Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {grouped.map((cat) => (
            <Card key={cat.value}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <cat.icon className={`size-4 ${cat.color}`} />
                  {cat.label}
                  <Badge variant="secondary" className="ml-auto text-[10px]">{cat.items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {cat.items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No memories yet</p>
                ) : (
                  cat.items.map((mem) => (
                    <div key={mem.key} className="group flex items-start gap-2 rounded-lg border border-border/50 p-2">
                      <p className="flex-1 text-sm text-muted-foreground">{mem.value}</p>
                      <button
                        onClick={() => handleDelete(mem.category, mem.key)}
                        className="hidden shrink-0 text-muted-foreground hover:text-red-500 group-hover:block"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
