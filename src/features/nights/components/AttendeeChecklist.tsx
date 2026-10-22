"use client";

import { useActionState } from "react";
import { FormError } from "@/components/FormError";
import { FormSuccess } from "@/components/FormSuccess";
import {
  focusRingClassName,
  primaryButtonClassName,
} from "@/components/styles";
import type { GroupMember } from "@/features/groups/queries";
import { saveAttendees } from "../actions";

type AttendeeChecklistProps = {
  nightId: string;
  members: GroupMember[];
  attendeeIds: string[];
};

/** A checkbox per group member and one button to save who is coming. */
export function AttendeeChecklist({
  nightId,
  members,
  attendeeIds,
}: AttendeeChecklistProps) {
  const [state, formAction, isPending] = useActionState(saveAttendees, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="nightId" value={nightId} />
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Members coming to this night</legend>
        {members.map((member) => (
          <label key={member.id} className="flex min-h-11 items-center gap-3">
            <input
              type="checkbox"
              name="attendeeIds"
              value={member.id}
              defaultChecked={attendeeIds.includes(member.id)}
              className={`h-5 w-5 accent-pine ${focusRingClassName}`}
            />
            <span className="break-words">{member.displayName}</span>
          </label>
        ))}
      </fieldset>
      <FormError message={state.error} />
      <FormSuccess message={state.success} />
      <button
        type="submit"
        disabled={isPending}
        className={`self-start ${primaryButtonClassName}`}
      >
        Save who’s coming
      </button>
    </form>
  );
}
