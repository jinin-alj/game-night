"use client";

import { useActionState, useRef } from "react";
import { focusRingClassName } from "@/components/styles";
import { switchGroup } from "../actions";
import type { ActiveGroup } from "../queries";

type GroupSwitcherProps = {
  groups: ActiveGroup[];
  activeGroupId: string;
};

/** A dropdown in the header that switches the active group as soon as one is picked. */
export function GroupSwitcher({ groups, activeGroupId }: GroupSwitcherProps) {
  const [state, formAction, isPending] = useActionState(switchGroup, {});
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={formAction}
      key={activeGroupId}
      className="mt-1"
    >
      <label htmlFor="group-switcher" className="sr-only">
        Group
      </label>
      <select
        id="group-switcher"
        name="groupId"
        defaultValue={activeGroupId}
        disabled={isPending}
        // Picking a group submits right away; the hint below warns screen-reader users first.
        onChange={() => formRef.current?.requestSubmit()}
        aria-describedby="group-switcher-hint"
        className={`w-full max-w-xs rounded-lg border border-ink/60 bg-paper-light px-2 py-1 text-sm ${focusRingClassName}`}
      >
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </select>
      <span id="group-switcher-hint" className="sr-only">
        Choosing a group switches to it.
      </span>
      {state.error ? (
        <p role="alert" className="text-sm text-canyon-dark">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
