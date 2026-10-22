import Link from "next/link";
import type { ReactNode } from "react";
import { textLinkClassName } from "@/components/styles";

type AuthPanelProps = {
  title: string;
  children: ReactNode;
  footer: ReactNode;
};

/** The cream panel that holds the sign-up and log-in forms. */
export function AuthPanel({ title, children, footer }: AuthPanelProps) {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="flex flex-1 flex-col items-center px-4 py-10 sm:py-16"
    >
      <Link href="/" className={`mb-6 text-lg ${textLinkClassName}`}>
        Game Night Planner
      </Link>
      <div className="w-full max-w-sm rounded-2xl bg-paper-light p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">{title}</h1>
        {children}
        <p className="mt-6 text-center">{footer}</p>
      </div>
    </main>
  );
}
