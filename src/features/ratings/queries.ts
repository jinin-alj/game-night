import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlannerRating } from "@/lib/planner/planner";
import {
  findGamesToRate,
  type GameToRate,
  type PlayedGame,
} from "./games-to-rate";

/** Returns every member's ratings in a group, for the planner, or null on error. */
export async function listGroupRatings(
  supabase: SupabaseClient,
  groupId: string,
): Promise<PlannerRating[] | null> {
  const { data, error } = await supabase
    .from("ratings")
    .select("user_id, game_id, score")
    .eq("group_id", groupId);

  if (error) {
    console.error("Could not load the ratings:", error.code);
    return null;
  }

  const ratings: PlannerRating[] = [];
  for (const row of data) {
    ratings.push({
      userId: row.user_id,
      gameId: row.game_id,
      score: row.score,
    });
  }
  return ratings;
}

/** Returns the user's own ratings in a group as game id → score, or null on error. */
export async function listMyRatings(
  supabase: SupabaseClient,
  groupId: string,
  userId: string,
): Promise<Record<string, number> | null> {
  const { data, error } = await supabase
    .from("ratings")
    .select("game_id, score")
    .eq("group_id", groupId)
    .eq("user_id", userId);

  if (error) {
    console.error("Could not load your ratings:", error.code);
    return null;
  }

  const myRatings: Record<string, number> = {};
  for (const row of data) {
    myRatings[row.game_id] = row.score;
  }
  return myRatings;
}

/** Returns the games played on nights the user attended that they haven't rated yet. */
export async function listGamesToRate(
  supabase: SupabaseClient,
  groupId: string,
  userId: string,
): Promise<GameToRate[]> {
  const { data: attendedRows, error: attendedError } = await supabase
    .from("night_attendees")
    .select("night_id")
    .eq("group_id", groupId)
    .eq("user_id", userId);
  if (attendedError) {
    console.error("Could not load the attended nights:", attendedError.code);
    return [];
  }

  const nightIds: string[] = [];
  for (const row of attendedRows) {
    nightIds.push(row.night_id);
  }
  if (nightIds.length === 0) {
    return [];
  }

  const { data: playRows, error: playsError } = await supabase
    .from("plays")
    .select("game_id, game_title")
    .in("night_id", nightIds);
  if (playsError) {
    console.error("Could not load the played games:", playsError.code);
    return [];
  }

  const myRatings = await listMyRatings(supabase, groupId, userId);
  if (!myRatings) {
    return [];
  }

  const plays: PlayedGame[] = [];
  for (const row of playRows) {
    plays.push({ gameId: row.game_id, gameTitle: row.game_title });
  }
  return findGamesToRate(plays, Object.keys(myRatings));
}
