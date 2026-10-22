import type { Metadata } from "next";
import Link from "next/link";
import { textLinkClassName } from "@/components/styles";
import { AuthPanel } from "@/features/account/components/AuthPanel";
import { LogInForm } from "@/features/account/components/LogInForm";

export const metadata: Metadata = {
  title: "Log in · Game Night Planner",
};

/** The log-in page. */
export default function LogInPage() {
  return (
    <AuthPanel
      title="Log in"
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className={textLinkClassName}>
            Create an account
          </Link>
        </>
      }
    >
      <LogInForm />
    </AuthPanel>
  );
}
