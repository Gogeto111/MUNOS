import { describe, expect, it } from "vitest";
import {
  conferenceStatus,
  daysUntil,
  deriveConference,
  conferenceDateRange,
  formatFee,
  formatLocation,
  difficultyLabel,
  conferenceShareUrl,
} from "@/lib/conference";

const day = 86_400_000;

function conf(overrides: Partial<Parameters<typeof conferenceStatus>[0]> = {}) {
  const now = new Date("2026-01-15T12:00:00Z");
  return {
    startDate: new Date(now.getTime() + 30 * day),
    endDate: new Date(now.getTime() + 34 * day),
    registrationOpen: true,
    registrationDeadline: new Date(now.getTime() + 20 * day),
    ...overrides,
  };
}

describe("conferenceStatus", () => {
  const now = new Date("2026-01-15T12:00:00Z");

  it("marks past conferences when end date passed", () => {
    expect(conferenceStatus(conf({ endDate: new Date(now.getTime() - day) }), now)).toBe("past");
  });

  it("marks open when deadline passed but conference upcoming", () => {
    expect(conferenceStatus(conf({ registrationDeadline: new Date(now.getTime() - day) }), now)).toBe("open");
  });

  it("marks closing when deadline within 7 days", () => {
    expect(conferenceStatus(conf({ registrationDeadline: new Date(now.getTime() + 3 * day) }), now)).toBe("closing");
  });

  it("marks upcoming when no deadline or deadline far away", () => {
    expect(conferenceStatus(conf({ registrationDeadline: new Date(now.getTime() + 30 * day) }), now)).toBe("upcoming");
    expect(conferenceStatus(conf({ registrationDeadline: null }), now)).toBe("upcoming");
  });

  it("marks ongoing when the conference already started", () => {
    expect(conferenceStatus(conf({ startDate: new Date(now.getTime() - day) }), now)).toBe("ongoing");
  });

  it("marks a conference starting later today as upcoming, not ongoing", () => {
    const laterToday = new Date(now.getTime() + 60 * 60 * 1000);
    expect(conferenceStatus(conf({ startDate: laterToday }), now)).toBe("upcoming");
  });

  it("marks ongoing as soon as the start instant passes", () => {
    const justStarted = new Date(now.getTime() - 1000);
    expect(conferenceStatus(conf({ startDate: justStarted }), now)).toBe("ongoing");
  });
});

describe("daysUntil", () => {
  it("returns null for missing date", () => {
    expect(daysUntil(null)).toBeNull();
    expect(daysUntil(undefined)).toBeNull();
  });

  it("ceils the difference and clamps at 0", () => {
    const now = new Date("2026-01-15T12:00:00Z");
    expect(daysUntil(new Date(now.getTime() + 2.5 * day), now)).toBe(3);
    expect(daysUntil(new Date(now.getTime() - 2.5 * day), now)).toBe(0);
  });
});

describe("deriveConference", () => {
  const now = new Date("2026-01-15T12:00:00Z");

  it("derives status, labels, and registration gating", () => {
    const derived = deriveConference(
      {
        startDate: new Date(now.getTime() + 30 * day),
        endDate: new Date(now.getTime() + 34 * day),
        registrationOpen: true,
        registrationDeadline: new Date(now.getTime() - day),
        fee: 125,
        currency: "USD",
        venue: { city: "Boston", state: "MA", country: "USA" },
      },
      now,
    );

    expect(derived.status).toBe("open");
    expect(derived.statusLabel).toBe("Registration open");
    expect(derived.deadlinePassed).toBe(true);
    expect(derived.registrationOpen).toBe(false);
    expect(derived.feeLabel).toBe("$125");
    expect(derived.locationLabel).toBe("Boston, MA, USA");
  });
});

describe("conferenceDateRange", () => {
  it("collapses same-day ranges", () => {
    const d = new Date("2026-01-15T12:00:00Z");
    expect(conferenceDateRange(d, d)).toBe("Jan 15, 2026");
  });
});

describe("formatFee", () => {
  it("returns Free for zero or negative fees", () => {
    expect(formatFee(0, "USD")).toBe("Free");
    expect(formatFee(-5, "USD")).toBe("Free");
  });

  it("maps known currency symbols", () => {
    expect(formatFee(125, "USD")).toBe("$125");
    expect(formatFee(145, "EUR")).toBe("€145");
    expect(formatFee(55, "AED")).toBe("AED 55");
  });

  it("falls back to the currency code", () => {
    expect(formatFee(50, "XXX")).toBe("XXX 50");
  });
});

describe("formatLocation", () => {
  it("joins city, state, country", () => {
    expect(formatLocation({ city: "Geneva", state: null, country: "Switzerland" })).toBe("Geneva, Switzerland");
  });

  it("falls back to city then TBA", () => {
    expect(formatLocation(null, "Paris")).toBe("Paris");
    expect(formatLocation(null, null)).toBe("TBA");
  });
});

describe("difficultyLabel", () => {
  it("maps known levels", () => {
    expect(difficultyLabel("BEGINNER")).toBe("Beginner");
    expect(difficultyLabel("EXPERT")).toBe("Expert");
  });
});

describe("conferenceShareUrl", () => {
  it("strips trailing slashes from base", () => {
    expect(conferenceShareUrl("https://munos.app/", "hmun-2027")).toBe("https://munos.app/conference/hmun-2027");
  });
});
