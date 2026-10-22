import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

/** Creates a Supabase client for server components and server actions. */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseEnv();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const cookie of cookiesToSet) {
            cookieStore.set(cookie.name, cookie.value, cookie.options);
          }
        } catch {
          // Server components can't write cookies; the proxy refreshes the session for them.
        }
      },
    },
  });
}

/** Returns the logged-in user's id from a verified token, or null when logged out. */
export async function getCurrentUserId(
  supabase: SupabaseClient,
): Promise<string | null> {
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) {
    return null;
  }
  return data.claims.sub;
}
