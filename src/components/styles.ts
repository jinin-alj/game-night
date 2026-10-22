export const focusRingClassName =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export const primaryButtonClassName = `inline-flex items-center justify-center rounded-full bg-pine px-6 py-3 font-semibold text-paper hover:bg-pine-dark disabled:opacity-60 ${focusRingClassName}`;

export const secondaryButtonClassName = `inline-flex items-center justify-center rounded-full border border-ink px-4 py-2 font-semibold hover:bg-paper disabled:opacity-60 ${focusRingClassName}`;

export const dangerButtonClassName = `inline-flex items-center justify-center rounded-full bg-canyon-dark px-4 py-2 font-semibold text-paper underline-offset-4 hover:underline disabled:opacity-60 ${focusRingClassName}`;

export const textLinkClassName = `font-semibold text-pine underline underline-offset-4 hover:text-pine-dark ${focusRingClassName}`;
