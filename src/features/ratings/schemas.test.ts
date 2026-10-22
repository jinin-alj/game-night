import { describe, expect, it } from "vitest";
import { scoreSchema } from "./schemas";

describe("scoreSchema", () => {
  it("accepts whole numbers from 1 to 10 sent as text", () => {
    expect(scoreSchema.parse("1")).toBe(1);
    expect(scoreSchema.parse("10")).toBe(10);
  });

  it("rejects anything else with one clear message", () => {
    for (const value of ["", "0", "11", "7.5", "abc"]) {
      const result = scoreSchema.safeParse(value);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        "Pick a rating from 1 to 10.",
      );
    }
  });
});
