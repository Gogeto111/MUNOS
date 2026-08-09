"use client";

import { BadgeCheck, AlertTriangle, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type VerificationStatus = "verified" | "unverified" | "outdated" | "user-submitted";

interface VerifiedFieldProps {
  status: VerificationStatus;
  source?: string;
  verifiedDate?: string;
  className?: string;
  children: React.ReactNode;
}

const STATUS_CONFIG: Record<VerificationStatus, {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
}> = {
  verified: {
    icon: <BadgeCheck className="h-3 w-3" />,
    label: "Verified",
    color: "text-green-600",
    bgColor: "bg-green-500/10 border-green-500/20",
  },
  unverified: {
    icon: <AlertTriangle className="h-3 w-3" />,
    label: "Not verified",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  outdated: {
    icon: <Clock className="h-3 w-3" />,
    label: "May be outdated",
    color: "text-orange-600",
    bgColor: "bg-orange-500/10 border-orange-500/20",
  },
  "user-submitted": {
    icon: <ExternalLink className="h-3 w-3" />,
    label: "User-submitted",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
};

export function VerifiedField({ status, source, verifiedDate, className, children }: VerifiedFieldProps) {
  const config = STATUS_CONFIG[status];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("inline-flex items-center gap-1.5", className)}>
            {children}
            <span className={cn("inline-flex items-center gap-0.5", config.color)}>
              {config.icon}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1 text-xs">
            <div className={cn("font-medium", config.color)}>{config.label}</div>
            {source && <div className="text-muted-foreground">Source: {source}</div>}
            {verifiedDate && <div className="text-muted-foreground">Last verified: {verifiedDate}</div>}
            {status === "unverified" && (
              <div className="text-amber-600">⚠️ Information not verified — confirm before using in committee.</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ---------------------------------------------------------------------------
// Conference Verification Summary
// ---------------------------------------------------------------------------

interface FieldVerification {
  field: string;
  status: VerificationStatus;
  source?: string;
  verifiedDate?: string;
}

interface ConferenceVerificationProps {
  fields: FieldVerification[];
  lastVerified?: string;
}

export function ConferenceVerification({ fields, lastVerified }: ConferenceVerificationProps) {
  const verified = fields.filter((f) => f.status === "verified").length;
  const total = fields.length;
  const percentage = total > 0 ? Math.round((verified / total) * 100) : 0;

  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold">Data Verification</h4>
        <Badge
          variant={percentage >= 80 ? "default" : percentage >= 50 ? "secondary" : "outline"}
          className="text-[10px]"
        >
          {percentage}% verified
        </Badge>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            percentage >= 80 ? "bg-green-500" :
            percentage >= 50 ? "bg-amber-500" :
            "bg-orange-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {fields.map((field) => {
          const config = STATUS_CONFIG[field.status];
          return (
            <div
              key={field.field}
              className={cn(
                "flex items-center gap-1.5 rounded border px-2 py-1 text-[10px]",
                config.bgColor
              )}
            >
              <span className={config.color}>{config.icon}</span>
              <span className="truncate">{field.field}</span>
            </div>
          );
        })}
      </div>

      {lastVerified && (
        <div className="text-[10px] text-muted-foreground">
          Last verified: {lastVerified}
        </div>
      )}

      {percentage < 100 && (
        <div className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-1.5 text-[10px] text-amber-700 dark:text-amber-400">
          ⚠️ Some information may be unverified. Confirm details with the organizer before relying on them.
        </div>
      )}
    </div>
  );
}
