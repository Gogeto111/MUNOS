import { describe, it, expect } from "vitest";
import { buildSimulationPrompt } from "@/lib/ai/simulation-prompts";

describe("buildSimulationPrompt", () => {
  it("includes committee name, topic, and country", () => {
    const prompt = buildSimulationPrompt(
      {
        committeeName: "UNSC",
        topic: "Maritime Security",
        country: "Syria",
        userRole: "DELEGATE",
        status: "SETUP",
        delegates: [],
        events: [],
      },
      "SPEECH",
      {},
    );
    expect(prompt).toContain("UNSC");
    expect(prompt).toContain("Maritime Security");
    expect(prompt).toContain("Syria");
  });

  it("lists delegates with their stances", () => {
    const prompt = buildSimulationPrompt(
      {
        committeeName: "DISEC",
        topic: "Nuclear Disarmament",
        country: "USA",
        userRole: "DELEGATE",
        status: "SETUP",
        delegates: [
          {
            id: "1",
            country: "China",
            displayName: "China Delegate",
            isAi: true,
            isChair: false,
            policyStance: "Non-interference",
            speakingStyle: null,
          },
          {
            id: "2",
            country: "Russia",
            displayName: "Russia Delegate",
            isAi: true,
            isChair: false,
            policyStance: "Sovereignty first",
            speakingStyle: null,
          },
        ],
        events: [],
      },
      "SPEECH",
      {},
    );
    expect(prompt).toContain("China");
    expect(prompt).toContain("Non-interference");
    expect(prompt).toContain("Russia");
    expect(prompt).toContain("Sovereignty first");
  });

  it("includes recent events in context", () => {
    const prompt = buildSimulationPrompt(
      {
        committeeName: "HRC",
        topic: "Human Rights",
        country: "France",
        userRole: "DELEGATE",
        status: "RUNNING",
        delegates: [],
        events: [
          {
            id: "1",
            type: "CHAIR_ANNOUNCEMENT" as never,
            content: "Committee opened.",
            delegateId: null,
            createdAt: new Date(),
          },
        ],
      },
      "POI_ANSWERED",
      {},
    );
    expect(prompt).toContain("Recent events");
    expect(prompt).toContain("CHAIR_ANNOUNCEMENT");
    expect(prompt).toContain("Committee opened");
  });

  it("includes the current action and context", () => {
    const prompt = buildSimulationPrompt(
      {
        committeeName: "GST",
        topic: null,
        country: "India",
        userRole: "DELEGATE",
        status: "SETUP",
        delegates: [],
        events: [],
      },
      "MOTION",
      { motionType: "moderated_caucus", topic: "Climate" },
    );
    expect(prompt).toContain("Current action: MOTION");
    expect(prompt).toContain("moderated_caucus");
  });

  it("uses formal UN language instruction", () => {
    const prompt = buildSimulationPrompt(
      {
        committeeName: "UNSC",
        topic: "Peacekeeping",
        country: "UK",
        userRole: "DELEGATE",
        status: "SETUP",
        delegates: [],
        events: [],
      },
      "SPEECH",
      {},
    );
    expect(prompt).toContain("formal UN language");
  });
});