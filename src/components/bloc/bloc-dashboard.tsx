"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Plus,
  Users,
  Globe,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Bloc, Stance, CountryAssignment } from "@/lib/bloc-types";
import {
  getAllBlocs,
  getUserBloc,
  createBloc,
  joinBloc,
  getCountryAssignments,
} from "@/lib/bloc-store";
import { getCountryFlag } from "@/lib/country-flags";
import { BlocCard } from "./bloc-card";
import { CountryAssignmentView } from "./country-assignment";

const BLOC_EMOJIS = ["🕊️", "⚔️", "🤝", "🌍", "🔥", "💎", "🛡️", "⚡", "🎯", "🏛️"];
const BLOC_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
];

export function BlocDashboard() {
  const { user } = useUser();
  const userId = user?.id ?? "anonymous";
  const displayName =
    user?.firstName
      ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
      : "Delegate";
  const userCountry = (user?.publicMetadata?.country as string) ?? "";

  const [blocs, setBlocs] = useState<Bloc[]>([]);
  const [assignments, setAssignments] = useState<CountryAssignment[]>([]);
  const [myBloc, setMyBloc] = useState<Bloc | undefined>();
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState("my-bloc");

  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formEmoji, setFormEmoji] = useState(BLOC_EMOJIS[0]);
  const [formColor, setFormColor] = useState(BLOC_COLORS[0]);
  const [formStance, setFormStance] = useState<Stance>("neutral");

  const refresh = useCallback(() => {
    const all = getAllBlocs();
    setBlocs(all);
    setMyBloc(getUserBloc(userId));
    setAssignments(getCountryAssignments());
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreate = () => {
    if (!formName.trim()) return;
    createBloc({
      name: formName.trim(),
      description: formDesc.trim() || "No description",
      emoji: formEmoji,
      color: formColor,
      stance: formStance,
      userId,
      displayName,
      country: userCountry,
    });
    setFormName("");
    setFormDesc("");
    setFormEmoji(BLOC_EMOJIS[0]);
    setFormColor(BLOC_COLORS[0]);
    setFormStance("neutral");
    setShowCreate(false);
    refresh();
  };

  const handleJoin = (blocId: string) => {
    joinBloc(blocId, { userId, displayName, country: userCountry });
    refresh();
  };

  const availableBlocs = blocs.filter(
    (b) => !b.members.some((m) => m.userId === userId)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Bloc Manager</h2>
            <p className="text-xs text-muted-foreground">
              Form alliances, share notes, coordinate positions
            </p>
          </div>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Create Bloc
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create a New Bloc</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <Input
                placeholder="Bloc name (e.g. ASEAN Caucus)"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
              <Textarea
                placeholder="Brief description of your bloc's goals..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={2}
              />

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Emoji
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {BLOC_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setFormEmoji(e)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-all",
                        formEmoji === e
                          ? "border-primary ring-2 ring-primary/20"
                          : "hover:border-muted-foreground/40"
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Color
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {BLOC_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setFormColor(c)}
                      className={cn(
                        "h-7 w-7 rounded-full border-2 transition-all",
                        formColor === c
                          ? "border-foreground scale-110"
                          : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Stance
                </label>
                <Select
                  value={formStance}
                  onValueChange={(v) => setFormStance(v as Stance)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="con">Con</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCreate}
                disabled={!formName.trim()}
                className="w-full"
              >
                Create Bloc
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="my-bloc" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            My Bloc
          </TabsTrigger>
          <TabsTrigger value="all-blocs" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            All Blocs
          </TabsTrigger>
          <TabsTrigger value="country-map" className="gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            Country Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-bloc" className="mt-4">
          {myBloc ? (
            <BlocCard bloc={myBloc} currentUserId={userId} onUpdate={refresh} />
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium">No bloc yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create a new bloc or join an existing one to get started.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setShowCreate(true)}
                    className="gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Bloc
                  </Button>
                  {availableBlocs.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTab("all-blocs")}
                    >
                      Browse Blocs
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {blocs.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                Quick Join
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableBlocs.slice(0, 4).map((bloc) => (
                  <button
                    key={bloc.id}
                    onClick={() => handleJoin(bloc.id)}
                    className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:ring-2 hover:ring-primary/20"
                    style={{
                      backgroundColor: `${bloc.color}15`,
                      borderColor: `${bloc.color}30`,
                    }}
                  >
                    {bloc.emoji} {bloc.name}
                    <Badge variant="secondary" className="ml-1 text-[10px]">
                      {bloc.members.length}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all-blocs" className="mt-4">
          {blocs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <Users className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No blocs in this conference yet. Be the first to create one!
                </p>
                <Button
                  size="sm"
                  onClick={() => setShowCreate(true)}
                  className="gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Bloc
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-3 pr-4">
                {blocs.map((bloc) => (
                  <div key={bloc.id} className="flex items-start gap-3">
                    <div className="flex-1">
                      <BlocCard
                        bloc={bloc}
                        currentUserId={userId}
                        onUpdate={refresh}
                      />
                    </div>
                    {!bloc.members.some((m) => m.userId === userId) && (
                      <Button
                        size="sm"
                        onClick={() => handleJoin(bloc.id)}
                        className="mt-3 shrink-0 gap-1.5"
                      >
                        <Plus className="h-3 w-3" />
                        Join
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="country-map" className="mt-4">
          <CountryAssignmentView
            blocs={blocs}
            assignments={assignments}
            onAssign={() => refresh()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
