"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormError } from "@/components/FormError";
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/styles";
import { joinGroup } from "../actions";
import type { GroupPreview } from "../queries";

type JoinPromptProps = {
  inviteCode: string | null;
  preview: GroupPreview | null;
};

/** Asks the user to confirm before joining the group from an invite link. */
export function JoinPrompt({ inviteCode, preview }: JoinPromptProps) {
  const [state, formAction, isPending] = useActionState(joinGroup, {});

  if (!inviteCode || !preview) {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border border-canyon-dark bg-paper-light p-5">
        <p className="font-semibold text-canyon-dark">
          That invite code doesn’t work. Ask for a new link.
        </p>
        <Link href="/app" className={`self-start ${secondaryButtonClassName}`}>
          Dismiss
        </Link>
      </section>
    );
  }

  const memberText =
    preview.memberCount === 1 ? "1 member" : `${preview.memberCount} members`;

  return (
    <section
      aria-labelledby="join-prompt-heading"
      className="flex flex-col gap-3 rounded-2xl border-2 border-pine bg-paper-light p-5"
    >
      <h2 id="join-prompt-heading" className="text-xl font-bold break-words">
        {preview.isMember
          ? `You’re already in ${preview.name}`
          : `Join ${preview.name}?`}
      </h2>
      <p>{memberText}</p>
      <FormError message={state.error} />
      <form action={formAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="inviteCode" value={inviteCode} />
        <button
          type="submit"
          disabled={isPending}
          className={primaryButtonClassName}
        >
          {preview.isMember ? "Switch to it" : "Join"}
        </button>
        <Link href="/app" className={secondaryButtonClassName}>
          Not now
        </Link>
      </form>
    </section>
  );
}
