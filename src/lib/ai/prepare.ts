import "server-only";
import { getDb } from "@/lib/prisma";
import {
  buildCommitteeContext,
  buildDebateReplyPrompt,
  buildDebateStrategyPrompt,
  buildPositionPaperPrompt,
  buildPrepPackPrompt,
  buildResearchBriefPrompt,
  buildResolutionPrompt,
  buildRetrievalQuery,
  buildWorkspaceRetrievalQuery,
  summarizeNotes,
  summarizeResolutions,
  summarizeTimeline,
  withMemory,
  withSources,
  type AiCall,
  type AiCommitteeContext,
  type AiWorkspaceContext,
} from "@/lib/ai/prompts";
import { retrieveContext } from "@/lib/ai/retrieve";
import { buildMemoryContext } from "@/lib/ai/memory";

export type CommitteeAiFeature =
  | "research-brief"
  | "position-paper"
  | "resolution"
  | "debate-strategy"
  | "debate-reply";

type NoteRow = { title: string; content: string | null };
type ResolutionRow = { title: string; body: string | null };

async function loadCommitteeContext(
  workspaceId: string,
  committeeId: string,
): Promise<AiCommitteeContext> {
  const committee = await getDb().workspaceCommittee.findFirst({
    where: { id: committeeId, workspaceId },
    select: { name: true, topic: true, country: true, role: true },
  });
  if (!committee) throw new Error("Committee not found.");

  const [notes, resolutions, paper] = await Promise.all([
    getDb().note.findMany({
      where: { workspaceId },
      select: { title: true, content: true },
      orderBy: { updatedAt: "desc" },
      take: 25,
    }),
    getDb().resolution.findMany({
      where: { workspaceId, committeeId },
      select: { title: true, body: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    getDb().positionPaper.findUnique({
      where: { committeeId },
      select: { title: true, content: true },
    }),
  ]);

  const paperContent = paper?.content?.trim();
  return buildCommitteeContext({
    committee: {
      name: committee.name,
      topic: committee.topic,
      country: committee.country,
      role: committee.role,
    },
    notes: summarizeNotes(notes as NoteRow[]),
    resolutions: summarizeResolutions(resolutions as ResolutionRow[]),
    positionPaper: paperContent
      ? [paper?.title?.trim(), paperContent].filter(Boolean).join("\n")
      : null,
  });
}

async function withRetrieval(
  workspaceId: string,
  query: string,
  call: AiCall,
): Promise<AiCall> {
  const retrieved = await retrieveContext(workspaceId, query);
  return withSources(call, retrieved);
}

function buildFeatureCall(
  feature: CommitteeAiFeature,
  ctx: AiCommitteeContext,
  options: { focus?: string; speechContext?: string },
): AiCall {
  switch (feature) {
    case "research-brief":
      return buildResearchBriefPrompt(ctx);
    case "position-paper":
      return buildPositionPaperPrompt(ctx);
    case "resolution":
      return buildResolutionPrompt(ctx, options.focus ?? "");
    case "debate-strategy":
      return buildDebateStrategyPrompt(ctx, options.speechContext ?? "");
    case "debate-reply":
      return buildDebateReplyPrompt(ctx, options.speechContext ?? "");
  }
}

/**
 * Loads committee context, retrieves relevant research-library + corpus
 * chunks, and composes a grounded AI call for one committee-level feature.
 */
export async function prepareCommitteeCall(
  feature: CommitteeAiFeature,
  workspaceId: string,
  committeeId: string,
  options: { focus?: string; speechContext?: string } = {},
): Promise<AiCall> {
  const ctx = await loadCommitteeContext(workspaceId, committeeId);
  const call = buildFeatureCall(feature, ctx, options);
  const [grounded, memory] = await Promise.all([
    withRetrieval(workspaceId, buildRetrievalQuery(ctx), call),
    buildMemoryContext(workspaceId),
  ]);
  return withMemory(grounded, memory);
}

/** Composes a grounded prep-pack call for the whole workspace. */
export async function preparePrepPackCall(workspaceId: string): Promise<AiCall> {
  const [committees, notes, resolutions, timeline] = await Promise.all([
    getDb().workspaceCommittee.findMany({
      where: { workspaceId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        name: true,
        topic: true,
        country: true,
        role: true,
        positionPaper: { select: { content: true } },
      },
    }),
    getDb().note.findMany({
      where: { workspaceId },
      select: { title: true, content: true },
      orderBy: { updatedAt: "desc" },
      take: 30,
    }),
    getDb().resolution.findMany({
      where: { workspaceId },
      select: { title: true, body: true },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    getDb().timelineEvent.findMany({
      where: { workspaceId },
      select: { title: true, date: true, description: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const workspaceContext: AiWorkspaceContext = {
    committees: committees.map((committee) => ({
      name: committee.name,
      topic: committee.topic,
      country: committee.country,
      role: committee.role,
      positionPaper: committee.positionPaper?.content?.trim() || null,
    })),
    notes: summarizeNotes(notes as NoteRow[]),
    resolutions: summarizeResolutions(resolutions as ResolutionRow[]),
    timeline: summarizeTimeline(timeline),
  };

  const call = buildPrepPackPrompt(workspaceContext);
  const [grounded, memory] = await Promise.all([
    withRetrieval(workspaceId, buildWorkspaceRetrievalQuery(workspaceContext), call),
    buildMemoryContext(workspaceId),
  ]);
  return withMemory(grounded, memory);
}
