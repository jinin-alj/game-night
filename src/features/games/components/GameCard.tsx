"use client";

import { useActionState, useState } from "react";
import { FormError } from "@/components/FormError";
import {
  dangerButtonClassName,
  secondaryButtonClassName,
} from "@/components/styles";
import type { GroupMember } from "@/features/groups/queries";
import { formatDuration } from "@/lib/dates";
import { deleteGame, updateGame } from "../actions";
import { toGameFormValues } from "../form-state";
import { formatPlayers } from "../format";
import type { Game } from "../types";
import { GameForm } from "./GameForm";

type GameCardProps = {
  game: Game;
  ownerName: string | null;
  members: GroupMember[];
};

/** One game on the shelf, with Edit and Delete happening right on the card. */
export function GameCard({ game, ownerName, members }: GameCardProps) {
  const [mode, setMode] = useState<"view" | "edit" | "confirm-delete">("view");
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteGame,
    {},
  );

  function showView() {
    setMode("view");
  }

  if (mode === "edit") {
    return (
      <li className="rounded-2xl bg-paper-light p-4">
        <h3 className="mb-4 font-bold break-words">Edit {game.title}</h3>
        <GameForm
          formId={`edit-${game.id}`}
          action={updateGame}
          initialValues={toGameFormValues(game)}
          members={members}
          submitLabel="Save"
          gameId={game.id}
          onSaved={showView}
          onCancel={showView}
        />
      </li>
    );
  }

  if (mode === "confirm-delete") {
    return (
      <li className="rounded-2xl bg-paper-light p-4">
        <form action={deleteAction} className="flex flex-col gap-3">
          <FormError message={deleteState.formError} />
          <input type="hidden" name="gameId" value={game.id} />
          <p className="font-semibold break-words">Delete {game.title}?</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isDeleting}
              className={dangerButtonClassName}
            >
              Yes, delete
            </button>
            <button
              type="button"
              onClick={showView}
              className={secondaryButtonClassName}
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-3 rounded-2xl bg-paper-light p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h3 className="font-semibold break-words">{game.title}</h3>
        <p className="text-sm">
          {formatPlayers(game.minPlayers, game.maxPlayers)} ·{" "}
          {formatDuration(game.playtimeMinutes)}
        </p>
        {ownerName ? <p className="text-sm">{ownerName}’s copy</p> : null}
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setMode("edit")}
          aria-label={`Edit ${game.title}`}
          className={secondaryButtonClassName}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setMode("confirm-delete")}
          aria-label={`Delete ${game.title}`}
          className={secondaryButtonClassName}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
