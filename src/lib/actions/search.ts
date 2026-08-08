"use server";

import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";

export type SearchGroup = {
  type: string;
  results: {
    id: string;
    label: string;
    subtitle?: string;
    href: string;
  }[];
};

export async function globalSearch(
  query: string,
): Promise<ActionState<SearchGroup[]>> {
  try {
    if (!query.trim()) return ok("Empty query.", []);

    const q = query.trim();
    const limit = 5;

    const [conferences, users, workspaces, articles] = await Promise.all([
      getDb().conference.findMany({
        where: {
          published: true,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { country: { contains: q, mode: "insensitive" } },
            { tagline: { contains: q, mode: "insensitive" } },
            { theme: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          city: true,
          country: true,
          slug: true,
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      getDb().user.findMany({
        where: {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
        take: limit,
      }),
      getDb().workspace.findMany({
        where: {
          title: { contains: q, mode: "insensitive" },
        },
        select: {
          id: true,
          title: true,
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      getDb().aiDocument.findMany({
        where: {
          workspaceId: null,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { source: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          source: true,
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const groups: SearchGroup[] = [];

    if (conferences.length > 0) {
      groups.push({
        type: "Conferences",
        results: conferences.map((c) => ({
          id: c.id,
          label: c.name,
          subtitle: [c.city, c.country].filter(Boolean).join(", "),
          href: `/conference/${c.slug}`,
        })),
      });
    }

    if (users.length > 0) {
      groups.push({
        type: "People",
        results: users.map((u) => {
          const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || "Anonymous";
          return {
            id: u.id,
            label: name,
            subtitle: u.username ? `@${u.username}` : undefined,
            href: `/profile/${u.id}`,
          };
        }),
      });
    }

    if (workspaces.length > 0) {
      groups.push({
        type: "Workspaces",
        results: workspaces.map((w) => ({
          id: w.id,
          label: w.title,
          href: `/workspaces/${w.id}`,
        })),
      });
    }

    if (articles.length > 0) {
      groups.push({
        type: "News",
        results: articles.map((a) => ({
          id: a.id,
          label: a.title,
          subtitle: a.source,
          href: "/news",
        })),
      });
    }

    return ok("Loaded.", groups);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Search failed.");
  }
}
