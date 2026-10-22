import type { Metadata } from "next";
import Link from "next/link";
import { textLinkClassName } from "@/components/styles";
import { AuthPanel } from "@/features/account/components/AuthPanel";
import { LogInForm } from "@/features/account/components/LogInForm";
import { addJoinCode, parseJoinCode } from "@/features/groups/invite-link";

export const metadata: Metadata = {
  title: "Log in · Game Night Planner",
};

/** The log-in page; an invite code in the link is kept for after log-in. */
export default async function LogInPage({ searchParams }: PageProps<"/login">) {
  const { join } = await searchParams;
  const joinCode = parseJoinCode(join);

  return (
    <AuthPanel
      title="Log in"
      footer={
        <>
          New here?{" "}
          <Link
            href={addJoinCode("/signup", joinCode)}
            className={textLinkClassName}
          >
            Create an account
          </Link>
        </>
      }
    >
      {joinCode ? (
        <p className="mb-4">
          You’ve been invited to a group. Log in to join it.
        </p>
      ) : null}
      <LogInForm joinCode={joinCode} />
    </AuthPanel>
  );
}
