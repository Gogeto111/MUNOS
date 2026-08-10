"use client";

import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export interface SubClause {
  id: string;
  letter: string;
  text: string;
}

export interface Clause {
  id: string;
  keyword: string;
  text: string;
  subClauses: SubClause[];
  endsWithPeriod: boolean;
}

export const PREAMBULATORY_KEYWORDS = [
  "Affirming",
  "Alarmed by",
  "Approving",
  "Aware of",
  "Believing",
  "Confident",
  "Concerned",
  "Conscious",
  "Contemplating",
  "Convinced",
  "Correcting",
  "Desiring",
  "Expecting",
  "Fulfilling",
  "Guided by",
  "Having considered",
  "Keeping in mind",
  "Noting",
  "Observing",
  "Reaffirming",
  "Recognizing",
  "Seeking",
  "Viewing",
  "Welcoming",
];

export const OPERATIVE_KEYWORDS = [
  "Accepts",
  "Acknowledges",
  "Approves",
  "Authorizes",
  "Calls upon",
  "Condemns",
  "Confirms",
  "Demands",
  "Designates",
  "Encourages",
  "Endorses",
  "Establishes",
  "Expresses",
  "Further recommends",
  "Further resolves",
  "Urges",
];

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export function createEmptyClause(isPreambulatory: boolean): Clause {
  const keywords = isPreambulatory ? PREAMBULATORY_KEYWORDS : OPERATIVE_KEYWORDS;
  return {
    id: generateId(),
    keyword: keywords[0],
    text: "",
    subClauses: [],
    endsWithPeriod: false,
  };
}

export function addSubClause(clause: Clause): Clause {
  const nextLetter = String.fromCharCode(97 + clause.subClauses.length);
  return {
    ...clause,
    subClauses: [
      ...clause.subClauses,
      { id: generateId(), letter: nextLetter, text: "" },
    ],
  };
}

export function ClauseEditor({
  clause,
  index,
  total,
  isPreambulatory,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  clause: Clause;
  index: number;
  total: number;
  isPreambulatory: boolean;
  onUpdate: (updated: Clause) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const keywords = isPreambulatory ? PREAMBULATORY_KEYWORDS : OPERATIVE_KEYWORDS;

  return (
    <div className="rounded-lg border border-border/70 bg-muted/30 p-3 space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={onMoveUp}
            disabled={index === 0}
          >
            <ChevronUp className="size-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={onMoveDown}
            disabled={index === total - 1}
          >
            <ChevronDown className="size-3" />
          </Button>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={clause.keyword}
              onValueChange={(value) => onUpdate({ ...clause, keyword: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {keywords.map((kw) => (
                  <SelectItem key={kw} value={kw}>
                    {kw}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!isPreambulatory && (
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={clause.endsWithPeriod}
                  onChange={(e) =>
                    onUpdate({ ...clause, endsWithPeriod: e.target.checked })
                  }
                  className="size-3"
                />
                End with period (final clause)
              </label>
            )}
          </div>

          <Input
            placeholder={
              isPreambulatory
                ? "Preambulatory clause text…"
                : "Operative clause text…"
            }
            value={clause.text}
            onChange={(e) => onUpdate({ ...clause, text: e.target.value })}
          />

          {clause.subClauses.length > 0 && (
            <div className="space-y-2 pl-4 border-l-2 border-border/50">
              {clause.subClauses.map((sub, subIdx) => (
                <div key={sub.id} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground w-4">
                    {sub.letter})
                  </span>
                  <Input
                    placeholder="Sub-clause text…"
                    value={sub.text}
                    onChange={(e) => {
                      const updated = [...clause.subClauses];
                      updated[subIdx] = { ...sub, text: e.target.value };
                      onUpdate({ ...clause, subClauses: updated });
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-6 shrink-0"
                    onClick={() => {
                      const updated = clause.subClauses.filter(
                        (_, i) => i !== subIdx,
                      );
                      onUpdate({ ...clause, subClauses: updated });
                    }}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() => onUpdate({ ...clause, subClauses: [...clause.subClauses, { id: generateId(), letter: String.fromCharCode(97 + clause.subClauses.length), text: "" }] })}
          >
            + Add sub-clause
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
