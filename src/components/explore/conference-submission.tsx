"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FormData {
  name: string;
  organizer: string;
  website: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  fee: string;
  description: string;
  committees: string;
  email: string;
}

export function ConferenceSubmissionForm() {
  const [form, setForm] = useState<FormData>({
    name: "",
    organizer: "",
    website: "",
    country: "",
    city: "",
    startDate: "",
    endDate: "",
    fee: "",
    description: "",
    committees: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/mun/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <CheckCircle className="size-12 text-green-500" />
          <h3 className="mt-4 text-lg font-semibold">Conference Submitted</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you! We&apos;ll review your submission and add it to the database.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSubmitted(false);
              setForm({
                name: "", organizer: "", website: "", country: "", city: "",
                startDate: "", endDate: "", fee: "", description: "", committees: "", email: "",
              });
            }}
          >
            Submit Another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Submit a Real Conference</CardTitle>
        <p className="text-xs text-muted-foreground">
          Know about a MUN conference? Submit it here and we&apos;ll add it to the database.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Conference name *"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
            <Input
              placeholder="Organizer / Secretariat *"
              value={form.organizer}
              onChange={(e) => update("organizer", e.target.value)}
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Website URL"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              type="url"
            />
            <Input
              placeholder="Contact email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              type="email"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              placeholder="Country *"
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
              required
            />
            <Input
              placeholder="City"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
            <Input
              placeholder="Fee (e.g., $50)"
              value={form.fee}
              onChange={(e) => update("fee", e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-muted-foreground">Start Date</label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">End Date</label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => update("endDate", e.target.value)}
              />
            </div>
          </div>
          <Input
            placeholder="Committees (e.g., UNGA, UNSC, ECOSOC)"
            value={form.committees}
            onChange={(e) => update("committees", e.target.value)}
          />
          <Textarea
            placeholder="Brief description of the conference"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
          />
          <Button type="submit" disabled={loading || !form.name || !form.organizer || !form.country}>
            {loading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Send className="mr-2 size-4" />
            )}
            Submit Conference
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
