import type { SupabaseClient } from "@supabase/supabase-js";

export type ActiveGroup = {
  id: string;
  name: string;
};

/** Returns the user's active group, or null if none is set or it can't be read. */
export async function getActiveGroup(
  supabase: SupabaseClient,
  userId: string,
): Promise<ActiveGroup | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("active_group:groups(id, name)")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Could not load the active group:", error.message);
    return null;
  }
  if (!data || !data.active_group) {
    return null;
  }
  // TODO: generate Supabase types; until then the client wrongly guesses an array for this one-to-one link.
  return data.active_group as unknown as ActiveGroup;
}
