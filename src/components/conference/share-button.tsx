"use client";

import * as React from "react";
import { Share2, Check, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function ShareTo({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <DropdownMenuItem asChild>
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    </DropdownMenuItem>
  );
}

export function ShareButton({
  url,
  title,
  className,
  variant = "ghost",
}: {
  url: string;
  title: string;
  className?: string;
  variant?: "ghost" | "outline";
}) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy link.");
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const intent =
    variant === "outline"
      ? "inline-flex items-center gap-2 rounded-full border"
      : "rounded-full";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="icon" aria-label="Share conference" className={cn(intent, className)}>
          <Share2 className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Share this conference</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void copy()}>
          {copied ? <Check className="size-4 text-emerald-500" /> : <Link2 className="size-4" />}
          {copied ? "Copied!" : "Copy link"}
        </DropdownMenuItem>
        <ShareTo
          
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        >
          <span className="mr-2 font-semibold">𝕏</span> Post on X
        </ShareTo>
        <ShareTo
          
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        >
          <span className="mr-2 font-semibold">in</span> Share on LinkedIn
        </ShareTo>
        <ShareTo
          
          href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        >
          <span className="mr-2 font-semibold">✆</span> Share on WhatsApp
        </ShareTo>
        <ShareTo
          
          href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
        >
          <span className="mr-2 font-semibold">@</span> Share via email
        </ShareTo>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
