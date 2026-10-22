import type { Metadata } from "next";
import Link from "next/link";
import { textLinkClassName } from "@/components/styles";
import { AuthPanel } from "@/features/account/components/AuthPanel";
import { SignUpForm } from "@/features/account/components/SignUpForm";
import { addJoinCode, parseJoinCode } from "@/features/groups/invite-link";

export const metadata: Metadata = {
  title: "Sign up · Game Night Planner",
};

/** The sign-up page; an invite code in the link is kept for after sign-up. */
export default async function SignUpPage({
  searchParams,
}: PageProps<"/signup">) {
  const { join } = await searchParams;
  const joinCode = parseJoinCode(join);

  return (
    <AuthPanel
      title="Create your account"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={addJoinCode("/login", joinCode)}
            className={textLinkClassName}
          >
            Log in
          </Link>
        </>
      }
    >
      {joinCode ? (
        <p className="mb-4">
          You’ve been invited to a group. Sign up to join it.
        </p>
      ) : null}
      <SignUpForm joinCode={joinCode} />
    </AuthPanel>
  );
}
