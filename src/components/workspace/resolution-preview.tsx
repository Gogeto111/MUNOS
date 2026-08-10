"use client";

import type { Clause } from "@/components/workspace/clause-editor";

export interface ResolutionData {
  committee: string;
  topic: string;
  sponsors: string[];
  signatories: string[];
  date: string;
  preambulatoryClauses: Clause[];
  operativeClauses: Clause[];
  finalClause: string;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "[DATE]";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ResolutionPreview({ data }: { data: ResolutionData }) {
  const {
    committee,
    topic,
    sponsors,
    signatories,
    date,
    preambulatoryClauses,
    operativeClauses,
    finalClause,
  } = data;

  return (
    <div className="bg-white text-black px-10 py-8 font-serif text-sm leading-relaxed max-w-3xl mx-auto border border-border/50 rounded-lg shadow-sm">
      {/* Header Block */}
      <div className="text-center mb-8">
        <h2 className="text-lg font-bold tracking-wide uppercase">
          {committee || "[Committee Name]"}
        </h2>
        <h3 className="text-base font-semibold mt-1">
          {topic || "[Topic]"}
        </h3>
        <div className="mt-4 text-xs space-y-1">
          {sponsors.length > 0 && (
            <p>
              <span className="font-semibold">Sponsors:</span>{" "}
              {sponsors.join(", ")}
            </p>
          )}
          {signatories.length > 0 && (
            <p>
              <span className="font-semibold">Signatories:</span>{" "}
              {signatories.join(", ")}
            </p>
          )}
          <p className="mt-2">
            <span className="font-semibold">Date:</span>{" "}
            {formatDate(date)}
          </p>
        </div>
      </div>

      <hr className="border-black/30 mb-6" />

      {/* Preambulatory Clauses */}
      {preambulatoryClauses.length > 0 && (
        <div className="mb-6">
          {preambulatoryClauses.map((clause, idx) => (
            <p key={clause.id} className="mb-2 ml-6 text-justify">
              <em className="not-italic font-semibold">{clause.keyword}</em>{" "}
              {clause.text}
              {idx < preambulatoryClauses.length - 1 ? "," : ","}
            </p>
          ))}
        </div>
      )}

      {/* Operative Clauses */}
      {operativeClauses.length > 0 && (
        <div className="mb-6">
          {operativeClauses.map((clause, idx) => {
            const isFinal = idx === operativeClauses.length - 1;
            const clauseNum = idx + 1;
            const punctuation = isFinal ? "." : ";";

            return (
              <div key={clause.id} className="mb-3 ml-6">
                <p className="text-justify">
                  <span className="font-semibold">{clauseNum}.</span>{" "}
                  {clause.keyword} {clause.text}
                  {clause.subClauses.length === 0 ? punctuation : ""}
                </p>
                {clause.subClauses.map((sub) => (
                  <p
                    key={sub.id}
                    className="ml-8 text-justify"
                  >
                    <span className="font-semibold">({sub.letter})</span>{" "}
                    {sub.text}
                    {punctuation}
                  </p>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Final Clause */}
      <div className="mt-8 text-center">
        <p className="text-xs italic text-gray-600">
          {finalClause ||
            `This resolution, adopted by ${
              committee || "[Committee]"
            } on ${formatDate(date) || "[DATE]"}, shall enter into force immediately upon adoption.`}
        </p>
      </div>
    </div>
  );
}
