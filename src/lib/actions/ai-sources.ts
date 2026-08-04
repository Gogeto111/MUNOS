"use server";

import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail, toActionError, type ActionState } from "@/lib/actions";
import { isAiConfigured } from "@/lib/env";
import { CONFERENCE_SOURCES, UN_FEEDS } from "@/lib/ai/sources/registry";
import {
  extractPdfLinks,
  htmlToText,
  parseRssFeed,
  titleFromUrl,
} from "@/lib/ai/sources/parse";
import { fetchBytes, fetchText } from "@/lib/ai/sources/fetch";
import { extractPdfText } from "@/lib/ai/pdf";
import { ingestRemoteDocument } from "@/lib/ai/store-document";
import { judgeSpeech } from "@/lib/ai/judge";
import { MEMORY_CATEGORIES } from "@/lib/ai/prompts";
import type { AiScoreResult } from "@/lib/ai/judge-parse";

export interface SyncResult {
  id: string;
  label: string;
  status: "ok" | "error" | "no-content";
  added: number;
  chunks: number;
  items: number;
  error?: string;
}

async function assertOwnsWorkspace(userId: string, workspaceId: string) {
  const workspace = await getDb().workspace.findFirst({
    where: { id: workspaceId, userId },
    select: { id: true },
  });
  if (!workspace) throw new Error("Workspace not found.");
}

/**
 * Crawls the official conference registry (homepages + linked background-guide
 * PDFs) and ingests everything new into the workspace's research library as
 * CRAWLED sources. Best-effort per source — failures are reported, not fatal.
 */
export async function syncOfficialSources(
  workspaceId: string,
  options: { limitPerSource?: number } = {},
): Promise<ActionState<{ results: SyncResult[] }>> {
  const limit = options.limitPerSource ?? 3;
  try {
    const user = await requireUser();
    await assertOwnsWorkspace(user.id, workspaceId);

    const results: SyncResult[] = [];
    for (const source of CONFERENCE_SOURCES) {
      const result: SyncResult = {
        id: source.id,
        label: source.conference,
        status: "ok",
        added: 0,
        chunks: 0,
        items: 0,
      };
      try {
        const html = await fetchText(source.url);
        const overview = await ingestRemoteDocument({
          workspaceId,
          sourceType: "CRAWLED",
          originUrl: source.url,
          title: `${source.conference} — official site`,
          source: source.conference,
          metadata: { crawl: "official-site", description: source.description },
          text: htmlToText(html),
        });
        if (overview.added) {
          result.added += 1;
          result.chunks += overview.chunkCount;
        }

        const pdfLinks = extractPdfLinks(html, source.url, limit).filter((link) =>
          /\.pdf(?:\?|$)/i.test(link),
        );
        for (const link of pdfLinks.slice(0, limit)) {
          try {
            const bytes = await fetchBytes(link);
            const text = await extractPdfText(bytes);
            const doc = await ingestRemoteDocument({
              workspaceId,
              sourceType: "CRAWLED",
              originUrl: link,
              title: titleFromUrl(link),
              source: source.conference,
              metadata: {
                crawl: "background-guide",
                description: source.description,
              },
              text,
            });
            if (doc.added) {
              result.added += 1;
              result.chunks += doc.chunkCount;
              result.items += 1;
            }
          } catch {
            // A single bad PDF must not fail the whole source.
          }
        }

        if (result.added === 0) result.status = "no-content";
      } catch (error) {
        result.status = "error";
        result.error =
          error instanceof Error ? error.message : "Unknown crawl error";
      }
      results.push(result);
    }

    return ok("Official sources sync finished.", { results });
  } catch (error) {
    return toActionError(error);
  }
}

/**
 * Pulls the latest items from the official UN news / meetings feeds and
 * ingests new articles as LIVE sources. Best-effort per feed and per item.
 */
export async function syncLiveUnSources(
  workspaceId: string,
  options: { limitPerFeed?: number } = {},
): Promise<ActionState<{ results: SyncResult[] }>> {
  const limit = options.limitPerFeed ?? 5;
  try {
    const user = await requireUser();
    await assertOwnsWorkspace(user.id, workspaceId);

    const results: SyncResult[] = [];
    for (const feed of UN_FEEDS) {
      const result: SyncResult = {
        id: feed.id,
        label: feed.label,
        status: "ok",
        added: 0,
        chunks: 0,
        items: 0,
      };
      try {
        const xml = await fetchText(feed.url);
        const items = parseRssFeed(xml).slice(0, limit);
        result.items = items.length;

        for (const item of items) {
          if (!item.link) continue;
          let text = item.description;
          try {
            text = htmlToText(await fetchText(item.link));
          } catch {
            // Fall back to the feed's summary text.
          }
          const doc = await ingestRemoteDocument({
            workspaceId,
            sourceType: "LIVE",
            originUrl: item.link,
            title: item.title || titleFromUrl(item.link),
            source: feed.label,
            metadata: {
              feed: feed.label,
              topics: feed.topics,
              published: item.pubDate || undefined,
            },
            text,
          });
          if (doc.added) {
            result.added += 1;
            result.chunks += doc.chunkCount;
          }
        }

        if (result.added === 0) result.status = "no-content";
      } catch (error) {
        result.status = "error";
        result.error =
          error instanceof Error ? error.message : "Unknown feed error";
      }
      results.push(result);
    }

    return ok("Live UN sources sync finished.", { results });
  } catch (error) {
    return toActionError(error);
  }
}

export async function listAiMemories(
  workspaceId: string,
): Promise<
  ActionState<{
    categories: { category: string; label: string; content: string; updatedAt: Date }[];
  }>
> {
  try {
    const user = await requireUser();
    await assertOwnsWorkspace(user.id, workspaceId);

    const stored = await getDb().aiMemory.findMany({
      where: { workspaceId },
      select: { category: true, content: true, updatedAt: true },
    });
    const byCategory = new Map(stored.map((entry) => [entry.category, entry]));
    const categories = MEMORY_CATEGORIES.map(({ key, label }) => {
      const entry = byCategory.get(key);
      return {
        category: key,
        label,
        content: entry?.content ?? "",
        updatedAt: entry?.updatedAt ?? new Date(0),
      };
    });

    return ok("Coach profile loaded.", { categories });
  } catch (error) {
    return toActionError(error);
  }
}

export async function upsertAiMemory(
  workspaceId: string,
  input: { category: string; content: string },
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await assertOwnsWorkspace(user.id, workspaceId);

    const category = String(input.category ?? "").trim();
    const content = String(input.content ?? "").trim();
    if (!category) return fail("Category is required.");
    if (content.length > 4_000) {
      return fail("Keep each coach-profile field under 4,000 characters.");
    }

    await getDb().aiMemory.upsert({
      where: { workspaceId_category: { workspaceId, category } },
      update: { content },
      create: { workspaceId, category, content },
    });

    return ok("Coach profile updated.");
  } catch (error) {
    return toActionError(error);
  }
}

export async function listAiScores(
  workspaceId: string,
): Promise<ActionState<{ scores: { id: string; createdAt: Date; result: AiScoreResult }[] }>> {
  try {
    const user = await requireUser();
    await assertOwnsWorkspace(user.id, workspaceId);

    const scores = await getDb().aiScore.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, createdAt: true, result: true },
    });

    return ok("Score history loaded.", {
      scores: scores.map((score) => ({
        id: score.id,
        createdAt: score.createdAt,
        result: normalizeStoredScore(score.result),
      })),
    });
  } catch (error) {
    return toActionError(error);
  }
}

function normalizeStoredScore(raw: unknown): AiScoreResult {
  const obj =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const suggestions = Array.isArray(obj.suggestions)
    ? obj.suggestions.map((item) => String(item))
    : [];
  return {
    overall: Number(obj.overall ?? 0),
    confidence: Number(obj.confidence ?? 0),
    diplomacy: Number(obj.diplomacy ?? 0),
    research: Number(obj.research ?? 0),
    flow: Number(obj.flow ?? 0),
    speakingTimeSec: Number(obj.speakingTimeSec ?? 0),
    logicalFallacies: Number(obj.logicalFallacies ?? 0),
    suggestions,
  };
}

/**
 * Scores a spoken debate round with the AI judge and persists it to the
 * workspace's score history.
 */
export async function scoreSpeech(
  workspaceId: string,
  input: { transcript: string; durationSec?: number },
): Promise<ActionState<{ score: AiScoreResult }>> {
  try {
    const user = await requireUser();
    await assertOwnsWorkspace(user.id, workspaceId);

    const transcript = String(input.transcript ?? "").trim();
    if (!transcript) return fail("Nothing to score — record a speech first.");
    if (!isAiConfigured) {
      return fail(
        "AI is not configured yet. Add GOOGLE_GENERATIVE_AI_API_KEY to your .env and restart the dev server.",
      );
    }

    const score = await judgeSpeech({
      transcript,
      durationSec:
        typeof input.durationSec === "number" && Number.isFinite(input.durationSec)
          ? input.durationSec
          : undefined,
    });

    await getDb().aiScore.create({
      data: {
        workspaceId,
        feature: "debate",
        transcript,
        durationSec:
          typeof input.durationSec === "number" && Number.isFinite(input.durationSec)
            ? input.durationSec
            : null,
        result: score as unknown as Prisma.InputJsonValue,
      },
    });

    return ok("Speech scored.", { score });
  } catch (error) {
    return toActionError(error);
  }
}
