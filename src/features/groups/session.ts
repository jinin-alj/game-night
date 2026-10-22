import { redirect } from "next/navigation";
import { createClient, getCurrentUserId } from "@/lib/supabase/server";
import { getActiveGroup } from "./queries";

/** Returns a Supabase client, the user's id and active group; logged-out users go to /login. */
export async function getSessionContext() {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) {
    redirect("/login");
  }

  const activeGroup = await getActiveGroup(supabase, userId);
  return { supabase, userId, activeGroup };
}
