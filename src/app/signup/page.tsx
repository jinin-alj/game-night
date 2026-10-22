import type { Metadata } from "next";
import Link from "next/link";
import { textLinkClassName } from "@/components/styles";
import { AuthPanel } from "@/features/account/components/AuthPanel";
import { SignUpForm } from "@/features/account/components/SignUpForm";

export const metadata: Metadata = {
  title: "Sign up · Game Night Planner",
};

/** The sign-up page. */
export default function SignUpPage() {
  return (
    <AuthPanel
      title="Create your account"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className={textLinkClassName}>
            Log in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthPanel>
  );
}
