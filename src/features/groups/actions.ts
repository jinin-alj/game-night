"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type ActionState, getFormText } from "@/lib/forms";
import { toFriendlyGroupError } from "./errors";
import { addJoinCode } from "./invite-link";
import { groupNameSchema, idSchema, inviteCodeSchema } from "./schemas";
import { getSessionContext } from "./session";

const refreshError = "Something went wrong. Refresh the page and try again.";

/** Makes another of the user's groups the active one. */
export async function switchGroup(
  previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, userId } = await getSessionContext();
  const groupId = idSchema.safeParse(getFormText(formData, "groupId"));
  if (!groupId.success) {
    return { error: refreshError };
  }

  // Row security only lets the active group be one the user belongs to.
  const { error } = await supabase
    .from("profiles")
    .update({ active_group_id: groupId.data })
    .eq("id", userId);
  if (error) {
    console.error("Switching group failed:", error.code);
    return { error: "Couldn’t switch to that group." };
  }

  revalidatePath("/app", "layout");
  return {};
}

/** Creates a new group owned by the user and makes it active. */
export async function createGroup(
  previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await getSessionContext();
  const groupName = groupNameSchema.safeParse(
    getFormText(formData, "groupName"),
  );
  if (!groupName.success) {
    return { error: groupName.error.issues[0].message };
  }

  const { error } = await supabase.rpc("create_group", {
    group_name: groupName.data,
  });
  if (error) {
    console.error("Creating a group failed:", error.message);
    return { error: toFriendlyGroupError(error.message) };
  }

  revalidatePath("/app", "layout");
  return { success: `Created ${groupName.data}. It’s now your active group.` };
}

/** Checks a typed invite code and opens the join confirmation for it. */
export async function goToJoinPrompt(
  previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await getSessionContext();
  const inviteCode = inviteCodeSchema.safeParse(
    getFormText(formData, "inviteCode"),
  );
  if (!inviteCode.success) {
    return { error: inviteCode.error.issues[0].message };
  }

  redirect(addJoinCode("/app", inviteCode.data));
}

/** Joins the group behind an invite code and makes it active. */
export async function joinGroup(
  previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await getSessionContext();
  const inviteCode = inviteCodeSchema.safeParse(
    getFormText(formData, "inviteCode"),
  );
  if (!inviteCode.success) {
    return { error: toFriendlyGroupError("invalid_code") };
  }

  const { error } = await supabase.rpc("join_group", { code: inviteCode.data });
  if (error) {
    console.error("Joining a group failed:", error.message);
    return { error: toFriendlyGroupError(error.message) };
  }

  revalidatePath("/app", "layout");
  redirect("/app");
}

/** Leaves a group, or deletes it when the user is its only member. */
export async function leaveGroup(
  previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await getSessionContext();
  const groupId = idSchema.safeParse(getFormText(formData, "groupId"));
  if (!groupId.success) {
    return { error: refreshError };
  }

  const { error } = await supabase.rpc("leave_group", {
    target_group_id: groupId.data,
  });
  if (error) {
    console.error("Leaving a group failed:", error.message);
    return { error: toFriendlyGroupError(error.message) };
  }

  revalidatePath("/app", "layout");
  redirect("/app");
}

/** Removes a member from the group (owner only). */
export async function removeMember(
  previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await getSessionContext();
  const groupId = idSchema.safeParse(getFormText(formData, "groupId"));
  const memberId = idSchema.safeParse(getFormText(formData, "memberId"));
  if (!groupId.success || !memberId.success) {
    return { error: refreshError };
  }

  const { error } = await supabase.rpc("remove_member", {
    target_group_id: groupId.data,
    target_user_id: memberId.data,
  });
  if (error) {
    console.error("Removing a member failed:", error.message);
    return { error: toFriendlyGroupError(error.message) };
  }

  revalidatePath("/app", "layout");
  return {};
}

/** Hands the group over to another member (owner only). */
export async function transferOwnership(
  previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await getSessionContext();
  const groupId = idSchema.safeParse(getFormText(formData, "groupId"));
  const memberId = idSchema.safeParse(getFormText(formData, "memberId"));
  if (!groupId.success || !memberId.success) {
    return { error: refreshError };
  }

  const { error } = await supabase.rpc("transfer_ownership", {
    target_group_id: groupId.data,
    new_owner_id: memberId.data,
  });
  if (error) {
    console.error("Handing over ownership failed:", error.message);
    return { error: toFriendlyGroupError(error.message) };
  }

  revalidatePath("/app", "layout");
  return {};
}

/** Replaces the group's invite code so old links stop working (owner only). */
export async function resetInviteCode(
  previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await getSessionContext();
  const groupId = idSchema.safeParse(getFormText(formData, "groupId"));
  if (!groupId.success) {
    return { error: refreshError };
  }

  const { error } = await supabase.rpc("reset_invite_code", {
    target_group_id: groupId.data,
  });
  if (error) {
    console.error("Resetting the invite code failed:", error.message);
    return { error: toFriendlyGroupError(error.message) };
  }

  revalidatePath("/app", "layout");
  return { success: "New code ready. Old links no longer work." };
}

/** Renames the group (owner only). */
export async function renameGroup(
  previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await getSessionContext();
  const groupId = idSchema.safeParse(getFormText(formData, "groupId"));
  if (!groupId.success) {
    return { error: refreshError };
  }
  const groupName = groupNameSchema.safeParse(
    getFormText(formData, "groupName"),
  );
  if (!groupName.success) {
    return { error: groupName.error.issues[0].message };
  }

  const { error } = await supabase.rpc("rename_group", {
    target_group_id: groupId.data,
    group_name: groupName.data,
  });
  if (error) {
    console.error("Renaming the group failed:", error.message);
    return { error: toFriendlyGroupError(error.message) };
  }

  revalidatePath("/app", "layout");
  return { success: "Group renamed." };
}
