"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addJoinCode, parseJoinCode } from "@/features/groups/invite-link";
import { getSessionContext } from "@/features/groups/session";
import {
  type ActionState,
  getFirstFieldErrors,
  getFormText,
} from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { toFriendlyAuthError } from "./errors";
import type { AuthFormState } from "./form-state";
import { displayNameSchema, logInSchema, signUpSchema } from "./schemas";

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

  // An invite link survives sign-up and log-in, so the join prompt opens next.
  redirect(addJoinCode("/app", parseJoinCode(getFormText(formData, "join"))));
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

  // An invite link survives sign-up and log-in, so the join prompt opens next.
  redirect(addJoinCode("/app", parseJoinCode(getFormText(formData, "join"))));
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

/** Changes the name other members see. */
export async function updateDisplayName(
  previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, userId } = await getSessionContext();
  const displayName = displayNameSchema.safeParse(
    getFormText(formData, "displayName"),
  );
  if (!displayName.success) {
    return { error: displayName.error.issues[0].message };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName.data })
    .eq("id", userId);
  if (error) {
    console.error("Updating the name failed:", error.code);
    return { error: "Couldn’t save your name. Please try again." };
  }

  revalidatePath("/app", "layout");
  return { success: "Name saved." };
}

/** Deletes the user's account and everything only they own, then signs them out. */
export async function deleteAccount(): Promise<ActionState> {
  const { supabase } = await getSessionContext();

  const { error } = await supabase.rpc("delete_my_account");
  if (error) {
    console.error("Deleting the account failed:", error.message);
    if (error.message === "owner_must_hand_over") {
      return {
        error:
          "You own a group that has other members. Hand it over to one of them first.",
      };
    }
    return { error: "Couldn’t delete your account. Please try again." };
  }

  // The account is gone, so this only clears the session cookies in this browser.
  await supabase.auth.signOut();
  redirect("/");
}
