"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createConference } from "@/lib/actions/conference";
import type { ConferenceDraft } from "@/lib/actions/conference";

const step1Schema = z.object({
  name: z.string().min(1, "Conference name is required").max(300),
  description: z.string().min(1, "Description is required").max(8000),
  theme: z.string().max(200).optional().or(z.literal("")),
  format: z.enum(["ONLINE", "OFFLINE", "HYBRID"]),
  difficulty: z.enum(["FIRST_TIMER", "BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
});

const step2Schema = z.array(
  z.object({
    name: z.string().min(1, "Committee name is required").max(200),
    topic: z.string().max(200).optional().or(z.literal("")),
    description: z.string().max(2000).optional().or(z.literal("")),
    maxDelegates: z.string().max(6).optional().or(z.literal("")),
  })
).min(1, "Add at least one committee");

const step3Schema = z.object({
  registrationDeadline: z.string().min(1, "Registration deadline is required"),
  capacity: z.string().max(6).optional().or(z.literal("")),
  fee: z.string().optional().or(z.literal("0")),
  currency: z.string().min(1).max(3),
});

interface CommitteeDraft {
  name: string;
  topic: string;
  description: string;
  maxDelegates: string;
}

const STEPS = ["Basic Info", "Committees & Agendas", "Registration Settings", "Review & Publish"];

export function ConferenceCreator() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("");
  const [format, setFormat] = useState<"ONLINE" | "OFFLINE" | "HYBRID">("OFFLINE");
  const [difficulty, setDifficulty] = useState<"FIRST_TIMER" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT">("BEGINNER");

  const [committees, setCommittees] = useState<CommitteeDraft[]>([]);

  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [capacity, setCapacity] = useState("");
  const [fee, setFee] = useState("0");
  const [currency, setCurrency] = useState("USD");

  const progress = ((step + 1) / STEPS.length) * 100;

  function validateStep(): boolean {
    setErrors({});
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      const result = step1Schema.safeParse({ name, description, theme, format, difficulty });
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          newErrors[issue.path.join(".")] = issue.message;
        });
      }
    }

    if (step === 1) {
      const result = step2Schema.safeParse(committees);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          newErrors[`committee_${issue.path.join(".")}`] = issue.message;
        });
      }
    }

    if (step === 2) {
      const result = step3Schema.safeParse({ registrationDeadline, capacity, fee, currency });
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          newErrors[issue.path.join(".")] = issue.message;
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (validateStep()) setStep((s) => s + 1);
  }

  function handleBack() {
    setStep((s) => s - 1);
  }

  function addCommittee() {
    if (committees.length >= 10) return;
    setCommittees((prev) => [...prev, { name: "", topic: "", description: "", maxDelegates: "" }]);
  }

  function updateCommittee(index: number, fields: Partial<CommitteeDraft>) {
    setCommittees((prev) => prev.map((c, i) => (i === index ? { ...c, ...fields } : c)));
  }

  function removeCommittee(index: number) {
    setCommittees((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    startTransition(async () => {
      const draft: ConferenceDraft = {
        conference: {
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9\s_-]/g, "").replace(/[\s_-]+/g, "-"),
          tagline: "",
          description,
          theme: theme || undefined,
          format,
          difficulty,
          startDate: "",
          endDate: "",
          registrationOpen: true,
          externalDelegates: true,
          fee: fee || "0",
          currency,
          registrationDeadline: registrationDeadline || undefined,
          capacity: capacity || undefined,
          website: "",
          email: "",
          city: "",
          country: "",
          featured: false,
          published: true,
        },
        organizer: { name: "" },
        venue: { name: "", city: "", country: "" },
        committees: committees.map((c) => ({
          name: c.name,
          topic: c.topic || undefined,
          description: c.description || undefined,
          difficulty: "INTERMEDIATE" as const,
          maxDelegates: c.maxDelegates || undefined,
          countryMatrix: [],
        })),
        agenda: [],
        brochures: [],
        gallery: [],
        socialLinks: [],
        awards: [],
        faqs: [],
        secretariat: [],
      };

      const result = await createConference(draft);
      if (result.status === "success") {
        toast.success("Conference created successfully!");
        router.push("/organizer");
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Conference</h1>
        <p className="text-sm text-muted-foreground">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>
      </div>

      <Progress value={progress} className="h-1.5" />

      <div className="flex gap-2 text-xs text-muted-foreground">
        {STEPS.map((s, i) => (
          <span key={s} className={i === step ? "font-medium text-foreground" : ""}>
            {i < step ? "✓ " : ""}
            {s}
            {i < STEPS.length - 1 && " → "}
          </span>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Basic Information</h2>
              <div className="space-y-2">
                <Label htmlFor="name">Conference Name *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Harvard MUN 2026" />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your conference..." rows={4} />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Input id="theme" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="e.g. Global Cooperation in the 21st Century" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONLINE">Online</SelectItem>
                      <SelectItem value="OFFLINE">In-Person</SelectItem>
                      <SelectItem value="HYBRID">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIRST_TIMER">First Timer</SelectItem>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                      <SelectItem value="EXPERT">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Committees & Agendas</h2>
                  <p className="text-sm text-muted-foreground">Add 1–10 committees for your conference.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addCommittee} disabled={committees.length >= 10}>
                  <Plus className="size-4" /> Add Committee
                </Button>
              </div>
              {committees.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">No committees yet. Click &quot;Add Committee&quot; to start.</p>
                </div>
              )}
              {errors.committee_ && <p className="text-xs text-destructive">{errors.committee_}</p>}
              <div className="space-y-4">
                {committees.map((c, i) => (
                  <div key={i} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Committee {i + 1}</span>
                      <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeCommittee(i)}>
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Name *</Label>
                        <Input value={c.name} onChange={(e) => updateCommittee(i, { name: e.target.value })} placeholder="e.g. UN Security Council" />
                      </div>
                      <div className="space-y-1">
                        <Label>Topic</Label>
                        <Input value={c.topic} onChange={(e) => updateCommittee(i, { topic: e.target.value })} placeholder="e.g. Cybersecurity" />
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Description</Label>
                        <Input value={c.description} onChange={(e) => updateCommittee(i, { description: e.target.value })} placeholder="Brief description..." />
                      </div>
                      <div className="space-y-1">
                        <Label>Max Delegates</Label>
                        <Input type="number" min="1" value={c.maxDelegates} onChange={(e) => updateCommittee(i, { maxDelegates: e.target.value })} placeholder="No limit" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Registration Settings</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Registration Deadline *</Label>
                  <Input id="deadline" type="date" value={registrationDeadline} onChange={(e) => setRegistrationDeadline(e.target.value)} />
                  {errors.registrationDeadline && <p className="text-xs text-destructive">{errors.registrationDeadline}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Unlimited" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fee">Registration Fee</Label>
                  <Input id="fee" type="number" min="0" step="0.01" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                      <SelectItem value="SGD">SGD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Review & Publish</h2>
              <div className="space-y-3">
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-semibold mb-2">Basic Info</h3>
                  <ReviewItem label="Name" value={name} />
                  <ReviewItem label="Description" value={description} />
                  <ReviewItem label="Theme" value={theme} />
                  <ReviewItem label="Format" value={format} />
                  <ReviewItem label="Difficulty" value={difficulty} />
                </div>
                {committees.length > 0 && (
                  <div className="rounded-lg border p-4">
                    <h3 className="text-sm font-semibold mb-2">Committees ({committees.length})</h3>
                    {committees.map((c, i) => (
                      <ReviewItem
                        key={i}
                        label={c.name || `Committee ${i + 1}`}
                        value={[c.topic, c.maxDelegates && `Max ${c.maxDelegates}`].filter(Boolean).join(" · ")}
                      />
                    ))}
                  </div>
                )}
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-semibold mb-2">Registration</h3>
                  <ReviewItem label="Deadline" value={registrationDeadline} />
                  <ReviewItem label="Capacity" value={capacity || "Unlimited"} />
                  <ReviewItem label="Fee" value={`${fee || "0"} ${currency}`} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack} disabled={step === 0 || isPending}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={handleNext} disabled={isPending}>
            Next <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Create Conference
          </Button>
        )}
      </div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground min-w-[100px]">{label}:</span>
      <span>{String(value)}</span>
    </div>
  );
}
