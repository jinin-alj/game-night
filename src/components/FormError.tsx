type FormErrorProps = {
  message?: string;
};

/** An error about the whole form, announced to screen readers when it appears. */
export function FormError({ message }: FormErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="alert"
      className="rounded-lg border border-canyon-dark bg-paper-light px-3 py-2 text-canyon-dark"
    >
      {message}
    </p>
  );
}
