"use client";

import { useActionState } from "react";
import { FormError } from "@/components/FormError";
import { TextField } from "@/components/TextField";
import { primaryButtonClassName } from "@/components/styles";
import { logIn } from "../actions";
import { emptyAuthFormState } from "../form-state";

type LogInFormProps = {
  joinCode: string | null;
};

/** The log-in form: email and password. */
export function LogInForm({ joinCode }: LogInFormProps) {
  const [state, formAction, isPending] = useActionState(
    logIn,
    emptyAuthFormState,
  );

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <FormError message={state.formError} />
      {joinCode ? <input type="hidden" name="join" value={joinCode} /> : null}
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        testId="login-email"
        defaultValue={state.values.email}
        error={state.fieldErrors.email}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        testId="login-password"
        error={state.fieldErrors.password}
      />
      <button
        type="submit"
        data-testid="login-submit"
        disabled={isPending}
        className={primaryButtonClassName}
      >
        Log in
      </button>
    </form>
  );
}
