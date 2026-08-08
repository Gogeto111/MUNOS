"use client";

import * as React from "react";
import { Check, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  registerForConference,
  isRegisteredForConference,
  getConferenceAttendeeCount,
} from "@/lib/actions/conference";

type RegisterButtonProps = {
  conferenceId: string;
  registrationOpen: boolean;
  className?: string;
};

export function RegisterButton({
  conferenceId,
  registrationOpen,
  className,
}: RegisterButtonProps) {
  const [registered, setRegistered] = React.useState(false);
  const [attendeeCount, setAttendeeCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [workspaceId, setWorkspaceId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [regResult, countResult] = await Promise.all([
          isRegisteredForConference(conferenceId),
          getConferenceAttendeeCount(conferenceId),
        ]);
        if (cancelled) return;
        if (regResult.status === "success" && regResult.data) {
          setRegistered(regResult.data.registered);
          setWorkspaceId(regResult.data.workspaceId);
        }
        if (countResult.status === "success" && countResult.data) {
          setAttendeeCount(countResult.data.count);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [conferenceId]);

  async function handleRegister() {
    setSubmitting(true);
    try {
      const result = await registerForConference(conferenceId);
      if (result.status === "success") {
        setRegistered(true);
        setWorkspaceId(result.data?.workspaceId ?? null);
        setAttendeeCount((c) => c + 1);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Button
        variant={registered ? "default" : "default"}
        size="sm"
        className={cn(
          "gap-1.5 rounded-full px-5",
          registered && "bg-emerald-500 text-white hover:bg-emerald-600",
          !registered && "bg-brand-500 text-white hover:bg-brand-600",
        )}
        disabled={loading || submitting || (!registered && !registrationOpen)}
        onClick={() => {
          if (!registered) void handleRegister();
        }}
      >
        {loading || submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : registered ? (
          <Check className="size-4" />
        ) : null}
        {loading
          ? "Checking..."
          : registered
            ? "Registered \u2713"
            : submitting
              ? "Registering..."
              : registrationOpen
                ? "Register"
                : "Registration Closed"}
      </Button>

      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <Users className="size-4" />
        {attendeeCount.toLocaleString()} registered
      </span>
    </div>
  );
}
