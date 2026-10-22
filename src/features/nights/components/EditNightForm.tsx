"use client";

import { useActionState, useState } from "react";
import { FormError } from "@/components/FormError";
import { SelectField } from "@/components/SelectField";
import { TextField } from "@/components/TextField";
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/styles";
import { updateNight } from "../actions";
import type { NightFormState } from "../form-state";
import { nightLengthOptions } from "../night-length-options";
import type { NightDetails } from "../types";

type EditNightFormProps = {
  night: NightDetails;
};

/** An "Edit night" button that opens a form for the name, date and hours. */
export function EditNightForm({ night }: EditNightFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (previousState: NightFormState, formData: FormData) => {
      const result = await updateNight(previousState, formData);
      // Close the form once the night is saved.
      if (result.saved) {
        setIsOpen(false);
      }
      return result;
    },
    {
      values: {
        name: night.name,
        nightDate: night.nightDate,
        availableMinutes: String(night.availableMinutes),
      },
      fieldErrors: {},
    },
  );

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`self-start ${secondaryButtonClassName}`}
      >
        Edit night
      </button>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <FormError message={state.formError} />
      <input type="hidden" name="nightId" value={night.id} />
      <TextField
        label="Night name"
        name="name"
        id="edit-night-name"
        type="text"
        autoComplete="off"
        defaultValue={state.values.name}
        error={state.fieldErrors.name}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Date"
          name="nightDate"
          id="edit-night-date"
          type="date"
          autoComplete="off"
          defaultValue={state.values.nightDate}
          error={state.fieldErrors.nightDate}
        />
        <SelectField
          label="Hours available"
          name="availableMinutes"
          id="edit-night-hours"
          options={nightLengthOptions}
          defaultValue={state.values.availableMinutes}
          error={state.fieldErrors.availableMinutes}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className={primaryButtonClassName}
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className={secondaryButtonClassName}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
