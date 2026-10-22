import Link from "next/link";
import { LogOutButton } from "@/features/account/components/LogOutButton";
import { createClient, getCurrentUserId } from "@/lib/supabase/server";
import { textLinkClassName } from "./styles";

/** A bar with Log out for logged-in users on pages outside /app; renders nothing when logged out. */
export async function LoggedInBar() {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) {
    return null;
  }

  return (
    <div className="border-b border-ink/15 bg-paper-light">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/app" className={textLinkClassName}>
          Go to your game nights
        </Link>
        <LogOutButton />
      </div>
    </div>
  );
}
