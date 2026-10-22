"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/lib/forms";
import { FormError } from "./FormError";
import { FormSuccess } from "./FormSuccess";
import {
  dangerButtonClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "./styles";

type ConfirmActionButtonProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  buttonLabel: string;
  question: string;
  confirmLabel: string;
  isDangerous: boolean;
  hiddenFields?: Record<string, string>;
  accessibleLabel?: string;
};

/** A button that asks "Are you sure?" in place before running its action. */
export function ConfirmActionButton({
  action,
  buttonLabel,
  question,
  confirmLabel,
  isDangerous,
  hiddenFields,
  accessibleLabel,
}: ConfirmActionButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (previousState: ActionState, formData: FormData) => {
      const result = await action(previousState, formData);
      // Stay open on an error so it shows next to the question.
      if (!result.error) {
        setIsConfirming(false);
      }
      return result;
    },
    {},
  );

  if (!isConfirming) {
    return (
      <div className="flex flex-col gap-2">
        <FormSuccess message={state.success} />
        <button
          type="button"
          onClick={() => setIsConfirming(true)}
          aria-label={accessibleLabel}
          className={`self-start ${secondaryButtonClassName}`}
        >
          {buttonLabel}
        </button>
      </div>
    );
  }

  const hiddenInputs = [];
  if (hiddenFields) {
    for (const [name, value] of Object.entries(hiddenFields)) {
      hiddenInputs.push(
        <input key={name} type="hidden" name={name} value={value} />,
      );
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {hiddenInputs}
      <p className="font-semibold break-words">{question}</p>
      <FormError message={state.error} />
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className={
            isDangerous ? dangerButtonClassName : primaryButtonClassName
          }
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          className={secondaryButtonClassName}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
