import { focusRingClassName } from "./styles";

type TextFieldProps = {
  label: string;
  name: string;
  type: "text" | "email" | "password" | "date" | "number";
  autoComplete: string;
  id?: string;
  testId?: string;
  defaultValue?: string;
  error?: string;
  min?: number;
  max?: number;
};

/** A labelled text input with its error message shown underneath. */
export function TextField({
  label,
  name,
  type,
  autoComplete,
  id,
  testId,
  defaultValue,
  error,
  min,
  max,
}: TextFieldProps) {
  // Pages with several copies of one form pass their own id so labels stay unique.
  const inputId = id ?? name;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="font-medium">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={type === "number" ? "numeric" : undefined}
        min={min}
        max={max}
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
