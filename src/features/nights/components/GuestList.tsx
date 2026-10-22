"use client";

import { useActionState } from "react";
import { FormError } from "@/components/FormError";
import { SingleFieldForm } from "@/components/SingleFieldForm";
import { secondaryButtonClassName } from "@/components/styles";
import { addGuest, removeGuest } from "../actions";
import type { Guest } from "../types";

type GuestListProps = {
  nightId: string;
  guests: Guest[];
};

/** The night's guests (friends without an account) and a form to add one. */
export function GuestList({ nightId, guests }: GuestListProps) {
  return (
    <div className="flex flex-col gap-4">
      {guests.length === 0 ? (
        <p>No guests yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {guests.map((guest) => (
            <GuestRow key={guest.id} nightId={nightId} guest={guest} />
          ))}
        </ul>
      )}
      <SingleFieldForm
        action={addGuest}
        fieldId="guest-name"
        fieldName="guestName"
        label="Guest’s name"
        submitLabel="Add guest"
        autoComplete="off"
        hiddenFields={{ nightId }}
      />
    </div>
  );
}

type GuestRowProps = {
  nightId: string;
  guest: Guest;
};

function GuestRow({ nightId, guest }: GuestRowProps) {
  const [state, formAction, isPending] = useActionState(removeGuest, {});

  return (
    <li className="flex flex-col gap-1">
      <form
        action={formAction}
        className="flex items-center justify-between gap-3"
      >
        <input type="hidden" name="nightId" value={nightId} />
        <input type="hidden" name="guestId" value={guest.id} />
        <span className="min-w-0 break-words">{guest.name}</span>
        <button
          type="submit"
          disabled={isPending}
          aria-label={`Remove ${guest.name}`}
          className={secondaryButtonClassName}
        >
          Remove
        </button>
      </form>
      <FormError message={state.error} />
    </li>
  );
}
