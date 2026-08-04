import { describe, expect, it } from "vitest";
import {
  buildCommitteeContext,
  buildDebateStrategyPrompt,
  buildPositionPaperPrompt,
  buildPrepPackPrompt,
  buildResearchBriefPrompt,
  buildResolutionPrompt,
  buildRetrievalQuery,
  buildWorkspaceRetrievalQuery,
  formatRetrievedSources,
  summarizeNotes,
  summarizeResolutions,
  summarizeTimeline,
  withSources,
  type AiCommitteeContext,
  type AiWorkspaceContext,
} from "@/lib/ai/prompts";

const baseContext: AiCommitteeContext = {
  committeeName: "UNGA First Committee",
  topic: "Artificial intelligence and international security",
  country: "Canada",
  role: "DELEGATE",
  notes: "- Research:\nCanada supports a multilateral AI governance framework.",
  positionPaper: null,
  resolutions: "None yet.",
};

describe("summarizeNotes", () => {
  it("returns a placeholder when there are no notes", () => {
    expect(summarizeNotes([])).toBe("No notes yet.");
  });

  it("joins titles and content into a bulleted summary", () => {
    const result = summarizeNotes([
      { title: "Opening speech", content: "Canada favors norms." },
      { title: "Draft clause", content: null },
    ]);
    expect(result).toContain("- Opening speech:");
    expect(result).toContain("Canada favors norms.");
    expect(result).toContain("- Draft clause");
  });

  it("truncates very long notes and marks the truncation", () => {
    const long = [{ title: "Big note", content: "x".repeat(50_000) }];
    const result = summarizeNotes(long);
    expect(result.length).toBeLessThan(12_500);
    expect(result).toContain("truncated");
  });
});

describe("summarizeResolutions", () => {
  it("returns a placeholder when there are none", () => {
    expect(summarizeResolutions([])).toBe("None yet.");
  });

  it("joins resolutions into a summary", () => {
    const result = summarizeResolutions([
      { title: "Draft resolution", body: "Operative clause 1." },
    ]);
    expect(result).toContain("- Draft resolution:");
    expect(result).toContain("Operative clause 1.");
  });
});

describe("summarizeTimeline", () => {
  it("returns a placeholder when there are no events", () => {
    expect(summarizeTimeline([])).toBe("No timeline events yet.");
  });

  it("formats event dates as ISO dates", () => {
    const result = summarizeTimeline([
      { title: "Committee session", date: new Date("2026-08-10"), description: "Day 1" },
    ]);
    expect(result).toContain("- 2026-08-10: Committee session");
    expect(result).toContain("Day 1");
  });

  it("falls back to the raw value for invalid dates", () => {
    const result = summarizeTimeline([
      { title: "Deadline", date: "not-a-date", description: null },
    ]);
    expect(result).toContain("not-a-date: Deadline");
  });
});

describe("buildCommitteeContext", () => {
  it("maps committee fields and keeps nulls as null", () => {
    const ctx = buildCommitteeContext({
      committee: { name: "ECOSOC", topic: null, country: "Germany", role: null },
      notes: "notes",
      resolutions: "none",
      positionPaper: null,
    });
    expect(ctx.committeeName).toBe("ECOSOC");
    expect(ctx.topic).toBeNull();
    expect(ctx.country).toBe("Germany");
    expect(ctx.role).toBeNull();
  });
});

describe("buildResearchBriefPrompt", () => {
  it("produces a system + prompt pair containing the context", () => {
    const call = buildResearchBriefPrompt(baseContext);
    expect(call.system).toContain("research assistant");
    expect(call.prompt).toContain("UNGA First Committee");
    expect(call.prompt).toContain("Artificial intelligence and international security");
    expect(call.prompt).toContain("Canada");
    expect(call.prompt).toContain("## Overview");
    expect(call.prompt).toContain("bottom line");
  });

  it("handles missing topic and country gracefully", () => {
    const call = buildResearchBriefPrompt({
      ...baseContext,
      topic: null,
      country: null,
    });
    expect(call.prompt).toContain("UNGA First Committee");
    expect(call.prompt).not.toContain("Delegation / country");
  });
});

describe("buildPositionPaperPrompt", () => {
  it("requests the standard position paper structure", () => {
    const call = buildPositionPaperPrompt(baseContext);
    expect(call.system).toContain("position paper");
    expect(call.prompt).toContain("### Introduction");
    expect(call.prompt).toContain("### General position");
    expect(call.prompt).toContain("### Proposed solutions");
    expect(call.prompt).toContain("first-person plural");
  });
});

describe("buildResolutionPrompt", () => {
  it("includes the requested focus and MUN resolution format", () => {
    const call = buildResolutionPrompt(baseContext, "focus on AI verification");
    expect(call.prompt).toContain("focus on AI verification");
    expect(call.prompt).toContain("Preambulatory clauses");
    expect(call.prompt).toContain("Operative clauses");
    expect(call.system).toContain("Calls upon");
  });

  it("omits the focus block when focus is blank", () => {
    const call = buildResolutionPrompt(baseContext, "   ");
    expect(call.prompt).not.toContain("Specific focus requested");
  });
});

describe("buildDebateStrategyPrompt", () => {
  it("embeds the speech context and asks for POIs", () => {
    const call = buildDebateStrategyPrompt(
      baseContext,
      "Delivering a speech on AI verification regimes.",
    );
    expect(call.system).toContain("debate coach");
    expect(call.prompt).toContain("Delivering a speech on AI verification regimes.");
    expect(call.prompt).toContain("Suggested Points of Information");
    expect(call.prompt).toContain("## Opening speech");
  });

  it("falls back to a generic prompt without speech context", () => {
    const call = buildDebateStrategyPrompt(baseContext, "");
    expect(call.prompt).toContain("No current speech context supplied");
  });
});

describe("buildPrepPackPrompt", () => {
  it("produces a per-committee prep pack from workspace context", () => {
    const call = buildPrepPackPrompt({
      committees: [
        {
          name: "UNGA First Committee",
          topic: "AI and international security",
          country: "Canada",
          role: "DELEGATE",
          positionPaper: null,
        },
      ],
      notes: "notes here",
      resolutions: "none",
      timeline: "2026-08-10: Committee session",
    });
    expect(call.system).toContain("preparation coach");
    expect(call.prompt).toContain("UNGA First Committee");
    expect(call.prompt).toContain("Country stance");
    expect(call.prompt).toContain("Three talking points");
    expect(call.prompt).toContain("Priorities before the conference");
  });

  it("handles an empty committee list", () => {
    const call = buildPrepPackPrompt({
      committees: [],
      notes: "notes",
      resolutions: "none",
      timeline: "",
    });
    expect(call.prompt).toContain("No committees have been added");
  });
});

describe("buildRetrievalQuery", () => {
  it("combines topic and country into a focused query", () => {
    expect(buildRetrievalQuery(baseContext)).toBe(
      "Artificial intelligence and international security, Canada",
    );
  });

  it("falls back to a generic query when topic and country are missing", () => {
    expect(buildRetrievalQuery({ ...baseContext, topic: null, country: null })).toBe(
      "Model United Nations committee background",
    );
  });
});

describe("buildWorkspaceRetrievalQuery", () => {
  it("unions committee topics", () => {
    const ctx: AiWorkspaceContext = {
      committees: [
        { name: "UNGA", topic: "AI governance", country: null, role: null, positionPaper: null },
        { name: "ECOSOC", topic: "Climate finance", country: null, role: null, positionPaper: null },
      ],
      notes: "",
      resolutions: "",
      timeline: "",
    };
    expect(buildWorkspaceRetrievalQuery(ctx)).toBe("AI governance; Climate finance");
  });

  it("falls back when there are no topics", () => {
    expect(buildWorkspaceRetrievalQuery({ committees: [], notes: "", resolutions: "", timeline: "" })).toBe(
      "Model United Nations conference preparation",
    );
  });
});

describe("formatRetrievedSources", () => {
  it("renders a numbered source list with titles and headings", () => {
    const result = formatRetrievedSources([
      {
        id: "1",
        content: "Article 2 prohibits the threat or use of force.",
        heading: "Article 2",
        title: "UN Charter",
        source: "un.org",
      },
    ]);
    expect(result).toContain("[1] UN Charter — un.org (Article 2)");
    expect(result).toContain("Article 2 prohibits the threat or use of force.");
  });

  it("returns an empty string for no sources", () => {
    expect(formatRetrievedSources([])).toBe("");
  });
});

describe("withSources", () => {
  it("appends the sources block and citation instructions", () => {
    const call = withSources(buildResearchBriefPrompt(baseContext), [
      {
        id: "1",
        content: "Canada supports a multilateral AI governance framework.",
        heading: "Article 2",
        title: "UN Charter",
        source: "un.org",
      },
    ]);
    expect(call.prompt).toContain("## Relevant sources");
    expect(call.prompt).toContain("[1] UN Charter");
    expect(call.prompt).toContain("cite each one inline as [n]");
  });

  it("returns the call unchanged when there are no sources", () => {
    const call = buildResearchBriefPrompt(baseContext);
    expect(withSources(call, [])).toBe(call);
  });
});
