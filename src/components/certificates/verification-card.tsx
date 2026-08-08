"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VerificationCardProps {
  certificateId: string;
}

export function VerificationCard({ certificateId }: VerificationCardProps) {
  const [copied, setCopied] = useState(false);
  const verificationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/certificates/verify/${certificateId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      toast.success("Verification link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <Card className="border-emerald-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <ExternalLink className="size-4 text-emerald-500" /> Verification Link
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
          <code className="flex-1 truncate text-xs text-muted-foreground">
            {verificationUrl}
          </code>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? "Copied" : "Copy Link"}
          </Button>
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <a href={verificationUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5" /> Open
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
