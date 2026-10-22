import { describe, expect, it } from "vitest";
import {
  attendeeIdsSchema,
  createNightSchema,
  guestNameSchema,
  nightIdSchema,
} from "./schemas";

describe("createNightSchema", () => {
  it("accepts a valid night and trims the name", () => {
    const result = createNightSchema.safeParse({
      name: "  QA-7F3K2A grading bot test ",
      nightDate: "2026-10-23",
      availableMinutes: "180",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      name: "QA-7F3K2A grading bot test",
      nightDate: "2026-10-23",
      availableMinutes: 180,
    });
  });

  it("rejects an empty or blank name", () => {
    const result = createNightSchema.safeParse({
      name: "   ",
      nightDate: "2026-10-23",
      availableMinutes: "180",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Give the night a name.");
  });

  it("rejects a name longer than 80 characters", () => {
    const result = createNightSchema.safeParse({
      name: "a".repeat(81),
      nightDate: "2026-10-23",
      availableMinutes: "180",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a date that doesn't exist", () => {
    const result = createNightSchema.safeParse({
      name: "Friday games",
      nightDate: "2026-02-30",
      availableMinutes: "180",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Pick a valid date.");
  });

  it("accepts the shortest and longest allowed times", () => {
    for (const minutes of ["30", "720"]) {
      const result = createNightSchema.safeParse({
        name: "Friday games",
        nightDate: "2026-10-23",
        availableMinutes: minutes,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects times outside 30 minutes to 12 hours or off the half hour", () => {
    for (const minutes of ["0", "750", "45", "abc"]) {
      const result = createNightSchema.safeParse({
        name: "Friday games",
        nightDate: "2026-10-23",
        availableMinutes: minutes,
      });
      expect(result.success).toBe(false);
    }
  });
});

describe("nightIdSchema", () => {
  it("accepts ids and rejects other text", () => {
    expect(
      nightIdSchema.safeParse("7d4b0c1e-2f3a-4b5c-8d6e-9f0a1b2c3d4e").success,
    ).toBe(true);
    expect(nightIdSchema.safeParse("not-an-id").success).toBe(false);
  });
});

describe("guestNameSchema", () => {
  it("trims the name", () => {
    expect(guestNameSchema.parse("  Alex ")).toBe("Alex");
  });

  it("rejects a blank or too long name", () => {
    expect(guestNameSchema.safeParse("  ").error?.issues[0].message).toBe(
      "Enter the guest’s name.",
    );
    expect(guestNameSchema.safeParse("a".repeat(41)).success).toBe(false);
  });
});

describe("attendeeIdsSchema", () => {
  it("accepts an empty list or a list of ids", () => {
    expect(attendeeIdsSchema.safeParse([]).success).toBe(true);
    expect(
      attendeeIdsSchema.safeParse(["7d4b0c1e-2f3a-4b5c-8d6e-9f0a1b2c3d4e"])
        .success,
    ).toBe(true);
  });

  it("rejects anything that isn't an id", () => {
    expect(attendeeIdsSchema.safeParse(["sam"]).success).toBe(false);
  });
});
