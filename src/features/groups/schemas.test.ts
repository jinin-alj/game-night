import { describe, expect, it } from "vitest";
import { groupNameSchema, idSchema, inviteCodeSchema } from "./schemas";

describe("groupNameSchema", () => {
  it("trims the name", () => {
    expect(groupNameSchema.parse("  Board game club ")).toBe("Board game club");
  });

  it("rejects a blank or too long name", () => {
    expect(groupNameSchema.safeParse("   ").success).toBe(false);
    expect(groupNameSchema.safeParse("a".repeat(61)).success).toBe(false);
  });
});

describe("inviteCodeSchema", () => {
  it("accepts a code typed in lowercase with spaces around it", () => {
    expect(inviteCodeSchema.parse(" abcdefgh23 ")).toBe("ABCDEFGH23");
  });

  it("rejects codes with the wrong length or letters that are never used", () => {
    expect(inviteCodeSchema.safeParse("ABCDEFGH2").success).toBe(false);
    expect(inviteCodeSchema.safeParse("ABCDEFGH234").success).toBe(false);
    expect(inviteCodeSchema.safeParse("ABCDEFGHI0").success).toBe(false);
  });

  it("explains what a code looks like", () => {
    const result = inviteCodeSchema.safeParse("nope");
    expect(result.error?.issues[0].message).toBe(
      "Invite codes are 10 letters and numbers.",
    );
  });
});

describe("idSchema", () => {
  it("accepts ids and rejects other text", () => {
    expect(
      idSchema.safeParse("7d4b0c1e-2f3a-4b5c-8d6e-9f0a1b2c3d4e").success,
    ).toBe(true);
    expect(idSchema.safeParse("abc").success).toBe(false);
  });
});
