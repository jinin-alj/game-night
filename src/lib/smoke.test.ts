import { describe, expect, it } from "vitest";

// Keeps the test step real until the first real tests arrive in later milestones.
describe("test setup", () => {
  it("runs a basic assertion", () => {
    expect(1 + 1).toBe(2);
  });
});
