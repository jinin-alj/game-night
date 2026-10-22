"use client";

import { useActionState } from "react";
import { FormError } from "@/components/FormError";
import { TextField } from "@/components/TextField";
import { primaryButtonClassName } from "@/components/styles";
import { signUp } from "../actions";
import { emptyAuthFormState } from "../form-state";

type SignUpFormProps = {
  joinCode: string | null;
};

/** The sign-up form: email, password and an optional name. */
export function SignUpForm({ joinCode }: SignUpFormProps) {
  const [state, formAction, isPending] = useActionState(
    signUp,
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
        testId="signup-email"
        defaultValue={state.values.email}
        error={state.fieldErrors.email}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        testId="signup-password"
        error={state.fieldErrors.password}
      />
      <TextField
        label="Your name (optional)"
        name="displayName"
        type="text"
        autoComplete="nickname"
        defaultValue={state.values.displayName}
        error={state.fieldErrors.displayName}
      />
      <button
        type="submit"
        data-testid="signup-submit"
        disabled={isPending}
        className={primaryButtonClassName}
      >
        Sign up
      </button>
    </form>
  );
}
