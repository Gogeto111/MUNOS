"use client";

import { Copy, Download, FileText, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToMarkdown, exportToPlainText, copyToClipboard } from "@/lib/export";

interface ExportMenuProps {
  content: string;
  filename: string;
  className?: string;
  showLabel?: boolean;
}

export function ExportMenu({ content, filename, className, showLabel = false }: ExportMenuProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(content);
    if (ok) {
      toast.success("Copied to clipboard");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Failed to copy");
    }
  };

  const handleMarkdown = () => {
    exportToMarkdown(content, filename);
    toast.success("Downloaded as Markdown");
  };

  const handlePlainText = () => {
    exportToPlainText(content, filename);
    toast.success("Downloaded as plain text");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Download className="size-3.5" />
          {showLabel && <span className="ml-1">Export</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopy}>
          {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
          {copied ? "Copied" : "Copy to clipboard"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleMarkdown}>
          <FileText className="mr-2 size-4" />
          Download as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePlainText}>
          <FileText className="mr-2 size-4" />
          Download as plain text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
