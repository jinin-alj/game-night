import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConfirmActionButton } from "@/components/ConfirmActionButton";
import { SingleFieldForm } from "@/components/SingleFieldForm";
import { deleteAccount, updateDisplayName } from "@/features/account/actions";
import {
  createGroup,
  goToJoinPrompt,
  leaveGroup,
  renameGroup,
} from "@/features/groups/actions";
import { InviteCard } from "@/features/groups/components/InviteCard";
import { MemberList } from "@/features/groups/components/MemberList";
import { getGroupDetails, listGroupMembers } from "@/features/groups/queries";
import { getSessionContext } from "@/features/groups/session";

export const metadata: Metadata = {
  title: "Group · Game Night Planner",
};

/** The group page: members, invites, other groups, leaving, and the user's account. */
export default async function GroupPage() {
  const { supabase, userId, activeGroup } = await getSessionContext();
  if (!activeGroup) {
    return <p>You aren’t in a group yet.</p>;
  }

  const group = await getGroupDetails(supabase, activeGroup.id);
  const members = await listGroupMembers(supabase, activeGroup.id);
  if (!group || !members) {
    return (
      <p role="alert" className="text-canyon-dark">
        Couldn’t load your group. Refresh the page to try again.
      </p>
    );
  }

  const isOwner = group.ownerId === userId;
  const isOnlyMember = members.length === 1;
  let myName = "";
  for (const member of members) {
    if (member.id === userId) {
      myName = member.displayName;
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold break-words">{group.name}</h1>

      <PageSection id="members" title="Members">
        <MemberList
          groupId={group.id}
          members={members}
          ownerId={group.ownerId}
          currentUserId={userId}
        />
        {isOwner ? (
          <SingleFieldForm
            action={renameGroup}
            fieldId="group-name"
            fieldName="groupName"
            label="Group name"
            submitLabel="Rename group"
            autoComplete="off"
            defaultValue={group.name}
            hiddenFields={{ groupId: group.id }}
          />
        ) : null}
      </PageSection>

      <PageSection id="invite" title="Invite friends">
        <InviteCard
          groupId={group.id}
          inviteCode={group.inviteCode}
          isOwner={isOwner}
        />
      </PageSection>

      <PageSection id="other-groups" title="Other groups">
        <SingleFieldForm
          action={goToJoinPrompt}
          fieldId="invite-code"
          fieldName="inviteCode"
          label="Join with a code"
          submitLabel="Continue"
          autoComplete="off"
        />
        <SingleFieldForm
          action={createGroup}
          fieldId="new-group-name"
          fieldName="groupName"
          label="Create a new group"
          submitLabel="Create group"
          autoComplete="off"
        />
      </PageSection>

      <PageSection id="leave" title="Leave this group">
        <ConfirmActionButton
          action={leaveGroup}
          buttonLabel={isOnlyMember ? "Leave and delete group" : "Leave group"}
          question={
            isOnlyMember
              ? `You’re the only member, so leaving deletes ${group.name} with its games and nights. Continue?`
              : `Leave ${group.name}?`
          }
          confirmLabel="Yes, leave"
          isDangerous={true}
          hiddenFields={{ groupId: group.id }}
        />
      </PageSection>

      <PageSection id="account" title="Your account">
        <SingleFieldForm
          action={updateDisplayName}
          fieldId="display-name"
          fieldName="displayName"
          label="Your name"
          submitLabel="Save name"
          autoComplete="nickname"
          defaultValue={myName}
        />
        <ConfirmActionButton
          action={deleteAccount}
          buttonLabel="Delete my account"
          question="Delete your account? This can’t be undone."
          confirmLabel="Yes, delete my account"
          isDangerous={true}
        />
      </PageSection>
    </div>
  );
}

type PageSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

function PageSection({ id, title, children }: PageSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-2xl bg-paper-light p-5"
    >
      <h2 id={headingId} className="text-xl font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}
