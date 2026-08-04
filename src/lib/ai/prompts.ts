export interface AiCall {
  system: string;
  prompt: string;
}

export interface AiCommitteeContext {
  committeeName: string;
  topic: string | null;
  country: string | null;
  role: string | null;
  notes: string;
  positionPaper: string | null;
  resolutions: string;
}

export interface AiWorkspaceContext {
  committees: {
    name: string;
    topic: string | null;
    country: string | null;
    role: string | null;
    positionPaper: string | null;
  }[];
  notes: string;
  resolutions: string;
  timeline: string;
}

export interface RetrievedSource {
  id: string;
  content: string;
  heading: string | null;
  title: string;
  source: string;
}

const NOTES_MAX_CHARS = 12_000;
const RESOLUTIONS_MAX_CHARS = 8_000;
const SOURCES_MAX_CHARS = 12_000;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}… (truncated)`;
}

export function summarizeNotes(notes: { title: string; content: string | null }[]): string {
  if (notes.length === 0) return "No notes yet.";
  const parts = notes.map((note) => {
    const title = note.title.trim();
    const content = (note.content ?? "").trim();
    return content ? `- ${title}:\n${content}` : `- ${title}`;
  });
  return truncate(parts.join("\n\n"), NOTES_MAX_CHARS);
}

export function summarizeResolutions(
  resolutions: { title: string; body: string | null }[],
): string {
  if (resolutions.length === 0) return "None yet.";
  const parts = resolutions.map((resolution) => {
    const title = resolution.title.trim();
    const body = (resolution.body ?? "").trim();
    return body ? `- ${title}:\n${body}` : `- ${title}`;
  });
  return truncate(parts.join("\n\n"), RESOLUTIONS_MAX_CHARS);
}

export function summarizeTimeline(
  events: { title: string; date: Date | string; description: string | null }[],
): string {
  if (events.length === 0) return "No timeline events yet.";
  const parts = events.map((event) => {
    const date = new Date(event.date);
    const when = Number.isNaN(date.getTime()) ? String(event.date) : date.toISOString().slice(0, 10);
    const description = (event.description ?? "").trim();
    return description ? `- ${when}: ${event.title} — ${description}` : `- ${when}: ${event.title}`;
  });
  return truncate(parts.join("\n"), 6_000);
}

export function buildCommitteeContext(input: {
  committee: { name: string; topic: string | null; country: string | null; role: string | null };
  notes: string;
  resolutions: string;
  positionPaper: string | null;
}): AiCommitteeContext {
  return {
    committeeName: input.committee.name,
    topic: input.committee.topic ?? null,
    country: input.committee.country ?? null,
    role: input.committee.role ?? null,
    notes: input.notes,
    positionPaper: input.positionPaper,
    resolutions: input.resolutions,
  };
}

function describeCommittee(ctx: AiCommitteeContext): string {
  return [
    `Committee: ${ctx.committeeName}`,
    ctx.topic ? `Topic: ${ctx.topic}` : null,
    ctx.country ? `Delegation / country: ${ctx.country}` : null,
    ctx.role ? `Role: ${ctx.role}` : null,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

export function buildResearchBriefPrompt(ctx: AiCommitteeContext): AiCall {
  return {
    system:
      "You are a meticulous research assistant for Model United Nations delegates. " +
      "You produce well-structured, factual briefing notes. Distinguish firmly established facts from opinion. " +
      "Do not invent statistics, treaties, or quotes; where a number is uncertain, say 'approximately' or omit it. " +
      "Keep the brief under 900 words.",
    prompt:
      `Produce a research briefing note for the following delegate.\n\n` +
      `${describeCommittee(ctx)}\n\n` +
      `Delegate's notes:\n${ctx.notes}\n\n` +
      `Existing position paper (if any):\n${ctx.positionPaper ?? "None yet"}\n\n` +
      `Structure the brief with these Markdown sections:\n` +
      `## Overview\n## Key stakeholders\n## Official positions (member states, blocs, agencies)\n` +
      `## Key terms to know\n## Most likely debate flashpoints\n## Points to research further\n\n` +
      `End with a one-line 'bottom line' for the delegate.`,
  };
}

export function buildPositionPaperPrompt(ctx: AiCommitteeContext): AiCall {
  return {
    system:
      "You are an experienced Model United Nations position paper writer. " +
      "You draft position papers in formal, diplomatic English: clear, specific, and grounded in the delegation's stance. " +
      "Do not invent specific statistics. Keep the draft to 4–6 short paragraphs.",
    prompt:
      `Draft a position paper for this delegate.\n\n` +
      `${describeCommittee(ctx)}\n\n` +
      `Delegate's notes:\n${ctx.notes}\n\n` +
      `Existing draft (if any) to improve on:\n${ctx.positionPaper ?? "None yet"}\n\n` +
      `Structure the paper as Markdown with these sections:\n` +
      `### Introduction (the country and how it frames the topic)\n` +
      `### General position (the country's broader stance)\n` +
      `### Specific position on the topic (2–3 concrete points)\n` +
      `### Proposed solutions (what this delegation would put forward)\n` +
      `### Conclusion (forward-looking, one paragraph)\n\n` +
      `Write in the first-person plural ('we believe'). Do not invent facts — prefer cautious, defensible language.`,
  };
}

export function buildResolutionPrompt(ctx: AiCommitteeContext, focus: string): AiCall {
  const focusText = focus.trim()
    ? `\nSpecific focus requested by the delegate:\n${focus.trim()}\n`
    : "";
  return {
    system:
      "You are a Model United Nations resolution drafter. You produce draft resolutions that follow standard MUN format: " +
      "a title, a preambulatory section ('Recalling', 'Noting', 'Reaffirming'...), and a numbered operative section " +
      "(clauses beginning with strong action verbs like 'Calls upon', 'Requests', 'Establishes'). " +
      "Operative clauses must be concrete, implementable, and consistent with the sponsoring country's stance. " +
      "Do not invent treaty numbers or UN document references.",
    prompt:
      `Draft a resolution for this delegation.\n\n` +
      `${describeCommittee(ctx)}\n\n` +
      `Delegate's notes:\n${ctx.notes}\n\n` +
      `Other drafts from the same workspace (for style and consistency):\n${ctx.resolutions || "None"}\n` +
      focusText +
      `\nFormat the draft as Markdown:\n` +
      `### Title\n` +
      `**Sponsors:** <country or placeholder>\n` +
      `### Preambulatory clauses\n` +
      `### Operative clauses\n\n` +
      `Include 5–7 preambulatory clauses and 6–9 operative clauses. Number the operative clauses.`,
  };
}

export function buildDebateStrategyPrompt(
  ctx: AiCommitteeContext,
  speechContext: string,
): AiCall {
  const speech = speechContext.trim()
    ? `\nWhat the delegate is currently working on (speech context):\n${speechContext.trim()}\n`
    : "\n(No current speech context supplied — give general debate strategy.)\n";
  return {
    system:
      "You are a seasoned Model United Nations debate coach. You give tactical, actionable guidance: " +
      "an opening speech outline, the strongest arguments to make, likely pushback from opponents, " +
      "and specific Points of Information (POIs) the delegate can deliver. Be concrete and direct.",
    prompt:
      `Prepare debate strategy for this delegate.\n\n` +
      `${describeCommittee(ctx)}\n\n` +
      `Delegate's notes:\n${ctx.notes}\n` +
      speech +
      `\nProduce Markdown with these sections:\n` +
      `## Opening speech (60–90 seconds)\n` +
      `## Three strongest arguments\n` +
      `## Likely pushback and rebuttals\n` +
      `## Suggested Points of Information (3–5 one-line questions)\n` +
      `## Two backup POIs if the first ones get taken`,
  };
}

export function buildDebateReplyPrompt(ctx: AiCommitteeContext, userSpeech: string): AiCall {
  const speech = userSpeech.trim() || "(the delegate spoke — respond to their general stance)";
  return {
    system:
      "You are an opposing delegate in a Model United Nations committee, in character as a strong, " +
      "well-prepared diplomat from a country that disagrees with the speaker on key points. " +
      "Respond in formal MUN speaking style, in character, in the first person plural ('we believe'). " +
      "Keep the reply under 220 words. Challenge the weakest argument with one concrete counter-fact or " +
      "policy position, offer your delegation's alternative, and close with a single pointed Point of " +
      "Information the speaker must answer. Never break character and never use generic filler.",
    prompt:
      `${describeCommittee(ctx)}\n\n` +
      `The delegate's notes:\n${ctx.notes}\n\n` +
      `The delegate has just delivered this speech:\n"${speech}"\n\n` +
      `Respond as the opposing delegate: acknowledge their point, rebut it substantively, state your " +
      "delegation's alternative, and finish with one POI-style question.`,
  };
}

export function buildPrepPackPrompt(ctx: AiWorkspaceContext): AiCall {
  const committeeLines =
    ctx.committees.length === 0
      ? "No committees have been added to this workspace yet."
      : ctx.committees
          .map((committee) => {
            const topic = committee.topic ? `Topic: ${committee.topic}` : null;
            const country = committee.country ? `Country: ${committee.country}` : null;
            const role = committee.role ? `Role: ${committee.role}` : null;
            const paper = committee.positionPaper
              ? `Position paper: ${committee.positionPaper}`
              : null;
            return [`- ${committee.name}`, topic, country, role, paper]
              .filter((line): line is string => Boolean(line))
              .join("\n  ");
          })
          .join("\n\n");

  return {
    system:
      "You are a Model United Nations preparation coach. You produce a personalized conference prep pack " +
      "that turns a delegate's workspace (committees, notes, resolutions, timeline) into a ready-to-study briefing. " +
      "Be specific to this delegate's committees and notes — no generic filler.",
    prompt:
      `Produce a personalized prep pack from this workspace.\n\n` +
      `Committees:\n${committeeLines}\n\n` +
      `Notes:\n${ctx.notes}\n\n` +
      `Resolutions:\n${ctx.resolutions}\n\n` +
      `Conference timeline / deadlines:\n${ctx.timeline}\n\n` +
      `Structure the prep pack as Markdown:\n` +
      `## How to use this pack\n` +
      `For each committee, add a block:\n` +
      `### <Committee name>\n` +
      `- **One-line summary**\n` +
      `- **Country stance** (from the notes)\n` +
      `- **Three talking points**\n` +
      `- **Three questions to expect**\n` +
      `- **Preparation checklist** (concrete next actions)\n` +
      `End with:\n` +
      `## Priorities before the conference\n` +
      `## Final checklist`,
  };
}

/** Focused embedding query for a committee-level feature (topic + delegation). */
export function buildRetrievalQuery(ctx: AiCommitteeContext): string {
  const fragments = [ctx.topic?.trim(), ctx.country?.trim()].filter(
    (fragment): fragment is string => Boolean(fragment),
  );
  return fragments.length > 0
    ? fragments.join(", ")
    : "Model United Nations committee background";
}

/** Workspace-level embedding query for the prep pack (union of topics). */
export function buildWorkspaceRetrievalQuery(ctx: AiWorkspaceContext): string {
  const topics = ctx.committees
    .map((committee) => committee.topic?.trim())
    .filter((topic): topic is string => Boolean(topic));
  return topics.length > 0
    ? topics.slice(0, 6).join("; ")
    : "Model United Nations conference preparation";
}

/**
 * Formats retrieved chunks as a numbered source list. Returns "" when there
 * is nothing to cite so callers can skip the sources block entirely.
 */
export function formatRetrievedSources(retrieved: RetrievedSource[]): string {
  if (retrieved.length === 0) return "";
  const parts = retrieved.map((chunk, index) => {
    const heading = chunk.heading ? ` (${chunk.heading})` : "";
    return `[${index + 1}] ${chunk.title} — ${chunk.source}${heading}\n${chunk.content.trim()}`;
  });
  return truncate(parts.join("\n\n"), SOURCES_MAX_CHARS);
}

/**
 * Appends a grounded-sources block to an existing AI call. When nothing was
 * retrieved the call is returned unchanged so prompts stay byte-identical.
 */
export function withSources(call: AiCall, retrieved: RetrievedSource[]): AiCall {
  const sources = formatRetrievedSources(retrieved);
  if (!sources) return call;
  const instructions =
    `\n\nRelevant sources are listed above. Ground your answer in them: prefer ` +
    `source-backed claims and cite each one inline as [n] using the numbers in ` +
    `the source list. Never cite a number that is not present, and do not invent ` +
    `statistics, quotes, treaty numbers, or UN document references.`;
  return {
    system: call.system,
    prompt: `${call.prompt}\n\n## Relevant sources\n\n${sources}${instructions}`,
  };
}

// ---------------------------------------------------------------------------
// Phase 6 — Coach profile memory + debate replies
// ---------------------------------------------------------------------------

export const MEMORY_CATEGORIES = [
  { key: "debate_style", label: "Debating style" },
  { key: "strengths", label: "Strengths" },
  { key: "weaknesses", label: "Areas to improve" },
  { key: "favorite_committees", label: "Favorite committee types" },
  { key: "goals", label: "Goals for this conference" },
  { key: "notes", label: "Coach notes" },
] as const;

export interface MemoryEntry {
  category: string;
  content: string;
}

/**
 * Renders saved coach-profile memory as a prompt block. Returns "" when the
 * profile is empty so callers can skip the block entirely.
 */
export function formatMemoryContext(entries: MemoryEntry[]): string {
  const meaningful = entries
    .map((entry) => ({ category: entry.category.trim(), content: entry.content.trim() }))
    .filter((entry) => entry.category && entry.content);
  if (meaningful.length === 0) return "";
  const lines = meaningful.map(
    (entry) => `- ${entry.category}: ${entry.content.slice(0, 1_200)}`,
  );
  return `## Coach profile (personalized memory)\n${lines.join("\n")}`;
}

/** Appends the coach-profile block to a call, when present. */
export function withMemory(call: AiCall, memoryText: string): AiCall {
  if (!memoryText) return call;
  return {
    system: call.system,
    prompt:
      `${call.prompt}\n\n${memoryText}\n\n` +
      `Tailor the tone, depth, and examples to this delegate's style and goals above.`,
  };
}
