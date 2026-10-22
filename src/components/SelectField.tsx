import { focusRingClassName } from "./styles";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  error?: string;
};

/** A labelled dropdown with its error message shown underneath. */
export function SelectField({
  label,
  name,
  options,
  defaultValue,
  error,
}: SelectFieldProps) {
  const errorId = `${name}-error`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="font-medium">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border border-ink/60 bg-paper-light px-3 py-2 text-base ${focusRingClassName}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} className="text-sm text-canyon-dark">
          {error}
        </p>
      ) : null}
    </div>
  );
}
