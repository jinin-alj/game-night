import Link from "next/link";
import { textLinkClassName } from "@/components/styles";

/** Shown for any address outside the app that doesn't exist. */
export default function NotFound() {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 px-4 py-12"
    >
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p>This page doesn’t exist.</p>
      <Link href="/" className={`self-start ${textLinkClassName}`}>
        Go to the home page
      </Link>
    </main>
  );
}
