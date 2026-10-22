"use server";

import { redirect } from "next/navigation";
import type { ZodError } from "zod";
import { getFormText } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { toFriendlyAuthError } from "./errors";
import type { AuthFormState } from "./form-state";
import { logInSchema, signUpSchema } from "./schemas";

/** Creates an account (the database also creates the personal group) and opens /app. */
export async function signUp(
  previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const values = {
    email: getFormText(formData, "email"),
    displayName: getFormText(formData, "displayName"),
  };
  const parsed = signUpSchema.safeParse({
    ...values,
    password: getFormText(formData, "password"),
  });
  if (!parsed.success) {
    return { values, fieldErrors: getFirstFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { display_name: parsed.data.displayName } },
  });
  if (error) {
    console.error("Sign-up failed:", error.name, error.status, error.code);
    return {
      values,
      fieldErrors: {},
      formError: toFriendlyAuthError(error.code),
    };
  }

  redirect("/app");
}

/** Logs in with email and password and opens /app. */
export async function logIn(
  previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const values = { email: getFormText(formData, "email"), displayName: "" };
  const parsed = logInSchema.safeParse({
    email: values.email,
    password: getFormText(formData, "password"),
  });
  if (!parsed.success) {
    return { values, fieldErrors: getFirstFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    console.error("Log-in failed:", error.name, error.status, error.code);
    return {
      values,
      fieldErrors: {},
      formError: toFriendlyAuthError(error.code),
    };
  }

  redirect("/app");
}

/** Logs the user out and returns them to the landing page. */
export async function logOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Log-out failed:", error.code);
  }

  redirect("/");
}

function getFirstFieldErrors(error: ZodError): AuthFormState["fieldErrors"] {
  const fieldErrors: AuthFormState["fieldErrors"] = {};
  for (const issue of error.issues) {
    const fieldName = issue.path[0];
    if (
      fieldName === "email" ||
      fieldName === "password" ||
      fieldName === "displayName"
    ) {
      if (!fieldErrors[fieldName]) {
        fieldErrors[fieldName] = issue.message;
      }
    }
  }
  return fieldErrors;
}
