import type { SupabaseClient } from "@supabase/supabase-js";
import type { Guest, NightDetails, NightSummary } from "./types";

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

/** Returns one night, or null when it doesn't exist or belongs to a group the user isn't in. */
export async function getNight(
  supabase: SupabaseClient,
  nightId: string,
): Promise<NightDetails | null> {
  const { data, error } = await supabase
    .from("game_nights")
    .select("id, group_id, name, night_date, available_minutes")
    .eq("id", nightId)
    .maybeSingle();

  if (error) {
    console.error("Could not load the night:", error.code);
    return null;
  }
  if (!data) {
    return null;
  }
  return {
    id: data.id,
    groupId: data.group_id,
    name: data.name,
    nightDate: data.night_date,
    availableMinutes: data.available_minutes,
  };
}

/** Returns the ids of the members marked as coming to a night, or null on error. */
export async function listAttendeeIds(
  supabase: SupabaseClient,
  nightId: string,
): Promise<string[] | null> {
  const { data, error } = await supabase
    .from("night_attendees")
    .select("user_id")
    .eq("night_id", nightId);

  if (error) {
    console.error("Could not load the attendees:", error.code);
    return null;
  }

  const attendeeIds: string[] = [];
  for (const row of data) {
    attendeeIds.push(row.user_id);
  }
  return attendeeIds;
}

/** Returns a night's guests in the order they were added, or null on error. */
export async function listGuests(
  supabase: SupabaseClient,
  nightId: string,
): Promise<Guest[] | null> {
  const { data, error } = await supabase
    .from("night_guests")
    .select("id, name")
    .eq("night_id", nightId)
    .order("created_at");

  if (error) {
    console.error("Could not load the guests:", error.code);
    return null;
  }

  const guests: Guest[] = [];
  for (const row of data) {
    guests.push({ id: row.id, name: row.name });
  }
  return guests;
}
