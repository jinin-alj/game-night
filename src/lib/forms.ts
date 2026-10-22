import type { ZodError } from "zod";

/** Reads a text field from submitted form data, or "" if it is missing. */
export function getFormText(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);
  if (typeof value === "string") {
    return value;
  }
  return "";
}

/** Returns the first error message for each field of a failed Zod check. */
export function getFirstFieldErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const fieldName = String(issue.path[0]);
    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = issue.message;
    }
  }
  return fieldErrors;
}
