"use client";

import { useEffect, useState, useTransition } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  submitPositionPaper,
  getPositionPapers,
  deletePositionPaper,
} from "@/lib/actions/position-papers";
import type { WorkspaceCommittee } from "@/generated/prisma/browser";
import { formatDate } from "@/lib/format";
import { SectionCard } from "@/components/profile/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Paper {
  id: string;
  title: string | null;
  content: string;
  status: string;
  createdAt: Date;
  committeeName: string;
}

export function PositionPapersPanel({
  workspaceId,
  committees,
}: {
  workspaceId: string;
  committees: WorkspaceCommittee[];
}) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState("");
  const [country, setCountry] = useState("");
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void getPositionPapers(workspaceId).then((res) => {
      if (res.status === "success" && res.data) {
        setPapers(res.data);
      }
      setLoading(false);
    });
  }, [workspaceId]);

  function resetForm() {
    setSelectedCommitteeId("");
    setCountry("");
    setContent("");
    setShowForm(false);
  }

  async function handleSubmit() {
    if (!selectedCommitteeId) {
      toast.error("Select a committee.");
      return;
    }
    if (!country.trim()) {
      toast.error("Country is required.");
      return;
    }
    if (!content.trim()) {
      toast.error("Content cannot be empty.");
      return;
    }

    setSubmitting(true);
    const result = await submitPositionPaper(
      workspaceId,
      selectedCommitteeId,
      content,
      country,
    );
    setSubmitting(false);

    if (result.status === "success") {
      toast.success(result.message);
      resetForm();
      const refreshed = await getPositionPapers(workspaceId);
      if (refreshed.status === "success" && refreshed.data) {
        setPapers(refreshed.data);
      }
    } else {
      toast.error(result.message);
    }
  }

  function handleDelete(paperId: string) {
    startTransition(async () => {
      const result = await deletePositionPaper(paperId);
      if (result.status === "success") {
        toast.success(result.message);
        setPapers((prev) => prev.filter((p) => p.id !== paperId));
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <SectionCard
      title="Position Papers"
      description="Draft and submit position papers for your committees."
      icon={FileText}
    >
      <div className="space-y-4">
        {showForm ? (
          <div className="space-y-4 rounded-lg border border-dashed border-border/70 p-4">
            <p className="text-sm font-medium">Submit a position paper</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Committee
                </label>
                <Select
                  value={selectedCommitteeId}
                  onValueChange={setSelectedCommitteeId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select committee" />
                  </SelectTrigger>
                  <SelectContent>
                    {committees.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Country
                </label>
                <Input
                  placeholder="Canada"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Content
              </label>
              <Textarea
                placeholder="Country position, committee stances, arguments, sources…"
                rows={8}
                className="min-h-32 resize-y font-mono text-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Submitting…" : "Submit paper"}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <Plus className="size-4" />
            Submit paper
          </Button>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading papers…</p>
        ) : papers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No position papers yet. Submit your first one.
          </p>
        ) : (
          <ul className="divide-y divide-border/70 rounded-lg border border-border/70">
            {papers.map((paper) => (
              <li
                key={paper.id}
                className="group flex items-start justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{paper.committeeName}</p>
                  {paper.title ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {paper.title}
                    </p>
                  ) : null}
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {paper.content}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitted {formatDate(paper.createdAt)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  disabled={isPending}
                  onClick={() => handleDelete(paper.id)}
                  aria-label="Delete paper"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionCard>
  );
}
