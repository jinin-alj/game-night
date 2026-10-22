import { describe, expect, it } from "vitest";
import { addJoinCode, parseJoinCode } from "./invite-link";

describe("parseJoinCode", () => {
  it("returns a cleaned code when it looks like an invite code", () => {
    expect(parseJoinCode("abcdefgh23")).toBe("ABCDEFGH23");
  });

  it("returns null for missing or junk values", () => {
    expect(parseJoinCode(null)).toBe(null);
    expect(parseJoinCode(undefined)).toBe(null);
    expect(parseJoinCode("")).toBe(null);
    expect(parseJoinCode("https://evil.example")).toBe(null);
    expect(parseJoinCode(["ABCDEFGH23", "ABCDEFGH24"])).toBe(null);
  });
});

describe("addJoinCode", () => {
  it("adds the code to the path when there is one", () => {
    expect(addJoinCode("/app", "ABCDEFGH23")).toBe("/app?join=ABCDEFGH23");
  });

  it("leaves the path alone without a code", () => {
    expect(addJoinCode("/login", null)).toBe("/login");
  });
});
