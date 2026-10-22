import Link from "next/link";
import { textLinkClassName } from "@/components/styles";

/** Shown inside the app (with the header and Log out) when a page or night isn't found. */
export default function AppNotFound() {
  return (
    <section className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p>This page doesn’t exist, or it belongs to a group you’re not in.</p>
      <Link href="/app" className={`self-start ${textLinkClassName}`}>
        Back to your game nights
      </Link>
    </section>
  );
}
