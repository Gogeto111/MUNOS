"use server";

import { getDb } from "@/lib/prisma";
import { ok, fail, type ActionState } from "@/lib/actions";

export async function listMarketplaceItems(): Promise<
  ActionState<
    Array<{
      id: string;
      title: string;
      description: string;
      url: string;
      category: string;
      icon: string;
    }>
  >
> {
  try {
    const db = getDb();
    const items = await db.marketplaceItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return ok("Loaded.", items);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load items.");
  }
}

export async function seedMarketplaceItems(): Promise<ActionState<void>> {
  try {
    const db = getDb();
    const count = await db.marketplaceItem.count();
    if (count > 0) return ok("Already seeded.");

    const items = [
      { title: "UN Charter", description: "The foundational treaty of the United Nations.", url: "https://www.un.org/en/about-us/un-charter", category: "Reference", icon: "FileText" },
      { title: "Rules of Procedure — General Assembly", description: "Official rules governing GA debate, motions, and voting.", url: "https://www.un.org/en/ga/documents/rulesofproc.asp", category: "Rules", icon: "FileText" },
      { title: "UN Security Council Provisional Rules", description: "Rules of procedure for UNSC debates and resolutions.", url: "https://www.un.org/securitycouncil/content/provisional-rules-procedure", category: "Rules", icon: "FileText" },
      { title: "Resolution Writing Guide", description: "How to structure preambulatory and operative clauses.", url: "https://www.un.org/en/ga/documents/handbook.asp", category: "Guide", icon: "BookOpen" },
      { title: "Position Paper Template", description: "Standard format for committee position papers.", url: "https://www.bestdelegate.com/ultimate-guide-to-position-papers/", category: "Template", icon: "BookOpen" },
      { title: "UN Documentation Centre", description: "Official UN documents, resolutions, and meeting records.", url: "https://www.un.org/en/documents/", category: "Research", icon: "Globe" },
      { title: "UN Digital Library", description: "Searchable archive of UN documents and publications.", url: "https://digitallibrary.un.org/", category: "Research", icon: "Globe" },
      { title: "MUN Motions Guide", description: "Quick reference for procedural motions in committee.", url: "https://www.bestdelegate.com/motions-caucus-guide-for-model-un/", category: "Guide", icon: "BookOpen" },
      { title: "ICJ Statute", description: "Statute of the International Court of Justice.", url: "https://www.icj-cstatute.org/statute", category: "Reference", icon: "FileText" },
      { title: "Universal Declaration of Human Rights", description: "The foundational human rights document.", url: "https://www.un.org/en/about-us/universal-declaration-of-human-rights", category: "Reference", icon: "FileText" },
      { title: "Paris Agreement — Full Text", description: "The international treaty on climate change.", url: "https://www.un.org/en/climatechange/paris-agreement", category: "Reference", icon: "FileText" },
      { title: "UNHCR Refugee Data", description: "Global refugee statistics and reports.", url: "https://www.unhcr.org/refugee-statistics/", category: "Research", icon: "Globe" },
    ];

    await db.marketplaceItem.createMany({ data: items });
    return ok("Seeded.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to seed.");
  }
}
