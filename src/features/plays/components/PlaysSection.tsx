"use client";

import { useActionState } from "react";
import { FormError } from "@/components/FormError";
import { SelectField, type SelectOption } from "@/components/SelectField";
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/styles";
import { logPlay, undoPlay } from "../actions";
import type { NightPlay } from "../queries";

type ShelfGame = {
  id: string;
  title: string;
};

type PlaysSectionProps = {
  nightId: string;
  plays: NightPlay[];
  games: ShelfGame[];
  canLogPlays: boolean;
  firstDayText: string;
};

/** The games logged as played on this night, with Undo and a way to log any shelf game. */
export function PlaysSection({
  nightId,
  plays,
  games,
  canLogPlays,
  firstDayText,
}: PlaysSectionProps) {
  if (!canLogPlays) {
    return <p>You can log the games you played from {firstDayText} on.</p>;
  }

  const loggedGameIds: string[] = [];
  for (const play of plays) {
    if (play.gameId) {
      loggedGameIds.push(play.gameId);
    }
  }
  const gameOptions: SelectOption[] = [{ value: "", label: "Choose a game" }];
  for (const game of games) {
    if (!loggedGameIds.includes(game.id)) {
      gameOptions.push({ value: game.id, label: game.title });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {plays.length === 0 ? (
        <p>No games logged yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {plays.map((play) => (
            <PlayRow key={play.id} nightId={nightId} play={play} />
          ))}
        </ul>
      )}
      {gameOptions.length > 1 ? (
        <LogPlayForm nightId={nightId} gameOptions={gameOptions} />
      ) : null}
    </div>
  );
}

type PlayRowProps = {
  nightId: string;
  play: NightPlay;
};

function PlayRow({ nightId, play }: PlayRowProps) {
  const [state, formAction, isPending] = useActionState(undoPlay, {});

  return (
    <li className="flex flex-col gap-1">
      <form
        action={formAction}
        className="flex items-center justify-between gap-3"
      >
        <input type="hidden" name="nightId" value={nightId} />
        <input type="hidden" name="playId" value={play.id} />
        <span className="min-w-0 break-words">
          {play.gameTitle}
          {play.gameId ? null : (
            <span className="text-sm"> (no longer on the shelf)</span>
          )}
        </span>
        <button
          type="submit"
          disabled={isPending}
          aria-label={`Undo ${play.gameTitle}`}
          className={secondaryButtonClassName}
        >
          Undo
        </button>
      </form>
      <FormError message={state.error} />
    </li>
  );
}

type LogPlayFormProps = {
  nightId: string;
  gameOptions: SelectOption[];
};

function LogPlayForm({ nightId, gameOptions }: LogPlayFormProps) {
  const [state, formAction, isPending] = useActionState(logPlay, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="nightId" value={nightId} />
      <SelectField
        label="Log another game"
        name="gameId"
        id="log-play-game"
        options={gameOptions}
        defaultValue=""
        error={state.error}
      />
      <button
        type="submit"
        disabled={isPending}
        className={`self-start ${primaryButtonClassName}`}
      >
        Log
      </button>
    </form>
  );
}
