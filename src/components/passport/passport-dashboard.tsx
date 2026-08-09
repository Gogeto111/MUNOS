"use client";

import { useState, useEffect } from "react";
import {
  UserRound, Award, BookOpen, BarChart3, Settings, Shield, Eye, EyeOff,
  Trophy, Medal, Star, Target, Clock, FileText, Globe, GraduationCap,
  ChevronDown, Copy, Download, Lock, LockIcon, Camera, Edit3,
  TrendingUp, Users, MessageSquare, Mic, Lightbulb, CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PassportTab = "identity" | "achievements" | "analytics" | "certificates" | "privacy";

interface PassportData {
  name: string;
  school: string;
  grade: string;
  city: string;
  country: string;
  experienceLevel: string;
  bio: string;
  munExperience: string;
  conferencesAttended: number;
  bestDelegate: number;
  verbalCommendation: number;
  honorableMention: number;
  specialMentions: number;
  committees: string[];
  countriesRepresented: string[];
  awards: { title: string; conference: string; year: number; category: string }[];
  certificates: { id: string; name: string; conference: string; date: string; url: string }[];
  privacy: {
    profileVisibility: "public" | "connections" | "private";
    hideAwards: boolean;
    hideSchool: boolean;
    hideEmail: boolean;
    hidePhone: boolean;
    hideConferences: boolean;
  };
  stats: {
    speechesDelivered: number;
    avgSpeechLength: number;
    speakingFrequency: number;
    poisAsked: number;
    poisAnswered: number;
    alliancesFormed: number;
    resolutionsContributed: number;
    aiScore: number;
    improvementResearch: number;
    improvementDelivery: number;
  };
}

const EXPERIENCE_LEVELS = ["Novice", "Experienced", "Advanced", "Expert", "Veteran"];

const ACHIEVEMENTS = [
  { id: "first-mun", name: "First Steps", desc: "Attend your first MUN", icon: "🌱", threshold: 1, field: "conferencesAttended" },
  { id: "five-muns", name: "Regular Delegate", desc: "Attend 5 MUNs", icon: "🟢", threshold: 5, field: "conferencesAttended" },
  { id: "ten-muns", name: "MUN Veteran", desc: "Attend 10 MUNs", icon: "🟡", threshold: 10, field: "conferencesAttended" },
  { id: "best-delegate", name: "Best Delegate", desc: "Win Best Delegate", icon: "🏆", threshold: 1, field: "bestDelegate" },
  { id: "five-best", name: "Dominant Force", desc: "Win Best Delegate 5 times", icon: "👑", threshold: 5, field: "bestDelegate" },
  { id: "first-vc", name: "Commended", desc: "Win Verbal Commendation", icon: "⭐", threshold: 1, field: "verbalCommendation" },
  { id: "first-hm", name: "Honored", desc: "Win Honorable Mention", icon: "🎖️", threshold: 1, field: "honorableMention" },
  { id: "five-committees", name: "Versatile", desc: "Serve in 5 different committees", icon: "🔄", threshold: 5, field: "committees" },
  { id: "five-countries", name: "Global Citizen", desc: "Represent 5 different countries", icon: "🌍", threshold: 5, field: "countriesRepresented" },
  { id: "speaker-10", name: "Voice of the Committee", desc: "Deliver 10 speeches", icon: "🎤", threshold: 10, field: "speechesDelivered" },
  { id: "poi-master", name: "POI Master", desc: "Ask 20 POIs", icon: "💬", threshold: 20, field: "poisAsked" },
  { id: "alliance-builder", name: "Alliance Builder", desc: "Form 5 alliances", icon: "🤝", threshold: 5, field: "alliancesFormed" },
  { id: "resolution-writer", name: "Resolution Author", desc: "Contribute to 3 resolutions", icon: "📜", threshold: 3, field: "resolutionsContributed" },
  { id: "ai-scorer", name: "AI Rated", desc: "Get an AI score above 80", icon: "🧠", threshold: 80, field: "aiScore" },
  { id: "improver", name: "Constant Improver", desc: "Improve research score by 15%", icon: "📈", threshold: 15, field: "improvementResearch" },
];

const LEVELS = [
  { name: "Novice", min: 0, color: "text-green-600", bg: "bg-green-500/10" },
  { name: "Experienced", min: 3, color: "text-blue-600", bg: "bg-blue-500/10" },
  { name: "Advanced", min: 7, color: "text-purple-600", bg: "bg-purple-500/10" },
  { name: "Expert", min: 12, color: "text-amber-600", bg: "bg-amber-500/10" },
  { name: "Veteran", min: 20, color: "text-red-600", bg: "bg-red-500/10" },
];

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const STORAGE_KEY = "munos-passport";

function loadPassport(): PassportData {
  if (typeof window === "undefined") return DEFAULT_PASSPORT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PASSPORT, ...JSON.parse(raw) } : DEFAULT_PASSPORT;
  } catch { return DEFAULT_PASSPORT; }
}

function savePassport(data: PassportData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const DEFAULT_PASSPORT: PassportData = {
  name: "", school: "", grade: "", city: "", country: "",
  experienceLevel: "Novice", bio: "", munExperience: "",
  conferencesAttended: 0, bestDelegate: 0, verbalCommendation: 0,
  honorableMention: 0, specialMentions: 0, committees: [],
  countriesRepresented: [], awards: [], certificates: [],
  privacy: {
    profileVisibility: "public", hideAwards: false, hideSchool: false,
    hideEmail: false, hidePhone: false, hideConferences: false,
  },
  stats: {
    speechesDelivered: 0, avgSpeechLength: 0, speakingFrequency: 0,
    poisAsked: 0, poisAnswered: 0, alliancesFormed: 0,
    resolutionsContributed: 0, aiScore: 0, improvementResearch: 0,
    improvementDelivery: 0,
  },
};

// ---------------------------------------------------------------------------
// Level Calculator
// ---------------------------------------------------------------------------

function getLevel(data: PassportData): typeof LEVELS[number] {
  const total = data.conferencesAttended + data.bestDelegate * 3 +
    data.verbalCommendation * 2 + data.honorableMention +
    data.committees.length + data.countriesRepresented.length;
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (total >= l.min) level = l;
  }
  return level;
}

function getLevelProgress(data: PassportData): number {
  const total = data.conferencesAttended + data.bestDelegate * 3 +
    data.verbalCommendation * 2 + data.honorableMention +
    data.committees.length + data.countriesRepresented.length;
  const current = LEVELS.findIndex((l) => l.name === getLevel(data).name);
  const next = current < LEVELS.length - 1 ? LEVELS[current + 1] : null;
  if (!next) return 100;
  const range = next.min - LEVELS[current].min;
  const progress = total - LEVELS[current].min;
  return Math.min(100, Math.round((progress / range) * 100));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PassportDashboard() {
  const [data, setData] = useState<PassportData>(DEFAULT_PASSPORT);
  const [tab, setTab] = useState<PassportTab>("identity");
  const [editing, setEditing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setData(loadPassport());
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) savePassport(data);
  }, [data, initialized]);

  const update = (patch: Partial<PassportData>) => setData((d) => ({ ...d, ...patch }));
  const updatePrivacy = (patch: Partial<PassportData["privacy"]>) =>
    setData((d) => ({ ...d, privacy: { ...d.privacy, ...patch } }));
  const updateStats = (patch: Partial<PassportData["stats"]>) =>
    setData((d) => ({ ...d, stats: { ...d.stats, ...patch } }));

  const level = getLevel(data);
  const levelProgress = getLevelProgress(data);
  const unlockedAchievements = ACHIEVEMENTS.filter((a) => {
    const val = a.field in data.stats
      ? (data.stats as Record<string, number>)[a.field]
      : (data as unknown as Record<string, number>)[a.field];
    return typeof val === "number" && val >= a.threshold;
  });

  const tabs: { key: PassportTab; label: string; icon: React.ReactNode }[] = [
    { key: "identity", label: "Identity", icon: <UserRound className="h-3.5 w-3.5" /> },
    { key: "achievements", label: "Achievements", icon: <Award className="h-3.5 w-3.5" /> },
    { key: "analytics", label: "Analytics", icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { key: "certificates", label: "Certificates", icon: <FileText className="h-3.5 w-3.5" /> },
    { key: "privacy", label: "Privacy", icon: <Shield className="h-3.5 w-3.5" /> },
  ];

  if (!initialized) return null;

  return (
    <div className="space-y-6">
      {/* Passport Header Card */}
      <Card className="overflow-hidden border-brand-500/20">
        <div className="h-24 bg-gradient-to-r from-brand-500/20 via-brand-500/10 to-transparent" />
        <CardContent className="relative -mt-12 px-6 pb-6">
          <div className="flex items-end gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-background bg-muted text-2xl font-bold text-muted-foreground">
              {data.name ? data.name.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-xl font-bold">{data.name || "Your Name"}</h1>
              <p className="text-sm text-muted-foreground">
                {data.school || "School"} {data.grade ? `· ${data.grade}` : ""}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge className={cn("text-xs", level.bg, level.color)}>
                {level.name} Delegate
              </Badge>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Star className="h-3 w-3" />
                {unlockedAchievements.length}/{ACHIEVEMENTS.length} achievements
              </div>
            </div>
          </div>
          {/* Level progress */}
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{level.name}</span>
              <span>{levelProgress}% to next level</span>
            </div>
            <Progress value={levelProgress} className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              tab === t.key
                ? "bg-brand-500/10 text-brand-600"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Identity Tab */}
      {tab === "identity" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">MUN Delegate Passport</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => setEditing(!editing)}>
                  <Edit3 className="mr-1 h-3 w-3" /> {editing ? "Save" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">Full Name</label>
                  <Input value={data.name} onChange={(e) => update({ name: e.target.value })} disabled={!editing} className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">School / University</label>
                  <Input value={data.school} onChange={(e) => update({ school: e.target.value })} disabled={!editing} className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">Grade / Year</label>
                  <Input value={data.grade} onChange={(e) => update({ grade: e.target.value })} disabled={!editing} className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">City</label>
                  <Input value={data.city} onChange={(e) => update({ city: e.target.value })} disabled={!editing} className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">Country</label>
                  <Input value={data.country} onChange={(e) => update({ country: e.target.value })} disabled={!editing} className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">Experience Level</label>
                  <select
                    value={data.experienceLevel}
                    onChange={(e) => update({ experienceLevel: e.target.value })}
                    disabled={!editing}
                    className="mt-1 h-8 w-full rounded-md border border-border bg-transparent px-2 text-xs"
                  >
                    {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Bio</label>
                <Textarea value={data.bio} onChange={(e) => update({ bio: e.target.value })} disabled={!editing} className="min-h-[60px] text-xs mt-1" placeholder="Tell other delegates about yourself..." />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "MUNs", value: data.conferencesAttended, icon: <Globe className="h-3.5 w-3.5" /> },
              { label: "Best Delegate", value: data.bestDelegate, icon: <Trophy className="h-3.5 w-3.5" /> },
              { label: "Verbal", value: data.verbalCommendation, icon: <Medal className="h-3.5 w-3.5" /> },
              { label: "Honorable", value: data.honorableMention, icon: <Star className="h-3.5 w-3.5" /> },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="rounded-lg bg-muted p-2">{s.icon}</div>
                  <div>
                    <div className="text-lg font-bold">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground">{s.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Committees & Countries */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs">Committees Served</CardTitle>
              </CardHeader>
              <CardContent>
                {data.committees.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No committees recorded yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {data.committees.map((c, i) => <Badge key={i} variant="outline" className="text-[10px]">{c}</Badge>)}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs">Countries Represented</CardTitle>
              </CardHeader>
              <CardContent>
                {data.countriesRepresented.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No countries recorded yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {data.countriesRepresented.map((c, i) => <Badge key={i} variant="outline" className="text-[10px]">{c}</Badge>)}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Achievements Tab */}
      {tab === "achievements" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Achievements</h3>
            <Badge variant="outline" className="text-[10px]">
              {unlockedAchievements.length}/{ACHIEVEMENTS.length} unlocked
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ACHIEVEMENTS.map((a) => {
              const val = a.field in data.stats
                ? (data.stats as Record<string, number>)[a.field]
                : (data as unknown as Record<string, number>)[a.field];
              const unlocked = typeof val === "number" && val >= a.threshold;
              return (
                <div
                  key={a.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                    unlocked
                      ? "border-brand-500/20 bg-brand-500/5"
                      : "border-border/30 bg-muted/20 opacity-50"
                  )}
                >
                  <span className="text-2xl">{unlocked ? a.icon : "🔒"}</span>
                  <div className="flex-1">
                    <div className="text-xs font-medium">{a.name}</div>
                    <div className="text-[10px] text-muted-foreground">{a.desc}</div>
                  </div>
                  {unlocked && <CheckCircle className="h-4 w-4 text-brand-500" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {tab === "analytics" && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">MUN Analytics</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: "Speeches Delivered", value: data.stats.speechesDelivered, icon: <Mic className="h-3.5 w-3.5" /> },
              { label: "Avg Speech Length", value: `${data.stats.avgSpeechLength}s`, icon: <Clock className="h-3.5 w-3.5" /> },
              { label: "POIs Asked", value: data.stats.poisAsked, icon: <MessageSquare className="h-3.5 w-3.5" /> },
              { label: "POIs Answered", value: data.stats.poisAnswered, icon: <Lightbulb className="h-3.5 w-3.5" /> },
              { label: "Alliances Formed", value: data.stats.alliancesFormed, icon: <Users className="h-3.5 w-3.5" /> },
              { label: "Resolutions", value: data.stats.resolutionsContributed, icon: <FileText className="h-3.5 w-3.5" /> },
              { label: "AI Score", value: data.stats.aiScore ? `${data.stats.aiScore}/100` : "—", icon: <Target className="h-3.5 w-3.5" /> },
              { label: "Research Growth", value: data.stats.improvementResearch ? `+${data.stats.improvementResearch}%` : "—", icon: <TrendingUp className="h-3.5 w-3.5" /> },
              { label: "Delivery Growth", value: data.stats.improvementDelivery ? `+${data.stats.improvementDelivery}%` : "—", icon: <TrendingUp className="h-3.5 w-3.5" /> },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="rounded-lg bg-muted p-2">{s.icon}</div>
                  <div>
                    <div className="text-lg font-bold">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground">{s.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Certificates Tab */}
      {tab === "certificates" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Certificates</h3>
            <Button size="sm" variant="outline" className="h-7 text-[10px]">
              <FileText className="mr-1 h-3 w-3" /> Upload Certificate
            </Button>
          </div>
          {data.certificates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No certificates uploaded yet.</p>
                <p className="mt-1 text-xs text-muted-foreground/60">Upload your MUN certificates to build your portfolio.</p>
                <Button size="sm" className="mt-4 text-xs">
                  <FileText className="mr-1 h-3 w-3" /> Upload First Certificate
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.certificates.map((cert) => (
                <Card key={cert.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium">{cert.name}</div>
                        <div className="text-xs text-muted-foreground">{cert.conference}</div>
                        <div className="text-[10px] text-muted-foreground">{cert.date}</div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Privacy Tab */}
      {tab === "privacy" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4" />
                Privacy Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Profile Visibility</label>
                <div className="mt-1.5 flex gap-2">
                  {[
                    { key: "public" as const, label: "Public", icon: <Globe className="h-3 w-3" /> },
                    { key: "connections" as const, label: "Connections", icon: <Users className="h-3 w-3" /> },
                    { key: "private" as const, label: "Private", icon: <Lock className="h-3 w-3" /> },
                  ].map((v) => (
                    <button
                      key={v.key}
                      onClick={() => updatePrivacy({ profileVisibility: v.key })}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                        data.privacy.profileVisibility === v.key
                          ? "border-brand-500 bg-brand-500/10 text-brand-600"
                          : "border-border/60 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {v.icon} {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { key: "hideAwards" as const, label: "Hide awards from public profile" },
                  { key: "hideSchool" as const, label: "Hide school / university" },
                  { key: "hideEmail" as const, label: "Hide email address" },
                  { key: "hidePhone" as const, label: "Hide phone number" },
                  { key: "hideConferences" as const, label: "Hide conference history" },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-3 rounded-lg border border-border/30 px-3 py-2 cursor-pointer hover:bg-muted/50">
                    <input
                      type="checkbox"
                      checked={data.privacy[item.key]}
                      onChange={(e) => updatePrivacy({ [item.key]: e.target.checked })}
                      className="rounded border-border"
                    />
                    <span className="text-xs">{item.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
