import { describe, expect, it } from "vitest";
import { getProfileCompletion, completionTone } from "@/lib/profile";
import type { ProfileCompletionInput } from "@/lib/profile";

const emptyInput: ProfileCompletionInput = {
  avatarUrl: null,
  firstName: null,
  lastName: null,
  username: null,
  phoneNumber: null,
  school: null,
  university: null,
  grade: null,
  city: null,
  state: null,
  country: null,
  bio: null,
  experienceLevel: null,
  munsAttended: 0,
  awardsWon: 0,
  interestsCount: 0,
  committeesCount: 0,
  countriesCount: 0,
  awardsCount: 0,
  certificatesCount: 0,
  socialLinksCount: 0,
};

const fullInput: ProfileCompletionInput = {
  avatarUrl: "https://example.com/a.png",
  firstName: "Alex",
  lastName: "Rivera",
  username: "alexrivera",
  phoneNumber: "+1 555",
  school: "Riverside High",
  university: "University of Example",
  grade: "Junior",
  city: "Geneva",
  state: "GE",
  country: "Switzerland",
  bio: "Delegate.",
  experienceLevel: "INTERMEDIATE",
  munsAttended: 14,
  awardsWon: 6,
  interestsCount: 4,
  committeesCount: 3,
  countriesCount: 3,
  awardsCount: 3,
  certificatesCount: 2,
  socialLinksCount: 3,
};

describe("getProfileCompletion", () => {
  it("scores 0 for an empty profile", () => {
    const result = getProfileCompletion(emptyInput);
    expect(result.score).toBe(0);
    expect(result.completedFields).toBe(0);
    expect(result.totalFields).toBe(20);
    expect(result.missing.length).toBe(20);
  });

  it("scores 100 for a fully completed profile", () => {
    const result = getProfileCompletion(fullInput);
    expect(result.score).toBe(100);
    expect(result.completedFields).toBe(20);
    expect(result.missing).toEqual([]);
  });

  it("weights personal (50%) above MUN (30%) and portfolio (20%)", () => {
    // Only 11 personal fields filled -> exactly 50.
    const personalOnly = {
      ...emptyInput,
      avatarUrl: fullInput.avatarUrl,
      firstName: fullInput.firstName,
      lastName: fullInput.lastName,
      username: fullInput.username,
      phoneNumber: fullInput.phoneNumber,
      school: fullInput.school,
      grade: fullInput.grade,
      city: fullInput.city,
      state: fullInput.state,
      country: fullInput.country,
      bio: fullInput.bio,
    };
    expect(getProfileCompletion(personalOnly).score).toBe(50);

    // Only 6 MUN fields filled -> exactly 30.
    const munOnly = {
      ...emptyInput,
      experienceLevel: fullInput.experienceLevel,
      munsAttended: fullInput.munsAttended,
      awardsWon: fullInput.awardsWon,
      interestsCount: fullInput.interestsCount,
      committeesCount: fullInput.committeesCount,
      countriesCount: fullInput.countriesCount,
    };
    expect(getProfileCompletion(munOnly).score).toBe(30);
  });

  it("counts a zero numeric field as unfilled", () => {
    const result = getProfileCompletion({
      ...emptyInput,
      awardsCount: 0,
      certificatesCount: 2,
    });
    expect(result.missing).toContain("Awards");
    expect(result.missing).not.toContain("Certificates");
  });

  it("reports human-readable missing labels in group order", () => {
    const result = getProfileCompletion(emptyInput);
    expect(result.missing[0]).toBe("Profile picture");
    expect(result.missing).toContain("Biography");
    expect(result.missing).toContain("Experience level");
    expect(result.missing).toContain("Social links");
  });
});

describe("completionTone", () => {
  it("buckets low / mid / high", () => {
    expect(completionTone(0)).toBe("low");
    expect(completionTone(39)).toBe("low");
    expect(completionTone(40)).toBe("mid");
    expect(completionTone(74)).toBe("mid");
    expect(completionTone(75)).toBe("high");
    expect(completionTone(100)).toBe("high");
  });
});
