import { focusRingClassName } from "./styles";

type TextFieldProps = {
  label: string;
  name: string;
  type: "text" | "email" | "password";
  autoComplete: string;
  testId?: string;
  defaultValue?: string;
  error?: string;
};

/** A labelled text input with its error message shown underneath. */
export function TextField({
  label,
  name,
  type,
  autoComplete,
  testId,
  defaultValue,
  error,
}: TextFieldProps) {
  const errorId = `${name}-error`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        data-testid={testId}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border border-ink/60 bg-paper-light px-3 py-2 text-base ${focusRingClassName}`}
      />
      {error ? (
        <p id={errorId} className="text-sm text-canyon-dark">
          {error}
        </p>
      ) : null}
    </div>
  );
}
