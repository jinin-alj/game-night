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

export type GroupMember = {
  id: string;
  displayName: string;
};

/** Returns the members of a group sorted by name, or null if they can't be read. */
export async function listGroupMembers(
  supabase: SupabaseClient,
  groupId: string,
): Promise<GroupMember[] | null> {
  // Members and profiles both point at auth.users, not at each other, so this takes two reads.
  const { data: memberRows, error: membersError } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId);
  if (membersError) {
    console.error("Could not load the group members:", membersError.code);
    return null;
  }

  const userIds: string[] = [];
  for (const row of memberRows) {
    userIds.push(row.user_id);
  }

  const { data: profileRows, error: profilesError } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", userIds)
    .order("display_name");
  if (profilesError) {
    console.error("Could not load the member profiles:", profilesError.code);
    return null;
  }

  const members: GroupMember[] = [];
  for (const row of profileRows) {
    members.push({ id: row.id, displayName: row.display_name });
  }
  return members;
}
