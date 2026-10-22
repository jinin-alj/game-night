import { describe, expect, it } from "vitest";
import { logInSchema, signUpSchema } from "./schemas";

describe("signUpSchema", () => {
  it("accepts a valid email, password and name, trimming spaces", () => {
    const result = signUpSchema.safeParse({
      email: "  sam@example.com ",
      password: "secret123",
      displayName: "  Sam  ",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      email: "sam@example.com",
      password: "secret123",
      displayName: "Sam",
    });
  });

  it("allows the name to be left empty", () => {
    const result = signUpSchema.safeParse({
      email: "sam@example.com",
      password: "secret123",
      displayName: "   ",
    });

    expect(result.success).toBe(true);
    expect(result.data?.displayName).toBe("");
  });

  it("rejects a name longer than 40 characters", () => {
    const result = signUpSchema.safeParse({
      email: "sam@example.com",
      password: "secret123",
      displayName: "a".repeat(41),
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = signUpSchema.safeParse({
      email: "not-an-email",
      password: "secret123",
      displayName: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = signUpSchema.safeParse({
      email: "sam@example.com",
      password: "",
      displayName: "",
    });

    expect(result.success).toBe(false);
  });

  it("does not add its own minimum password length", () => {
    const result = signUpSchema.safeParse({
      email: "sam@example.com",
      password: "a",
      displayName: "",
    });

    expect(result.success).toBe(true);
  });
});

describe("logInSchema", () => {
  it("accepts a valid email and password", () => {
    const result = logInSchema.safeParse({
      email: " sam@example.com",
      password: "secret123",
    });

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("sam@example.com");
  });

  it("rejects an empty password", () => {
    const result = logInSchema.safeParse({
      email: "sam@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });
});
