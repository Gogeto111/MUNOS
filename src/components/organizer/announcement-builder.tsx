"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Send,
  Clock,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All Delegates" },
  { value: "committee", label: "Specific Committee" },
  { value: "country", label: "Specific Country" },
];

const MOCK_COMMITTEES = [
  "UN Security Council",
  "World Health Organization",
  "UN Environment Programme",
  "International Court of Justice",
  "Economic and Social Council",
];

const MOCK_COUNTRIES = [
  "United States",
  "United Kingdom",
  "France",
  "Germany",
  "Japan",
  "China",
  "India",
  "Brazil",
  "Nigeria",
  "Australia",
];

export function AnnouncementBuilder() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [targetValue, setTargetValue] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const isScheduled = !!scheduleDate && !!scheduleTime;

  function handleSend() {
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!body.trim()) {
      toast.error("Message body is required");
      return;
    }
    if ((audience === "committee" || audience === "country") && !targetValue) {
      toast.error("Please select a target");
      return;
    }

    setSending(true);
    setTimeout(() => {
      setSending(false);
      const targetLabel = audience === "all"
        ? "all delegates"
        : audience === "committee"
          ? `committee: ${targetValue}`
          : `country: ${targetValue}`;
      toast.success(
        isScheduled
          ? `Announcement scheduled for ${scheduleDate} ${scheduleTime} → ${targetLabel}`
          : `Announcement sent to ${targetLabel}`
      );
      setSubject("");
      setBody("");
      setAudience("all");
      setTargetValue("");
      setScheduleDate("");
      setScheduleTime("");
    }, 1500);
  }

  function renderMarkdownPreview(text: string) {
    if (!text) return <p className="text-muted-foreground italic">Nothing to preview</p>;
    return text.split("\n").map((line, i) => {
      if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold mt-2">{line.slice(2)}</h1>;
      if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold mt-2">{line.slice(3)}</h2>;
      if (line.startsWith("### ")) return <h3 key={i} className="text-base font-medium mt-2">{line.slice(4)}</h3>;
      if (line.startsWith("- ")) return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>;
      if (line.startsWith("**") && line.endsWith("**")) return <strong key={i}>{line.slice(2, -2)}</strong>;
      if (line.trim() === "") return <br key={i} />;
      return <p key={i}>{line}</p>;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Announcement Builder</h1>
        <p className="text-sm text-muted-foreground">Compose and send announcements to your delegates.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Compose Announcement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Important Update: Schedule Change"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="body">Message (Markdown supported) *</Label>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setPreviewOpen(true)}
                  >
                    <Eye className="size-3" />
                    Preview
                  </Button>
                </div>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={`# Announcement Title\n\nDear delegates,\n\nWe are writing to inform you about...\n\n- Point one\n- Point two\n\nBest regards,\nThe Organizing Committee`}
                  rows={10}
                  className="font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Target Audience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select value={audience} onValueChange={(v) => { setAudience(v); setTargetValue(""); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIENCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {audience === "committee" && (
                <div className="space-y-2">
                  <Label>Committee</Label>
                  <Select value={targetValue} onValueChange={setTargetValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select committee" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_COMMITTEES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {audience === "country" && (
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select value={targetValue} onValueChange={setTargetValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="schedDate">Send Date</Label>
                <Input
                  id="schedDate"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedTime">Send Time</Label>
                <Input
                  id="schedTime"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
              {isScheduled && (
                <Badge variant="secondary" className="w-full justify-center">
                  <Clock className="size-3" />
                  Scheduled: {scheduleDate} at {scheduleTime}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Button className="w-full" onClick={handleSend} disabled={sending}>
            {sending ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Sending...
              </span>
            ) : (
              <>
                <Send className="size-4" />
                {isScheduled ? "Schedule Announcement" : "Send Now"}
              </>
            )}
          </Button>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-1 text-sm">
            {subject && <h3 className="font-semibold text-base mb-2">{subject}</h3>}
            {renderMarkdownPreview(body)}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
