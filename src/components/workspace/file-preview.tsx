"use client";

import { FileText, Image as ImageIcon, File as FileIcon, Download, Trash2 } from "lucide-react";
import NextImage from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FilePreviewProps {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  fileUrl: string;
  createdAt: string;
  onDelete?: () => void;
  isOwner?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType === "application/pdf") return FileText;
  return FileIcon;
}

function getFileColor(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "bg-blue-500/10 text-blue-600";
  if (mimeType === "application/pdf") return "bg-red-500/10 text-red-600";
  if (mimeType.includes("word") || mimeType.includes("document")) return "bg-brand-500/10 text-brand-600";
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return "bg-emerald-500/10 text-emerald-600";
  return "bg-muted/60 text-muted-foreground";
}

export function FilePreview({
  fileName,
  mimeType,
  sizeBytes,
  fileUrl,
  createdAt,
  onDelete,
  isOwner = false,
}: FilePreviewProps) {
  const Icon = getFileIcon(mimeType);
  const colorClass = getFileColor(mimeType);
  const isImage = mimeType.startsWith("image/");

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`grid size-10 shrink-0 place-items-center rounded-lg ${colorClass}`}>
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{fileName}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] uppercase">
                {mimeType.split("/")[1]?.split(".")[0] ?? "file"}
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {formatFileSize(sizeBytes)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isImage && fileUrl && (
              <Button size="sm" variant="ghost" className="size-8 p-0" asChild>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  <ImageIcon className="size-3.5" />
                </a>
              </Button>
            )}
            <Button size="sm" variant="ghost" className="size-8 p-0" asChild>
              <a href={fileUrl} download={fileName}>
                <Download className="size-3.5" />
              </a>
            </Button>
            {isOwner && onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="size-8 p-0 text-red-500 hover:text-red-600"
                onClick={onDelete}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
        {isImage && fileUrl && (
          <div className="mt-3 overflow-hidden rounded-lg border border-border/60">
            <NextImage
              src={fileUrl}
              alt={fileName}
              width={600}
              height={400}
              className="w-full object-cover"
              unoptimized
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
