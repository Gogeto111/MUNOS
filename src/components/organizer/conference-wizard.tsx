"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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

interface CommitteeDraft {
  name: string;
  topic: string;
  description: string;
  maxDelegates: string;
}

const STEPS = ["Basic Info", "Details", "Location", "Committees", "Review"];

const initialData: ConferenceDraft = {
  conference: {
    name: "",
    slug: "",
    tagline: "",
    description: "",
    theme: "",
    format: "OFFLINE",
    difficulty: "BEGINNER",
    startDate: "",
    endDate: "",
    registrationOpen: true,
    externalDelegates: true,
    fee: "0",
    currency: "USD",
    registrationDeadline: "",
    capacity: "",
    website: "",
    email: "",
    city: "",
    country: "",
    featured: false,
    published: true,
  },
  organizer: {
    name: "",
  },
  venue: {
    name: "",
    address: "",
    city: "",
    country: "",
  },
  committees: [],
  agenda: [],
  brochures: [],
  gallery: [],
  socialLinks: [],
  awards: [],
  faqs: [],
  secretariat: [],
};

export function ConferenceWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ConferenceDraft>(initialData);
  const [committees, setCommittees] = useState<CommitteeDraft[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const progress = ((step + 1) / STEPS.length) * 100;

  function updateConference(fields: Partial<ConferenceDraft["conference"]>) {
    setData((prev) => ({
      ...prev,
      conference: { ...prev.conference, ...fields },
    }));
  }

  function updateVenue(fields: Partial<ConferenceDraft["venue"]>) {
    setData((prev) => ({
      ...prev,
      venue: { ...prev.venue, ...fields },
    }));
  }

  function addCommittee() {
    if (committees.length >= 10) return;
    setCommittees((prev) => [
      ...prev,
      { name: "", topic: "", description: "", maxDelegates: "" },
    ]);
  }

  function updateCommittee(index: number, fields: Partial<CommitteeDraft>) {
    setCommittees((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...fields } : c))
    );
  }

  function removeCommittee(index: number) {
    setCommittees((prev) => prev.filter((_, i) => i !== index));
  }

  function validateStep(): boolean {
    setErrors({});
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!data.conference.name.trim()) newErrors.name = "Name is required";
      if (!data.conference.description.trim())
        newErrors.description = "Description is required";
    }

    if (step === 1) {
      if (!data.conference.startDate) newErrors.startDate = "Start date is required";
      if (!data.conference.endDate) newErrors.endDate = "End date is required";
      if (data.conference.startDate && data.conference.endDate) {
        if (new Date(data.conference.startDate) > new Date(data.conference.endDate)) {
          newErrors.endDate = "End date must be after start date";
        }
      }
    }

    if (step === 2) {
      if (!data.conference.city.trim()) newErrors.city = "City is required";
      if (!data.conference.country.trim()) newErrors.country = "Country is required";
      if (!data.venue.name.trim()) newErrors.venueName = "Venue name is required";
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

  function handleSubmit() {
    startTransition(async () => {
      const draft: ConferenceDraft = {
        ...data,
        conference: {
          ...data.conference,
          slug: data.conference.slug || data.conference.name.toLowerCase().replace(/[^a-z0-9\s_-]/g, "").replace(/[\s_-]+/g, "-"),
        },
        committees: committees.map((c) => ({
          name: c.name,
          topic: c.topic || undefined,
          description: c.description || undefined,
          difficulty: "INTERMEDIATE" as const,
          maxDelegates: c.maxDelegates || undefined,
          countryMatrix: [],
        })),
      };

      const result = await createConference(draft);
      if (result.status === "success") {
        toast.success("Conference created successfully!");
        router.push("/organizer");
      } else {
        toast.error(result.message);
        if (result.status === "error" && result.fieldErrors) {
          const fieldErrors: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(result.fieldErrors)) {
            fieldErrors[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
          }
          setErrors(fieldErrors);
        }
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
          <span
            key={s}
            className={i === step ? "font-medium text-foreground" : ""}
          >
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
                <Input
                  id="name"
                  value={data.conference.name}
                  onChange={(e) => updateConference({ name: e.target.value })}
                  placeholder="e.g. Harvard MUN 2026"
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={data.conference.tagline ?? ""}
                  onChange={(e) => updateConference({ tagline: e.target.value })}
                  placeholder="e.g. Shaping Tomorrow's Leaders"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={data.conference.description}
                  onChange={(e) =>
                    updateConference({ description: e.target.value })
                  }
                  placeholder="Describe your conference..."
                  rows={4}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Input
                  id="theme"
                  value={data.conference.theme ?? ""}
                  onChange={(e) => updateConference({ theme: e.target.value })}
                  placeholder="e.g. Global Cooperation in the 21st Century"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Conference Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select
                    value={data.conference.format}
                    onValueChange={(v) =>
                      updateConference({ format: v as ConferenceDraft["conference"]["format"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONLINE">Online</SelectItem>
                      <SelectItem value="OFFLINE">In-Person</SelectItem>
                      <SelectItem value="HYBRID">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={data.conference.difficulty}
                    onValueChange={(v) =>
                      updateConference({ difficulty: v as ConferenceDraft["conference"]["difficulty"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={data.conference.startDate}
                    onChange={(e) =>
                      updateConference({ startDate: e.target.value })
                    }
                  />
                  {errors.startDate && (
                    <p className="text-xs text-destructive">{errors.startDate}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={data.conference.endDate}
                    onChange={(e) =>
                      updateConference({ endDate: e.target.value })
                    }
                  />
                  {errors.endDate && (
                    <p className="text-xs text-destructive">{errors.endDate}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fee">Registration Fee</Label>
                  <Input
                    id="fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.conference.fee ?? "0"}
                    onChange={(e) => updateConference({ fee: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={data.conference.capacity ?? ""}
                    onChange={(e) =>
                      updateConference({ capacity: e.target.value })
                    }
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={data.conference.website ?? ""}
                  onChange={(e) =>
                    updateConference({ website: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.conference.email ?? ""}
                  onChange={(e) => updateConference({ email: e.target.value })}
                  placeholder="contact@conference.org"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Location</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={data.conference.city}
                    onChange={(e) => updateConference({ city: e.target.value })}
                    placeholder="e.g. New York"
                  />
                  {errors.city && (
                    <p className="text-xs text-destructive">{errors.city}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={data.conference.country}
                    onChange={(e) =>
                      updateConference({ country: e.target.value })
                    }
                    placeholder="e.g. United States"
                  />
                  {errors.country && (
                    <p className="text-xs text-destructive">{errors.country}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="venueName">Venue Name *</Label>
                <Input
                  id="venueName"
                  value={data.venue.name}
                  onChange={(e) => updateVenue({ name: e.target.value })}
                  placeholder="e.g. Harvard University"
                />
                {errors.venueName && (
                  <p className="text-xs text-destructive">{errors.venueName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="venueAddress">Venue Address</Label>
                <Input
                  id="venueAddress"
                  value={data.venue.address ?? ""}
                  onChange={(e) => updateVenue({ address: e.target.value })}
                  placeholder="e.g. 45 Quincy St, Cambridge, MA 02138"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Committees</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCommittee}
                  disabled={committees.length >= 10}
                >
                  <Plus className="size-4" />
                  Add Committee
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Add 1-10 committees for your conference.
              </p>
              {committees.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No committees added yet. Click &quot;Add Committee&quot; to start.
                  </p>
                </div>
              )}
              <div className="space-y-4">
                {committees.map((c, i) => (
                  <div key={i} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Committee {i + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeCommittee(i)}
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Name *</Label>
                        <Input
                          value={c.name}
                          onChange={(e) =>
                            updateCommittee(i, { name: e.target.value })
                          }
                          placeholder="e.g. UN Security Council"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Topic</Label>
                        <Input
                          value={c.topic}
                          onChange={(e) =>
                            updateCommittee(i, { topic: e.target.value })
                          }
                          placeholder="e.g. Cybersecurity"
                        />
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Description</Label>
                        <Input
                          value={c.description}
                          onChange={(e) =>
                            updateCommittee(i, { description: e.target.value })
                          }
                          placeholder="Brief description..."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Max Delegates</Label>
                        <Input
                          type="number"
                          min="1"
                          value={c.maxDelegates}
                          onChange={(e) =>
                            updateCommittee(i, { maxDelegates: e.target.value })
                          }
                          placeholder="No limit"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Review & Submit</h2>
              <div className="space-y-3">
                <ReviewSection title="Basic Info">
                  <ReviewItem label="Name" value={data.conference.name} />
                  <ReviewItem label="Tagline" value={data.conference.tagline} />
                  <ReviewItem label="Description" value={data.conference.description} />
                  <ReviewItem label="Theme" value={data.conference.theme} />
                </ReviewSection>
                <ReviewSection title="Details">
                  <ReviewItem label="Format" value={data.conference.format} />
                  <ReviewItem label="Difficulty" value={data.conference.difficulty} />
                  <ReviewItem
                    label="Dates"
                    value={`${data.conference.startDate} → ${data.conference.endDate}`}
                  />
                  <ReviewItem label="Fee" value={`${data.conference.fee ?? "0"} ${data.conference.currency}`} />
                  <ReviewItem label="Capacity" value={data.conference.capacity || "Unlimited"} />
                  <ReviewItem label="Website" value={data.conference.website} />
                  <ReviewItem label="Email" value={data.conference.email} />
                </ReviewSection>
                <ReviewSection title="Location">
                  <ReviewItem label="City" value={data.conference.city} />
                  <ReviewItem label="Country" value={data.conference.country} />
                  <ReviewItem label="Venue" value={data.venue.name} />
                  <ReviewItem label="Address" value={data.venue.address} />
                </ReviewSection>
                {committees.length > 0 && (
                  <ReviewSection title={`Committees (${committees.length})`}>
                    {committees.map((c, i) => (
                      <ReviewItem
                        key={i}
                        label={c.name || `Committee ${i + 1}`}
                        value={[c.topic, c.maxDelegates && `Max ${c.maxDelegates}`]
                          .filter(Boolean)
                          .join(" • ")}
                      />
                    ))}
                  </ReviewSection>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 0 || isPending}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={handleNext} disabled={isPending}>
            Next
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Create Conference
          </Button>
        )}
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground min-w-[100px]">{label}:</span>
      <span>{String(value)}</span>
    </div>
  );
}
