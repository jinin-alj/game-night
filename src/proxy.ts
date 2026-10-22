import { NextResponse, type NextRequest } from "next/server";
import { addJoinCode, parseJoinCode } from "@/features/groups/invite-link";
import { updateSession } from "@/lib/supabase/proxy";

/** Keeps the session fresh and sends visitors to the right side of the login wall. */
export async function proxy(request: NextRequest) {
  const { response, isLoggedIn } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const isAppPage = path === "/app" || path.startsWith("/app/");
  const isAuthPage = path === "/login" || path === "/signup";
  // Only a well-formed invite code is carried along, never any other text.
  const joinCode = parseJoinCode(request.nextUrl.searchParams.get("join"));

  if (isAppPage && !isLoggedIn) {
    return redirectKeepingCookies(
      addJoinCode("/login", joinCode),
      request,
      response,
    );
  }
  if (isAuthPage && isLoggedIn) {
    return redirectKeepingCookies(
      addJoinCode("/app", joinCode),
      request,
      response,
    );
  }
  return response;
}

function redirectKeepingCookies(
  path: string,
  request: NextRequest,
  response: NextResponse,
) {
  const redirect = NextResponse.redirect(new URL(path, request.url));
  // Copy any refreshed session cookies so the redirect doesn't lose them.
  for (const cookie of response.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}

export const config = {
  // Skip Next.js internals and static files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
