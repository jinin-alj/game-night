"use client";

import { useActionState, useEffect } from "react";
import { FormError } from "@/components/FormError";
import { SelectField, type SelectOption } from "@/components/SelectField";
import { TextField } from "@/components/TextField";
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/styles";
import type { GroupMember } from "@/features/groups/queries";
import type { GameFormState, GameFormValues } from "../form-state";
import {
  MAX_PLAYERS,
  MAX_PLAYTIME_MINUTES,
  MIN_PLAYERS,
  MIN_PLAYTIME_MINUTES,
} from "../limits";

type GameFormProps = {
  formId: string;
  action: (state: GameFormState, formData: FormData) => Promise<GameFormState>;
  initialValues: GameFormValues;
  members: GroupMember[];
  submitLabel: string;
  gameId?: string;
  onSaved?: () => void;
  onCancel?: () => void;
};

/** The fields of a game, shared by the add form and each card's edit form. */
export function GameForm({
  formId,
  action,
  initialValues,
  members,
  submitLabel,
  gameId,
  onSaved,
  onCancel,
}: GameFormProps) {
  const [state, formAction, isPending] = useActionState(action, {
    values: initialValues,
    fieldErrors: {},
    saved: false,
  });

  useEffect(() => {
    if (state.saved && onSaved) {
      onSaved();
    }
  }, [state, onSaved]);

  const ownerOptions: SelectOption[] = [{ value: "", label: "Not set" }];
  for (const member of members) {
    ownerOptions.push({ value: member.id, label: member.displayName });
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <FormError message={state.formError} />
      {gameId ? <input type="hidden" name="gameId" value={gameId} /> : null}
      <TextField
        label="Title"
        name="title"
        id={`${formId}-title`}
        type="text"
        autoComplete="off"
        defaultValue={state.values.title}
        error={state.fieldErrors.title}
      />
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Min players"
          name="minPlayers"
          id={`${formId}-min-players`}
          type="number"
          autoComplete="off"
          min={MIN_PLAYERS}
          max={MAX_PLAYERS}
          defaultValue={state.values.minPlayers}
          error={state.fieldErrors.minPlayers}
        />
        <TextField
          label="Max players"
          name="maxPlayers"
          id={`${formId}-max-players`}
          type="number"
          autoComplete="off"
          min={MIN_PLAYERS}
          max={MAX_PLAYERS}
          defaultValue={state.values.maxPlayers}
          error={state.fieldErrors.maxPlayers}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Playtime (minutes)"
          name="playtimeMinutes"
          id={`${formId}-playtime`}
          type="number"
          autoComplete="off"
          min={MIN_PLAYTIME_MINUTES}
          max={MAX_PLAYTIME_MINUTES}
          defaultValue={state.values.playtimeMinutes}
          error={state.fieldErrors.playtimeMinutes}
        />
        <SelectField
          label="Whose copy?"
          name="copyOwnerId"
          id={`${formId}-copy-owner`}
          options={ownerOptions}
          defaultValue={state.values.copyOwnerId}
          error={state.fieldErrors.copyOwnerId}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className={primaryButtonClassName}
        >
          {submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className={secondaryButtonClassName}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
