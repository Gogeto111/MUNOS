"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Plus,
  X,
  Copy,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ClauseEditor,
  createEmptyClause,
  type Clause,
} from "@/components/workspace/clause-editor";
import {
  ResolutionPreview,
  type ResolutionData,
} from "@/components/workspace/resolution-preview";

const STORAGE_KEY = "munos-resolution-builder";

interface ResolutionState {
  committee: string;
  topic: string;
  sponsors: string[];
  signatories: string[];
  date: string;
  preambulatoryClauses: Clause[];
  operativeClauses: Clause[];
  finalClause: string;
}

function loadSaved(): ResolutionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ResolutionState;
  } catch {
    return null;
  }
}

function defaultState(): ResolutionState {
  return {
    committee: "",
    topic: "",
    sponsors: [],
    signatories: [],
    date: new Date().toISOString().slice(0, 10),
    preambulatoryClauses: [],
    operativeClauses: [],
    finalClause: "",
  };
}

export function ResolutionBuilder() {
  const [state, setState] = useState<ResolutionState>(defaultState);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sponsorInput, setSponsorInput] = useState("");
  const [signatoryInput, setSignatoryInput] = useState("");

  useEffect(() => {
    const saved = loadSaved();
    if (saved) setState(saved);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const update = useCallback(
    <K extends keyof ResolutionState>(key: K, value: ResolutionState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const addSponsor = () => {
    const v = sponsorInput.trim();
    if (v && !state.sponsors.includes(v)) {
      update("sponsors", [...state.sponsors, v]);
    }
    setSponsorInput("");
  };

  const removeSponsor = (name: string) => {
    update(
      "sponsors",
      state.sponsors.filter((s) => s !== name),
    );
  };

  const addSignatory = () => {
    const v = signatoryInput.trim();
    if (v && !state.signatories.includes(v)) {
      update("signatories", [...state.signatories, v]);
    }
    setSignatoryInput("");
  };

  const removeSignatory = (name: string) => {
    update(
      "signatories",
      state.signatories.filter((s) => s !== name),
    );
  };

  const addPreambulatory = () => {
    update("preambulatoryClauses", [
      ...state.preambulatoryClauses,
      createEmptyClause(true),
    ]);
  };

  const updatePreambulatory = (idx: number, clause: Clause) => {
    const updated = [...state.preambulatoryClauses];
    updated[idx] = clause;
    update("preambulatoryClauses", updated);
  };

  const removePreambulatory = (idx: number) => {
    update(
      "preambulatoryClauses",
      state.preambulatoryClauses.filter((_, i) => i !== idx),
    );
  };

  const movePreambulatory = (idx: number, dir: -1 | 1) => {
    const arr = [...state.preambulatoryClauses];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    update("preambulatoryClauses", arr);
  };

  const addOperative = () => {
    update("operativeClauses", [
      ...state.operativeClauses,
      createEmptyClause(false),
    ]);
  };

  const updateOperative = (idx: number, clause: Clause) => {
    const updated = [...state.operativeClauses];
    updated[idx] = clause;
    update("operativeClauses", updated);
  };

  const removeOperative = (idx: number) => {
    update(
      "operativeClauses",
      state.operativeClauses.filter((_, i) => i !== idx),
    );
  };

  const moveOperative = (idx: number, dir: -1 | 1) => {
    const arr = [...state.operativeClauses];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    update("operativeClauses", arr);
  };

  const generateFinalClause = () => {
    const committee = state.committee || "[Committee]";
    const dateStr = state.date
      ? new Date(state.date + "T00:00:00").toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "[DATE]";
    update(
      "finalClause",
      `This resolution, adopted by ${committee} on ${dateStr}, shall enter into force immediately upon adoption.`,
    );
  };

  const copyToClipboard = async () => {
    const previewData: ResolutionData = {
      committee: state.committee,
      topic: state.topic,
      sponsors: state.sponsors,
      signatories: state.signatories,
      date: state.date,
      preambulatoryClauses: state.preambulatoryClauses,
      operativeClauses: state.operativeClauses,
      finalClause: state.finalClause,
    };

    const text = formatAsText(previewData);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAsText = (data: ResolutionData): string => {
    const lines: string[] = [];
    const committee = data.committee || "[Committee Name]";
    const topic = data.topic || "[Topic]";

    lines.push(committee.toUpperCase());
    lines.push(topic);
    lines.push("");
    if (data.sponsors.length > 0) {
      lines.push(`Sponsors: ${data.sponsors.join(", ")}`);
    }
    if (data.signatories.length > 0) {
      lines.push(`Signatories: ${data.signatories.join(", ")}`);
    }
    if (data.date) {
      const d = new Date(data.date + "T00:00:00");
      lines.push(
        `Date: ${d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
      );
    }
    lines.push("");
    lines.push("---");
    lines.push("");

    data.preambulatoryClauses.forEach((clause) => {
      lines.push(`${clause.keyword} ${clause.text},`);
    });
    lines.push("");

    data.operativeClauses.forEach((clause, idx) => {
      const isFinal = idx === data.operativeClauses.length - 1;
      const punct = isFinal ? "." : ";";
      lines.push(`${idx + 1}. ${clause.keyword} ${clause.text}${clause.subClauses.length === 0 ? punct : ""}`);
      clause.subClauses.forEach((sub) => {
        lines.push(`    (${sub.letter}) ${sub.text}${punct}`);
      });
    });
    lines.push("");
    lines.push(
      data.finalClause ||
        `This resolution, adopted by ${committee} on ${data.date || "[DATE]"}, shall enter into force immediately upon adoption.`,
    );

    return lines.join("\n");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Resolution Builder</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <EyeOff className="size-4 mr-1" />
            ) : (
              <Eye className="size-4 mr-1" />
            )}
            {showPreview ? "Editor" : "Preview"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check className="size-4 mr-1" />
            ) : (
              <Copy className="size-4 mr-1" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>

      {showPreview ? (
        <ScrollArea className="max-h-[70vh]">
          <ResolutionPreview
            data={{
              committee: state.committee,
              topic: state.topic,
              sponsors: state.sponsors,
              signatories: state.signatories,
              date: state.date,
              preambulatoryClauses: state.preambulatoryClauses,
              operativeClauses: state.operativeClauses,
              finalClause: state.finalClause,
            }}
          />
        </ScrollArea>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Editor Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Header</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Committee</label>
                    <Input
                      placeholder="e.g. General Assembly First Committee"
                      value={state.committee}
                      onChange={(e) => update("committee", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Topic</label>
                    <Input
                      placeholder="e.g. Strengthening of UN Peacekeeping"
                      value={state.topic}
                      onChange={(e) => update("topic", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={state.date}
                    onChange={(e) => update("date", e.target.value)}
                    className="w-48"
                  />
                </div>

                {/* Sponsors */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Sponsors</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a sponsor country"
                      value={sponsorInput}
                      onChange={(e) => setSponsorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSponsor();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSponsor}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  {state.sponsors.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {state.sponsors.map((s) => (
                        <Badge
                          key={s}
                          variant="secondary"
                          className="gap-1 cursor-pointer"
                          onClick={() => removeSponsor(s)}
                        >
                          {s}
                          <X className="size-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Signatories */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Signatories</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a signatory country"
                      value={signatoryInput}
                      onChange={(e) => setSignatoryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSignatory();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSignatory}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  {state.signatories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {state.signatories.map((s) => (
                        <Badge
                          key={s}
                          variant="secondary"
                          className="gap-1 cursor-pointer"
                          onClick={() => removeSignatory(s)}
                        >
                          {s}
                          <X className="size-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preambulatory Clauses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  Preambulatory Clauses
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPreambulatory}
                >
                  <Plus className="size-4 mr-1" />
                  Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {state.preambulatoryClauses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No preambulatory clauses yet. Click &ldquo;Add&rdquo; to
                    begin drafting.
                  </p>
                ) : (
                  state.preambulatoryClauses.map((clause, idx) => (
                    <ClauseEditor
                      key={clause.id}
                      clause={clause}
                      index={idx}
                      total={state.preambulatoryClauses.length}
                      isPreambulatory
                      onUpdate={(c) => updatePreambulatory(idx, c)}
                      onRemove={() => removePreambulatory(idx)}
                      onMoveUp={() => movePreambulatory(idx, -1)}
                      onMoveDown={() => movePreambulatory(idx, 1)}
                    />
                  ))
                )}
              </CardContent>
            </Card>

            {/* Operative Clauses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Operative Clauses</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOperative}
                >
                  <Plus className="size-4 mr-1" />
                  Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {state.operativeClauses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No operative clauses yet. Click &ldquo;Add&rdquo; to begin
                    drafting.
                  </p>
                ) : (
                  state.operativeClauses.map((clause, idx) => (
                    <ClauseEditor
                      key={clause.id}
                      clause={clause}
                      index={idx}
                      total={state.operativeClauses.length}
                      isPreambulatory={false}
                      onUpdate={(c) => updateOperative(idx, c)}
                      onRemove={() => removeOperative(idx)}
                      onMoveUp={() => moveOperative(idx, -1)}
                      onMoveDown={() => moveOperative(idx, 1)}
                    />
                  ))
                )}
              </CardContent>
            </Card>

            {/* Final Clause */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Final Clause</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateFinalClause}
                >
                  Auto-generate
                </Button>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="This resolution, adopted by [committee] on [date], shall enter into force immediately upon adoption."
                  value={state.finalClause}
                  onChange={(e) => update("finalClause", e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Live Preview Sidebar */}
          <div className="hidden lg:block">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base">Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[60vh]">
                  <ResolutionPreview
                    data={{
                      committee: state.committee,
                      topic: state.topic,
                      sponsors: state.sponsors,
                      signatories: state.signatories,
                      date: state.date,
                      preambulatoryClauses: state.preambulatoryClauses,
                      operativeClauses: state.operativeClauses,
                      finalClause: state.finalClause,
                    }}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
