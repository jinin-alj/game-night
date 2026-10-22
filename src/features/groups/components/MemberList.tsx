import { ConfirmActionButton } from "@/components/ConfirmActionButton";
import { removeMember, transferOwnership } from "../actions";
import type { GroupMember } from "../queries";

type MemberListProps = {
  groupId: string;
  members: GroupMember[];
  ownerId: string;
  currentUserId: string;
};

/** The group's members; the owner can hand over ownership or remove someone. */
export function MemberList({
  groupId,
  members,
  ownerId,
  currentUserId,
}: MemberListProps) {
  const isOwner = ownerId === currentUserId;

  return (
    <ul className="flex flex-col gap-3">
      {members.map((member) => {
        const showOwnerActions = isOwner && member.id !== currentUserId;
        const hiddenFields = { groupId, memberId: member.id };

        return (
          <li
            key={member.id}
            className="flex flex-col gap-3 rounded-xl border border-ink/15 p-3"
          >
            <p className="flex flex-wrap items-center gap-2">
              <span className="font-semibold break-words">
                {member.displayName}
              </span>
              {member.id === ownerId ? (
                <span className="rounded-full bg-mustard px-2 text-sm font-semibold">
                  Owner
                </span>
              ) : null}
              {member.id === currentUserId ? (
                <span className="rounded-full bg-mist px-2 text-sm font-semibold">
                  You
                </span>
              ) : null}
            </p>
            {showOwnerActions ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <ConfirmActionButton
                  action={transferOwnership}
                  buttonLabel="Make owner"
                  accessibleLabel={`Make ${member.displayName} the owner`}
                  question={`Make ${member.displayName} the owner? You’ll become a regular member.`}
                  confirmLabel="Yes, hand over"
                  isDangerous={false}
                  hiddenFields={hiddenFields}
                />
                <ConfirmActionButton
                  action={removeMember}
                  buttonLabel="Remove"
                  accessibleLabel={`Remove ${member.displayName}`}
                  question={`Remove ${member.displayName}? Games marked as their copy leave with them.`}
                  confirmLabel="Yes, remove"
                  isDangerous={true}
                  hiddenFields={hiddenFields}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
