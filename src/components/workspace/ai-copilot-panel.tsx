"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Database,
  FileUp,
  GraduationCap,
  Library,
  Loader2,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import {
  deleteAiDocument,
  ingestDocument,
  listAiDocuments,
  seedCorpus,
} from "@/lib/actions/ai-library";
import { useAiStream } from "@/components/workspace/use-ai-stream";
import { AiOutput } from "@/components/workspace/ai-output";
import { SectionCard } from "@/components/profile/section-card";
import { DeleteButton } from "@/components/profile/delete-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CoachProfileSection } from "@/components/workspace/ai-coach-profile";
import { SourcesSection } from "@/components/workspace/ai-sources-panel";
import { JudgeSection } from "@/components/workspace/ai-judge-panel";
import { VoiceDebateMode } from "@/components/workspace/voice-debate-mode";
import { toast } from "sonner";
import type { PositionPaper, WorkspaceCommittee } from "@/generated/prisma/browser";

type CommitteeWithPaper = WorkspaceCommittee & { positionPaper: PositionPaper | null };

type LibraryDocument = {
  id: string;
  title: string;
  source: string;
  isCorpus: boolean;
  sourceType: string;
  originUrl: string | null;
  status: string;
  chunkCount: number;
  fileUrl: string | null;
  createdAt: Date;
};

const SOURCE_LABELS: Record<string, string> = {
  CORPUS: "built-in",
  CRAWLED: "crawled",
  LIVE: "live feed",
  USER: "uploaded",
};

function CommitteeSelect({
  value,
  onChange,
  committees,
}: {
  value: string;
  onChange: (value: string) => void;
  committees: CommitteeWithPaper[];
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a committee" />
      </SelectTrigger>
      <SelectContent>
        {committees.map((committee) => (
          <SelectItem key={committee.id} value={committee.id}>
            {committee.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AiCopilotPanel({
  workspaceId,
  committees,
}: {
  workspaceId: string;
  committees: CommitteeWithPaper[];
}) {
  return (
    <div className="space-y-6">
      <CoachProfileSection workspaceId={workspaceId} />
      <PrepPackSection workspaceId={workspaceId} hasCommittees={committees.length > 0} />
      <ResearchSection workspaceId={workspaceId} committees={committees} />
      <DebateSection workspaceId={workspaceId} committees={committees} />
      <VoiceDebateMode workspaceId={workspaceId} committees={committees} />
      <SourcesSection workspaceId={workspaceId} />
      <LibrarySection workspaceId={workspaceId} />
      <JudgeSection workspaceId={workspaceId} />
    </div>
  );
}

function PrepPackSection({
  workspaceId,
  hasCommittees,
}: {
  workspaceId: string;
  hasCommittees: boolean;
}) {
  const { isPending, text, error, run } = useAiStream("prep-pack", workspaceId);

  return (
    <SectionCard
      title="Personalized prep pack"
      description="A tailored preparation pack covering every committee in this workspace."
      icon={GraduationCap}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" onClick={() => void run()} disabled={isPending || !hasCommittees}>
            <Sparkles className="size-4" />
            Generate prep pack
          </Button>
          {!hasCommittees ? (
            <p className="text-xs text-muted-foreground">
              Add a committee first so the pack has something to work with.
            </p>
          ) : null}
        </div>
        <AiOutput isPending={isPending} error={error} text={text} />
      </div>
    </SectionCard>
  );
}

function ResearchSection({
  workspaceId,
  committees,
}: {
  workspaceId: string;
  committees: CommitteeWithPaper[];
}) {
  const [committeeId, setCommitteeId] = useState(committees[0]?.id ?? "");
  const { isPending, text, error, run } = useAiStream("research-brief", workspaceId);

  return (
    <SectionCard
      title="Research assistant"
      description="Generate a structured briefing note for any committee topic in this workspace."
      icon={BookOpen}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-52 flex-1">
            <Label>Committee</Label>
            <CommitteeSelect
              value={committeeId}
              onChange={setCommitteeId}
              committees={committees}
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => void run({ committeeId })}
            disabled={isPending || !committeeId}
          >
            <Sparkles className="size-4" />
            Generate research brief
          </Button>
        </div>
        <AiOutput isPending={isPending} error={error} text={text} />
      </div>
    </SectionCard>
  );
}

function DebateSection({
  workspaceId,
  committees,
}: {
  workspaceId: string;
  committees: CommitteeWithPaper[];
}) {
  const [committeeId, setCommitteeId] = useState(committees[0]?.id ?? "");
  const [speechContext, setSpeechContext] = useState("");
  const { isPending, text, error, run } = useAiStream("debate-strategy", workspaceId);

  return (
    <SectionCard
      title="Debate strategy & POIs"
      description="Get an opening speech outline, arguments, rebuttals, and Points of Information."
      icon={MessagesSquare}
    >
      <div className="space-y-4">
        <div className="min-w-52 max-w-sm">
          <Label>Committee</Label>
          <CommitteeSelect
            value={committeeId}
            onChange={setCommitteeId}
            committees={committees}
          />
        </div>
        <div>
          <Label htmlFor="speech-context">
            Current speech or situation (optional)
          </Label>
          <Textarea
            id="speech-context"
            rows={3}
            placeholder="e.g. The US just proposed a military AI ban. I speak right after them…"
            value={speechContext}
            onChange={(event) => setSpeechContext(event.target.value)}
            className="mt-1.5 resize-y"
          />
        </div>
        <div>
          <Button
            type="button"
            size="sm"
            onClick={() => void run({ committeeId, speechContext })}
            disabled={isPending || !committeeId}
          >
            <Sparkles className="size-4" />
            Generate strategy
          </Button>
        </div>
        <AiOutput isPending={isPending} error={error} text={text} />
      </div>
    </SectionCard>
  );
}

function LibrarySection({ workspaceId }: { workspaceId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [corpusSeeded, setCorpusSeeded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const refresh = useCallback(async () => {
    const result = await listAiDocuments(workspaceId);
    if (result.status === "success" && result.data) {
      setDocuments(result.data.documents);
      setCorpusSeeded(result.data.corpusSeeded);
    }
  }, [workspaceId]);

  useEffect(() => {
    void refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== "application/pdf") {
      toast.error("Only PDF background guides can be added to the research library.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File is too large (max 15 MB).");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("workspaceId", workspaceId);
      formData.append("folder", "ai-library");

      const response = await fetch("/api/upload/workspace", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        error?: string;
        url?: string;
        key?: string;
        fileName?: string;
      };

      if (!response.ok || !data.url || !data.key) {
        toast.error(data.error ?? "Upload failed.");
        return;
      }

      const result = await ingestDocument(workspaceId, {
        key: data.key,
        url: data.url,
        fileName: data.fileName ?? file.name,
      });

      if (result.status === "success") {
        toast.success(result.message);
        await refresh();
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

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const result = await seedCorpus();
      if (result.status === "success") {
        toast.success(result.message);
        await refresh();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDelete = (id: string) =>
    deleteAiDocument(workspaceId, id).then((result) => {
      if (result.status === "success") void refresh();
      return result;
    });

  return (
    <SectionCard
      title="Research library"
      description="Upload background guides and papers so the AI can ground its answers with cited sources."
      icon={Library}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            PDF background guides up to 15 MB. Cited inline as [1], [2], &hellip;
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {!corpusSeeded && !isLoading ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSeeding}
                onClick={() => void handleSeed()}
              >
                <Database className="size-4" />
                {isSeeding ? "Indexing…" : "Load built-in UN sources"}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
            >
              <FileUp className="size-4" />
              {isUploading ? "Indexing…" : "Upload PDF"}
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => void handleUpload(e.target.files)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading library&hellip;
          </div>
        ) : documents.length === 0 && !corpusSeeded ? (
          <p className="text-sm text-muted-foreground">
            No sources yet. Upload a background guide or load the built-in UN texts to get
            started.
          </p>
        ) : (
          <ul className="divide-y divide-border/70 rounded-lg border border-border/70">
            {documents.map((document) => (
              <li key={document.id} className="group flex items-center gap-3 px-4 py-3">
                <Library className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{document.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {document.chunkCount} chunk{document.chunkCount === 1 ? "" : "s"}
                    <span className="ml-2 rounded-full border border-border/70 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                      {SOURCE_LABELS[document.sourceType] ?? document.sourceType.toLowerCase()}
                    </span>
                  </p>
                </div>
                {!document.isCorpus ? (
                  <DeleteButton
                    action={handleDelete}
                    id={document.id}
                    className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionCard>
  );
}
