"use client";

import * as React from "react";
import { Camera, LoaderCircle, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadAvatar } from "@/lib/actions/avatar";

function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.charAt(0) ?? "";
  const last = lastName?.charAt(0) ?? "";
  return (first + last).toUpperCase() || "?";
}

export function AvatarUpload({
  currentUrl,
  firstName,
  lastName,
  onUploaded,
}: {
  currentUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  onUploaded?: (url: string) => void;
}) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const displayUrl = preview ?? currentUrl;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large (max 5 MB).");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  }

  async function handleUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const result = await uploadAvatar(form);
      if (result.status === "success" && result.data) {
        toast.success(result.message);
        setPreview(null);
        onUploaded?.(result.data.url);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative size-24 overflow-hidden rounded-full border-2 border-border/60 bg-muted transition-colors hover:border-brand-500/60"
        >
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayUrl}
              alt="Avatar"
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-2xl font-bold text-muted-foreground">
              {getInitials(firstName, lastName)}
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="size-5 text-white" />
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {preview && (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleUpload}
            disabled={uploading}
            className="gap-1.5"
          >
            {uploading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <User className="size-4" />
            )}
            Save avatar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setPreview(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            disabled={uploading}
          >
            Cancel
          </Button>
        </div>
      )}

      {!preview && !currentUrl && (
        <p className="text-xs text-muted-foreground">
          Click to upload a profile photo
        </p>
      )}
    </div>
  );
}
