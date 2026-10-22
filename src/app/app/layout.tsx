import { redirect } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { Header } from "@/components/Header";
import { getActiveGroup } from "@/features/groups/queries";
import { createClient, getCurrentUserId } from "@/lib/supabase/server";

/** Wraps every logged-in page: checks the user again and shows the header. */
export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) {
    // Backup for the proxy, so a logged-out visitor never sees this page.
    redirect("/login");
  }

  const activeGroup = await getActiveGroup(supabase, userId);

  return (
    <>
      <Header groupName={activeGroup ? activeGroup.name : null} />
      {/* Extra bottom padding on phones keeps content clear of the tab bar. */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-8 pb-28 sm:pb-8">
        {children}
      </main>
      <AppNav variant="bottom" />
    </>
  );
}
