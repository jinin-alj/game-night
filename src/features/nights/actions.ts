"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { idSchema } from "@/features/groups/schemas";
import { getSessionContext } from "@/features/groups/session";
import { getNextFriday, getTodayInMadrid } from "@/lib/dates";
import {
  type ActionState,
  getFirstFieldErrors,
  getFormText,
} from "@/lib/forms";
import type { NightFormState } from "./form-state";
import { DEFAULT_NIGHT_MINUTES } from "./limits";
import { getNight, listAttendeeIds } from "./queries";
import {
  attendeeIdsSchema,
  createNightSchema,
  guestNameSchema,
  nightIdSchema,
} from "./schemas";

const MAX_GUESTS_PER_NIGHT = 20;
const notFoundError =
  "Couldn’t find that night. Refresh the page and try again.";

/** Creates a night in the user's active group; the database adds the creator as an attendee. */
export async function createNight(
  previousState: NightFormState,
  formData: FormData,
): Promise<NightFormState> {
  const { supabase, activeGroup } = await getSessionContext();

  const defaultValues = {
    name: "",
    nightDate: getNextFriday(getTodayInMadrid()),
    availableMinutes: String(DEFAULT_NIGHT_MINUTES),
  };
  // Empty date or hours fall back to the defaults, so typing only a name always works.
  const values = {
    name: getFormText(formData, "name"),
    nightDate: getFormText(formData, "nightDate") || defaultValues.nightDate,
    availableMinutes:
      getFormText(formData, "availableMinutes") ||
      defaultValues.availableMinutes,
  };

  const parsed = createNightSchema.safeParse(values);
  if (!parsed.success) {
    return { values, fieldErrors: getFirstFieldErrors(parsed.error) };
  }

  if (!activeGroup) {
    return {
      values,
      fieldErrors: {},
      formError: "You need a group before you can create a night.",
    };
  }

  const { error } = await supabase.from("game_nights").insert({
    group_id: activeGroup.id,
    name: parsed.data.name,
    night_date: parsed.data.nightDate,
    available_minutes: parsed.data.availableMinutes,
  });
  if (error) {
    console.error("Creating a night failed:", error.code);
    return {
      values,
      fieldErrors: {},
      formError: "Couldn't save the night. Please try again.",
    };
  }

  revalidatePath("/app");
  return { values: defaultValues, fieldErrors: {} };
}

/** Saves a night's new name, date and hours. */
export async function updateNight(
  previousState: NightFormState,
  formData: FormData,
): Promise<NightFormState> {
  const { supabase } = await getSessionContext();
  const values = {
    name: getFormText(formData, "name"),
    nightDate: getFormText(formData, "nightDate"),
    availableMinutes: getFormText(formData, "availableMinutes"),
  };
  const nightId = nightIdSchema.safeParse(getFormText(formData, "nightId"));
  if (!nightId.success) {
    return { values, fieldErrors: {}, formError: notFoundError };
  }

  const parsed = createNightSchema.safeParse(values);
  if (!parsed.success) {
    return { values, fieldErrors: getFirstFieldErrors(parsed.error) };
  }

  const { data, error } = await supabase
    .from("game_nights")
    .update({
      name: parsed.data.name,
      night_date: parsed.data.nightDate,
      available_minutes: parsed.data.availableMinutes,
    })
    .eq("id", nightId.data)
    .select("id");
  if (error) {
    console.error("Updating a night failed:", error.code);
    return {
      values,
      fieldErrors: {},
      formError: "Couldn’t save the night. Please try again.",
    };
  }
  if (data.length === 0) {
    return { values, fieldErrors: {}, formError: notFoundError };
  }

  revalidateNight(nightId.data);
  return { values, fieldErrors: {}, saved: true };
}

/** Deletes a night with its attendees and guests, then goes back to /app. */
export async function deleteNight(
  previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await getSessionContext();
  const nightId = nightIdSchema.safeParse(getFormText(formData, "nightId"));
  if (!nightId.success) {
    return { error: notFoundError };
  }

  const { data, error } = await supabase
    .from("game_nights")
    .delete()
    .eq("id", nightId.data)
    .select("id");
  if (error) {
    console.error("Deleting a night failed:", error.code);
    return { error: "Couldn’t delete the night. Please try again." };
  }
  if (data.length === 0) {
    return { error: notFoundError };
  }

  revalidatePath("/app");
  redirect("/app");
}

/** Saves which members are coming, changing only the ones that were ticked or unticked. */
export async function saveAttendees(
  previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await getSessionContext();
  const nightId = nightIdSchema.safeParse(getFormText(formData, "nightId"));
  const tickedValues: string[] = [];
  for (const value of formData.getAll("attendeeIds")) {
    if (typeof value === "string") {
      tickedValues.push(value);
    }
  }
  const tickedIds = attendeeIdsSchema.safeParse(tickedValues);
  if (!nightId.success || !tickedIds.success) {
    return { error: notFoundError };
  }

  const night = await getNight(supabase, nightId.data);
  const currentIds = await listAttendeeIds(supabase, nightId.data);
  if (!night || !currentIds) {
    return { error: notFoundError };
  }

  const idsToRemove: string[] = [];
  for (const id of currentIds) {
    if (!tickedIds.data.includes(id)) {
      idsToRemove.push(id);
    }
  }
  const rowsToAdd = [];
  for (const id of tickedIds.data) {
    if (!currentIds.includes(id)) {
      rowsToAdd.push({
        night_id: night.id,
        group_id: night.groupId,
        user_id: id,
      });
    }
  }

  if (idsToRemove.length > 0) {
    const { error } = await supabase
      .from("night_attendees")
      .delete()
      .eq("night_id", night.id)
      .in("user_id", idsToRemove);
    if (error) {
      console.error("Removing attendees failed:", error.code);
      return { error: "Couldn’t save who’s coming. Please try again." };
    }
  }
  if (rowsToAdd.length > 0) {
    const { error } = await supabase.from("night_attendees").insert(rowsToAdd);
    if (error) {
      console.error("Adding attendees failed:", error.code);
      return { error: "Couldn’t save who’s coming. Please try again." };
    }
  }

  revalidateNight(night.id);
  return { success: "Saved who’s coming." };
}

/** Adds a guest (a friend without an account) to a night. */
export async function addGuest(
  previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await getSessionContext();
  const nightId = nightIdSchema.safeParse(getFormText(formData, "nightId"));
  if (!nightId.success) {
    return { error: notFoundError };
  }
  const guestName = guestNameSchema.safeParse(
    getFormText(formData, "guestName"),
  );
  if (!guestName.success) {
    return { error: guestName.error.issues[0].message };
  }

  const night = await getNight(supabase, nightId.data);
  if (!night) {
    return { error: notFoundError };
  }

  const { count, error: countError } = await supabase
    .from("night_guests")
    .select("id", { count: "exact", head: true })
    .eq("night_id", night.id);
  if (countError) {
    console.error("Counting guests failed:", countError.code);
    return { error: "Couldn’t add the guest. Please try again." };
  }
  if (count !== null && count >= MAX_GUESTS_PER_NIGHT) {
    return { error: "A night can have up to 20 guests." };
  }

  const { error } = await supabase.from("night_guests").insert({
    night_id: night.id,
    group_id: night.groupId,
    name: guestName.data,
  });
  if (error) {
    console.error("Adding a guest failed:", error.code);
    return { error: "Couldn’t add the guest. Please try again." };
  }

  revalidateNight(night.id);
  return { success: `Added ${guestName.data}.` };
}

/** Removes a guest from a night. */
export async function removeGuest(
  previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await getSessionContext();
  const nightId = nightIdSchema.safeParse(getFormText(formData, "nightId"));
  const guestId = idSchema.safeParse(getFormText(formData, "guestId"));
  if (!nightId.success || !guestId.success) {
    return { error: notFoundError };
  }

  const { data, error } = await supabase
    .from("night_guests")
    .delete()
    .eq("id", guestId.data)
    .eq("night_id", nightId.data)
    .select("id");
  if (error) {
    console.error("Removing a guest failed:", error.code);
    return { error: "Couldn’t remove the guest. Please try again." };
  }
  if (data.length === 0) {
    return { error: "That guest was already removed. Refresh the page." };
  }

  revalidateNight(nightId.data);
  return {};
}

function revalidateNight(nightId: string) {
  revalidatePath(`/app/nights/${nightId}`);
  revalidatePath("/app");
}
