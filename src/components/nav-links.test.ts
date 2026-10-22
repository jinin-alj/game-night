import { describe, expect, it } from "vitest";
import { isActiveLink } from "./nav-links";

describe("isActiveLink", () => {
  it("marks Nights active on /app and on a night's page", () => {
    expect(isActiveLink("/app", "/app")).toBe(true);
    expect(isActiveLink("/app/nights/123", "/app")).toBe(true);
  });

  it("does not mark Nights active on the shelf", () => {
    expect(isActiveLink("/app/games", "/app")).toBe(false);
  });

  it("marks Shelf active on /app/games and below", () => {
    expect(isActiveLink("/app/games", "/app/games")).toBe(true);
    expect(isActiveLink("/app/games/abc", "/app/games")).toBe(true);
  });

  it("does not mark Shelf active on /app", () => {
    expect(isActiveLink("/app", "/app/games")).toBe(false);
  });

  it("marks Group active on /app/group only", () => {
    expect(isActiveLink("/app/group", "/app/group")).toBe(true);
    expect(isActiveLink("/app", "/app/group")).toBe(false);
    expect(isActiveLink("/app/group", "/app")).toBe(false);
  });
});
