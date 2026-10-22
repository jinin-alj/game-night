type FormSuccessProps = {
  message?: string;
};

/** A short confirmation after a form saves, announced politely to screen readers. */
export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) {
    return null;
  }

  return (
    <p role="status" className="font-medium text-pine">
      {message}
    </p>
  );
}
