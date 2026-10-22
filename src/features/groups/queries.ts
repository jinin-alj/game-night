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

/** Returns every group the user belongs to, sorted by name (row security hides the rest). */
export async function listMyGroups(
  supabase: SupabaseClient,
): Promise<ActiveGroup[]> {
  const { data, error } = await supabase
    .from("groups")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Could not load your groups:", error.code);
    return [];
  }

  const groups: ActiveGroup[] = [];
  for (const row of data) {
    groups.push({ id: row.id, name: row.name });
  }
  return groups;
}

export type GroupDetails = {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
};

/** Returns a group's name, invite code and owner, or null if it can't be read. */
export async function getGroupDetails(
  supabase: SupabaseClient,
  groupId: string,
): Promise<GroupDetails | null> {
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, invite_code, owner_id")
    .eq("id", groupId)
    .maybeSingle();

  if (error) {
    console.error("Could not load the group:", error.code);
    return null;
  }
  if (!data) {
    return null;
  }
  return {
    id: data.id,
    name: data.name,
    inviteCode: data.invite_code,
    ownerId: data.owner_id,
  };
}

export type GroupPreview = {
  name: string;
  memberCount: number;
  isMember: boolean;
};

/** Looks up the group behind an invite code, or returns null if the code doesn't work. */
export async function previewGroup(
  supabase: SupabaseClient,
  inviteCode: string,
): Promise<GroupPreview | null> {
  const { data, error } = await supabase.rpc("preview_group", {
    code: inviteCode,
  });

  if (error) {
    console.error("Could not preview the group:", error.message);
    return null;
  }
  if (!data || data.length === 0) {
    return null;
  }
  return {
    name: data[0].name,
    memberCount: data[0].member_count,
    isMember: data[0].is_member,
  };
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
