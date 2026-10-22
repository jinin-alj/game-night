"use client";

import { useState } from "react";
import { ConfirmActionButton } from "@/components/ConfirmActionButton";
import { primaryButtonClassName } from "@/components/styles";
import { resetInviteCode } from "../actions";
import { addJoinCode } from "../invite-link";

type InviteCardProps = {
  groupId: string;
  inviteCode: string;
  isOwner: boolean;
};

/** The invite code with a Copy link button, and Reset code for the owner. */
export function InviteCard({ groupId, inviteCode, isOwner }: InviteCardProps) {
  const [copyMessage, setCopyMessage] = useState("");

  async function copyInviteLink() {
    const link = window.location.origin + addJoinCode("/app", inviteCode);
    try {
      await navigator.clipboard.writeText(link);
      setCopyMessage("Link copied. Send it to your friends.");
    } catch (error) {
      console.error("Copying the invite link failed:", error);
      setCopyMessage("Couldn’t copy. Share the code above instead.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p>
        <span className="block text-sm">Invite code</span>
        <span className="font-mono text-2xl font-bold tracking-widest">
          {inviteCode}
        </span>
      </p>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={copyInviteLink}
          className={`self-start ${primaryButtonClassName}`}
        >
          Copy link
        </button>
        <p role="status" className="text-sm">
          {copyMessage}
        </p>
      </div>
      {isOwner ? (
        <ConfirmActionButton
          action={resetInviteCode}
          buttonLabel="Reset code"
          question="Reset the code? Old links and the old code will stop working."
          confirmLabel="Yes, reset"
          isDangerous={true}
          hiddenFields={{ groupId }}
        />
      ) : null}
    </div>
  );
}
