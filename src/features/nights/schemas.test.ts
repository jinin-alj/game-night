import { describe, expect, it } from "vitest";
import { createNightSchema } from "./schemas";

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
