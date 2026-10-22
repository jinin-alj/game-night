/** Reads a text field from submitted form data, or "" if it is missing. */
export function getFormText(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);
  if (typeof value === "string") {
    return value;
  }
  return "";
}
