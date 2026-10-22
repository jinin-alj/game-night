"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/forms";
import { FormSuccess } from "./FormSuccess";
import { TextField } from "./TextField";
import { primaryButtonClassName } from "./styles";

type SingleFieldFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  fieldId: string;
  fieldName: string;
  label: string;
  submitLabel: string;
  autoComplete: string;
  defaultValue?: string;
  hiddenFields?: Record<string, string>;
};

/** A form with one text field and a button, showing an error or a confirmation. */
export function SingleFieldForm({
  action,
  fieldId,
  fieldName,
  label,
  submitLabel,
  autoComplete,
  defaultValue,
  hiddenFields,
}: SingleFieldFormProps) {
  const [state, formAction, isPending] = useActionState(action, {});

  const hiddenInputs = [];
  if (hiddenFields) {
    for (const [name, value] of Object.entries(hiddenFields)) {
      hiddenInputs.push(
        <input key={name} type="hidden" name={name} value={value} />,
      );
    }
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-3">
      {hiddenInputs}
      <TextField
        label={label}
        name={fieldName}
        id={fieldId}
        type="text"
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        error={state.error}
      />
      <FormSuccess message={state.success} />
      <button
        type="submit"
        disabled={isPending}
        className={`self-start ${primaryButtonClassName}`}
      >
        {submitLabel}
      </button>
    </form>
  );
}
