import type { GroupMember } from "@/features/groups/queries";
import { createGame } from "../actions";
import { newGameValues } from "../form-state";
import { GameForm } from "./GameForm";

type AddGameFormProps = {
  members: GroupMember[];
};

/** The "Add a game" panel at the top of the shelf. */
export function AddGameForm({ members }: AddGameFormProps) {
  return (
    <section
      aria-labelledby="add-game-heading"
      className="rounded-2xl bg-paper-light p-5"
    >
      <h2 id="add-game-heading" className="mb-4 text-xl font-bold">
        Add a game
      </h2>
      <GameForm
        formId="add-game"
        action={createGame}
        initialValues={newGameValues}
        members={members}
        submitLabel="Add game"
      />
    </section>
  );
}
