import type { Metadata } from "next";
import { AddGameForm } from "@/features/games/components/AddGameForm";
import { GameCard } from "@/features/games/components/GameCard";
import { listGames } from "@/features/games/queries";
import { listGroupMembers } from "@/features/groups/queries";
import { getSessionContext } from "@/features/groups/session";

export const metadata: Metadata = {
  title: "Shelf · Game Night Planner",
};

/** The shelf: every game the active group owns, with add, edit and delete. */
export default async function ShelfPage() {
  const { supabase, activeGroup } = await getSessionContext();
  if (!activeGroup) {
    return <p>You aren’t in a group yet, so there is no shelf to show.</p>;
  }

  const games = await listGames(supabase, activeGroup.id);
  const members = await listGroupMembers(supabase, activeGroup.id);
  if (games === null || members === null) {
    return (
      <p role="alert" className="text-canyon-dark">
        Couldn’t load your shelf. Refresh the page to try again.
      </p>
    );
  }

  const memberNames: Record<string, string> = {};
  for (const member of members) {
    memberNames[member.id] = member.displayName;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Your shelf</h1>
        <p className="mt-1">
          {games.length === 1 ? "1 game" : `${games.length} games`}
        </p>
      </div>

      <AddGameForm members={members} />

      {games.length === 0 ? (
        <p>No games yet. Add your first one above.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              ownerName={
                game.copyOwnerId
                  ? (memberNames[game.copyOwnerId] ?? null)
                  : null
              }
              members={members}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
