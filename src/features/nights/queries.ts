import type { SupabaseClient } from "@supabase/supabase-js";
import type { NightSummary } from "./types";

/** Returns a group's nights sorted by date, or null if they can't be read. */
export async function listNights(
  supabase: SupabaseClient,
  groupId: string,
): Promise<NightSummary[] | null> {
  const { data, error } = await supabase
    .from("game_nights")
    .select("id, name, night_date, available_minutes")
    .eq("group_id", groupId)
    .order("night_date")
    .order("created_at");

  if (error) {
    console.error("Could not load the nights:", error.code);
    return null;
  }

  const nights: NightSummary[] = [];
  for (const row of data) {
    nights.push({
      id: row.id,
      name: row.name,
      nightDate: row.night_date,
      availableMinutes: row.available_minutes,
    });
  }
  return nights;
}
