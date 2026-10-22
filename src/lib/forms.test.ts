import { describe, expect, it } from "vitest";
import { z } from "zod";
import { getFirstFieldErrors, getFormText } from "./forms";

describe("getFirstFieldErrors", () => {
  it("keeps only the first message for each field", () => {
    const schema = z.object({
      email: z
        .string()
        .min(1, { error: "Required." })
        .max(0, { error: "Too long." }),
      name: z.string().min(3, { error: "Too short." }),
    });
    const result = schema.safeParse({ email: "x", name: "a" });

    expect(result.success).toBe(false);
    expect(getFirstFieldErrors(result.error!)).toEqual({
      email: "Too long.",
      name: "Too short.",
    });
  });
});

describe("getFormText", () => {
  it("returns the text of a field", () => {
    const formData = new FormData();
    formData.set("email", "sam@example.com");

    expect(getFormText(formData, "email")).toBe("sam@example.com");
  });

  it("returns an empty string when the field is missing", () => {
    expect(getFormText(new FormData(), "email")).toBe("");
  });

  it("returns an empty string when the field is a file", () => {
    const formData = new FormData();
    formData.set("email", new Blob(["x"]));

    expect(getFormText(formData, "email")).toBe("");
  });
});
