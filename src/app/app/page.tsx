import { redirect } from "next/navigation";
import { JoinPrompt } from "@/features/groups/components/JoinPrompt";
import { parseJoinCode } from "@/features/groups/invite-link";
import { getActiveGroup, previewGroup } from "@/features/groups/queries";
import { CreateNightForm } from "@/features/nights/components/CreateNightForm";
import { NightList } from "@/features/nights/components/NightList";
import { listNights } from "@/features/nights/queries";
import { getNextFriday, getTodayInMadrid } from "@/lib/dates";
import { createClient, getCurrentUserId } from "@/lib/supabase/server";

/** The main page for logged-in users: create a game night and see the group's nights. */
export default async function AppHomePage({ searchParams }: PageProps<"/app">) {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) {
    redirect("/login");
  }

  // An invite link (/app?join=CODE) shows a join confirmation above the nights.
  const { join } = await searchParams;
  const hasJoinParam = join !== undefined;
  const joinCode = parseJoinCode(join);
  const preview = joinCode ? await previewGroup(supabase, joinCode) : null;
  const joinPrompt = hasJoinParam ? (
    <JoinPrompt inviteCode={joinCode} preview={preview} />
  ) : null;

  const activeGroup = await getActiveGroup(supabase, userId);
  if (!activeGroup) {
    return (
      <div className="flex flex-col gap-8">
        {joinPrompt}
        <p>You aren’t in a group yet, so there are no game nights to show.</p>
      </div>
    );
  }

  const nights = await listNights(supabase, activeGroup.id);
  const today = getTodayInMadrid();

  return (
    <div className="flex flex-col gap-8">
      {joinPrompt}
      <h1 className="text-2xl font-bold">Your game nights</h1>
      <CreateNightForm defaultNightDate={getNextFriday(today)} />
      {nights === null ? (
        <p role="alert" className="text-canyon-dark">
          Couldn’t load your game nights. Refresh the page to try again.
        </p>
      ) : (
        <NightList nights={nights} today={today} />
      )}
    </div>
  );
}
