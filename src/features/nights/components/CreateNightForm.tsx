"use client";

import { useActionState } from "react";
import { FormError } from "@/components/FormError";
import { SelectField } from "@/components/SelectField";
import { TextField } from "@/components/TextField";
import { primaryButtonClassName } from "@/components/styles";
import { createNight } from "../actions";
import { DEFAULT_NIGHT_MINUTES } from "../limits";
import { nightLengthOptions } from "../night-length-options";

type CreateNightFormProps = {
  defaultNightDate: string;
};

/** The form that creates a game night; only the name has to be filled in. */
export function CreateNightForm({ defaultNightDate }: CreateNightFormProps) {
  const [state, formAction, isPending] = useActionState(createNight, {
    values: {
      name: "",
      nightDate: defaultNightDate,
      availableMinutes: String(DEFAULT_NIGHT_MINUTES),
    },
    fieldErrors: {},
  });

  return (
    <form
      action={formAction}
      noValidate
      aria-labelledby="create-night-heading"
      className="flex flex-col gap-4 rounded-2xl bg-paper-light p-5"
    >
      <h2 id="create-night-heading" className="text-xl font-bold">
        Create a game night
      </h2>
      <FormError message={state.formError} />
      <TextField
        label="Night name"
        name="name"
        type="text"
        autoComplete="off"
        testId="core-input"
        defaultValue={state.values.name}
        error={state.fieldErrors.name}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Date"
          name="nightDate"
          type="date"
          autoComplete="off"
          defaultValue={state.values.nightDate}
          error={state.fieldErrors.nightDate}
        />
        <SelectField
          label="Hours available"
          name="availableMinutes"
          options={nightLengthOptions}
          defaultValue={state.values.availableMinutes}
          error={state.fieldErrors.availableMinutes}
        />
      </div>
      <button
        type="submit"
        data-testid="core-submit"
        disabled={isPending}
        className={primaryButtonClassName}
      >
        Create night
      </button>
    </form>
  );
}
