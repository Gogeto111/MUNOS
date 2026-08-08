"use server";

import { getDb } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail, type ActionState } from "@/lib/actions";
import { isAiConfigured } from "@/lib/env";
import { UN_FEEDS } from "@/lib/ai/sources/registry";
import { htmlToText, parseRssFeed } from "@/lib/ai/sources/parse";
import { fetchText } from "@/lib/ai/sources/fetch";
import { storeDocument } from "@/lib/ai/store-document";

export type NewsArticle = {
  id: string;
  title: string;
  source: string;
  originUrl: string | null;
  createdAt: Date;
  chunkCount: number;
  preview: string;
};

export type SyncFeedResult = {
  id: string;
  label: string;
  status: "ok" | "error" | "no-content";
  added: number;
  items: number;
  error?: string;
};

/** List all live-sourced news articles, newest first. */
export async function listNewsArticles(
  options: { search?: string; limit?: number } = {},
): Promise<ActionState<NewsArticle[]>> {
  try {
    const limit = options.limit ?? 50;
    const where: Record<string, unknown> = {
      workspaceId: null,
      sourceType: "LIVE",
    };

    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: "insensitive" } },
        { source: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const articles = await getDb().aiDocument.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        chunks: { take: 1, orderBy: { chunkIndex: "asc" } },
      },
    });

    return ok(
      "Loaded.",
      articles.map((a) => ({
        id: a.id,
        title: a.title,
        source: a.source,
        originUrl: a.originUrl,
        createdAt: a.createdAt,
        chunkCount: a.chunkCount,
        preview: a.chunks[0]?.content?.slice(0, 200) ?? "",
      })),
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load news.");
  }
}

/** Get the full text of a news article. */
export async function getNewsArticle(
  articleId: string,
): Promise<ActionState<{ title: string; source: string; originUrl: string | null; text: string }>> {
  try {
    const article = await getDb().aiDocument.findFirst({
      where: { id: articleId, workspaceId: null },
      include: { chunks: { orderBy: { chunkIndex: "asc" } } },
    });
    if (!article) return fail("Article not found.");

    const text = article.chunks.map((c) => c.content).join("\n\n");
    return ok("Loaded.", {
      title: article.title,
      source: article.source,
      originUrl: article.originUrl,
      text,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load article.");
  }
}

/** Sync UN news feeds into the global news store (no workspace required). */
export async function syncNewsFeeds(
  options: { limitPerFeed?: number } = {},
): Promise<ActionState<{ results: SyncFeedResult[] }>> {
  try {
    await requireUser();
    if (!isAiConfigured) return fail("AI is not configured.");

    const limit = options.limitPerFeed ?? 5;
    const results: SyncFeedResult[] = [];

    for (const feed of UN_FEEDS) {
      const result: SyncFeedResult = {
        id: feed.id,
        label: feed.label,
        status: "ok",
        added: 0,
        items: 0,
      };
      try {
        const xml = await fetchText(feed.url);
        const items = parseRssFeed(xml).slice(0, limit);
        result.items = items.length;

        for (const item of items) {
          try {
            let text = "";
            if (item.link) {
              const articleHtml = await fetchText(item.link);
              text = htmlToText(articleHtml);
            }
            if (!text && item.description) {
              text = htmlToText(item.description);
            }
            if (text.length < 100) continue;

            await storeDocument({
              workspaceId: undefined,
              sourceType: "LIVE",
              title: item.title ?? "Untitled",
              source: feed.label,
              originUrl: item.link ?? "",
              metadata: {
                feedId: feed.id,
                topics: feed.topics,
                pubDate: item.pubDate,
              },
              text,
            });
            result.added += 1;
          } catch {
            // skip individual item failures
          }
        }
      } catch (error) {
        result.status = "error";
        result.error = error instanceof Error ? error.message : "Unknown error";
      }
      results.push(result);
    }

    return ok("Sync complete.", { results });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Sync failed.");
  }
}
