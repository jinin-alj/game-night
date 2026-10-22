"use client";

import { useActionState } from "react";
import { FormError } from "@/components/FormError";
import { secondaryButtonClassName } from "@/components/styles";
import { logPlay } from "../actions";

type PlayButtonProps = {
  nightId: string;
  gameId: string;
  gameTitle: string;
};

/** "We played this" on a lineup game: logs a play for this night. */
export function PlayButton({ nightId, gameId, gameTitle }: PlayButtonProps) {
  const [state, formAction, isPending] = useActionState(logPlay, {});

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="nightId" value={nightId} />
      <input type="hidden" name="gameId" value={gameId} />
      <button
        type="submit"
        disabled={isPending}
        aria-label={`We played ${gameTitle}`}
        className={`self-start ${secondaryButtonClassName}`}
      >
        We played this
      </button>
      <FormError message={state.error} />
    </form>
  );
}
