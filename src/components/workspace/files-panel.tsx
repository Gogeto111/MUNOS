"use client";

import { useRef, useState } from "react";
import { FileUp, Paperclip } from "lucide-react";
import type { WorkspaceAttachment } from "@/generated/prisma/browser";
import { deleteAttachment, registerAttachment } from "@/lib/actions/workspace";
import { formatBytes, formatDate } from "@/lib/format";
import { DeleteButton } from "@/components/profile/delete-button";
import { SectionCard } from "@/components/profile/section-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function FilesPanel({
  workspaceId,
  attachments,
}: {
  workspaceId: string;
  attachments: WorkspaceAttachment[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File is too large (max 15 MB).");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("workspaceId", workspaceId);
      formData.append("folder", "workspaces");

      const response = await fetch("/api/upload/workspace", { method: "POST", body: formData });
      const data = (await response.json()) as {
        error?: string;
        url?: string;
        key?: string;
        fileName?: string;
        mimeType?: string;
        sizeBytes?: number;
      };

      if (!response.ok || !data.url) {
        toast.error(data.error ?? "Upload failed.");
        return;
      }

      const result = await registerAttachment(workspaceId, {
        fileName: data.fileName ?? file.name,
        mimeType: data.mimeType ?? file.type,
        sizeBytes: String(data.sizeBytes ?? file.size),
        fileUrl: data.url,
        fileKey: data.key ?? "",
      });

      if (result.status === "success") {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const sorted = [...attachments].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <SectionCard
      title="Files"
      description="Research documents, drafts, and reference material."
      icon={Paperclip}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Documents, PDFs, images, and spreadsheets up to 15 MB.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            <FileUp className="size-4" />
            {isUploading ? "Uploading…" : "Upload file"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => void handleUpload(e.target.files)}
          />
        </div>

        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No files yet. Upload background guides, draft resolutions, or position paper notes.
          </p>
        ) : (
          <ul className="divide-y divide-border/70 rounded-lg border border-border/70">
            {sorted.map((file) => (
              <li key={file.id} className="group flex items-center gap-3 px-4 py-3">
                <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm font-medium hover:text-brand-700 dark:hover:text-brand-300"
                  >
                    {file.fileName}
                  </a>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatBytes(file.sizeBytes)} · {formatDate(file.createdAt)}
                  </p>
                </div>
                <DeleteButton
                  action={(id) => deleteAttachment(workspaceId, id)}
                  id={file.id}
                  className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionCard>
  );
}
