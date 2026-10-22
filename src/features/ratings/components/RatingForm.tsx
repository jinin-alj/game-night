"use client";

import { useActionState } from "react";
import { FormSuccess } from "@/components/FormSuccess";
import { SelectField, type SelectOption } from "@/components/SelectField";
import { secondaryButtonClassName } from "@/components/styles";
import { rateGame } from "../actions";

const scoreOptions: SelectOption[] = [{ value: "", label: "Choose…" }];
for (let score = 1; score <= 10; score++) {
  scoreOptions.push({ value: String(score), label: String(score) });
}

type RatingFormProps = {
  formId: string;
  gameId: string;
  label: string;
  currentScore: number | null;
};

/** A 1–10 dropdown and a Save button that rates one game. */
export function RatingForm({
  formId,
  gameId,
  label,
  currentScore,
}: RatingFormProps) {
  const [state, formAction, isPending] = useActionState(rateGame, {});

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="gameId" value={gameId} />
      <div className="flex items-end gap-3">
        <div className="w-32">
          <SelectField
            label={label}
            name="score"
            id={`${formId}-score`}
            options={scoreOptions}
            defaultValue={currentScore === null ? "" : String(currentScore)}
            error={state.error}
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className={secondaryButtonClassName}
        >
          Save
        </button>
      </div>
      <FormSuccess message={state.success} />
    </form>
  );
}
