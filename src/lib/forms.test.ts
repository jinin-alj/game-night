import { describe, expect, it } from "vitest";
import { getFormText } from "./forms";

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
