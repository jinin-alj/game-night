"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveGroup } from "@/features/groups/queries";
import { getNextFriday, getTodayInMadrid } from "@/lib/dates";
import { getFirstFieldErrors, getFormText } from "@/lib/forms";
import { createClient, getCurrentUserId } from "@/lib/supabase/server";
import type { NightFormState } from "./form-state";
import { DEFAULT_NIGHT_MINUTES } from "./limits";
import { createNightSchema } from "./schemas";

/** Creates a night in the user's active group; the database adds the creator as an attendee. */
export async function createNight(
  previousState: NightFormState,
  formData: FormData,
): Promise<NightFormState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) {
    redirect("/login");
  }

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

  const activeGroup = await getActiveGroup(supabase, userId);
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
