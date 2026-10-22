import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getLastPlayedDates,
  type NightDate,
  type PlayRecord,
} from "./last-played";

export type NightPlay = {
  id: string;
  gameId: string | null;
  gameTitle: string;
};

/** Returns the games logged as played on a night, or null on error. */
export async function listPlaysForNight(
  supabase: SupabaseClient,
  nightId: string,
): Promise<NightPlay[] | null> {
  const { data, error } = await supabase
    .from("plays")
    .select("id, game_id, game_title")
    .eq("night_id", nightId)
    .order("created_at");

  if (error) {
    console.error("Could not load the plays:", error.code);
    return null;
  }

  const plays: NightPlay[] = [];
  for (const row of data) {
    plays.push({ id: row.id, gameId: row.game_id, gameTitle: row.game_title });
  }
  return plays;
}

/** Returns, for each of a group's games, the date it was last played, or null on error. */
export async function getGroupLastPlayedDates(
  supabase: SupabaseClient,
  groupId: string,
): Promise<Record<string, string> | null> {
  const { data: playRows, error: playsError } = await supabase
    .from("plays")
    .select("game_id, night_id")
    .eq("group_id", groupId);
  if (playsError) {
    console.error("Could not load the group's plays:", playsError.code);
    return null;
  }

  const { data: nightRows, error: nightsError } = await supabase
    .from("game_nights")
    .select("id, night_date")
    .eq("group_id", groupId);
  if (nightsError) {
    console.error("Could not load the group's nights:", nightsError.code);
    return null;
  }

  const plays: PlayRecord[] = [];
  for (const row of playRows) {
    plays.push({ gameId: row.game_id, nightId: row.night_id });
  }
  const nights: NightDate[] = [];
  for (const row of nightRows) {
    nights.push({ id: row.id, nightDate: row.night_date });
  }
  return getLastPlayedDates(plays, nights);
}
