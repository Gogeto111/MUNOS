"use client";

import { useCallback, useState } from "react";

export type AiStreamFeature =
  | "research-brief"
  | "position-paper"
  | "resolution"
  | "debate-strategy"
  | "debate-reply"
  | "prep-pack";

export interface StreamAiArgs {
  feature: AiStreamFeature;
  workspaceId: string;
  committeeId?: string;
  focus?: string;
  speechContext?: string;
}

/**
 * POSTs a streaming generation request to /api/ai/generate and feeds the
 * accumulated plain-text body to `onText` as chunks arrive. Resolves with an
 * error message when the request fails.
 */
export async function streamAiGeneration(
  args: StreamAiArgs,
  onText: (text: string) => void,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });

    if (!response.ok || !response.body) {
      const payload = await response.json().catch(() => null);
      const message =
        payload && typeof payload === "object" && "error" in payload
          ? String(payload.error)
          : null;
      return { ok: false, error: message ?? "Something went wrong. Please try again." };
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      onText(buffer);
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Drives a streaming generation request and surfaces the produced text or an
 * error inline for the AI Copilot panel.
 */
export function useAiStream(feature: AiStreamFeature, workspaceId: string) {
  const [isPending, setIsPending] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (args?: { committeeId?: string; focus?: string; speechContext?: string }) => {
      setError(null);
      setText(null);
      setIsPending(true);
      const result = await streamAiGeneration(
        { feature, workspaceId, ...args },
        setText,
      );
      if (!result.ok) setError(result.error ?? "Something went wrong. Please try again.");
      setIsPending(false);
    },
    [feature, workspaceId],
  );

  return { isPending, text, error, run };
}
