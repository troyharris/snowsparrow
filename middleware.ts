import { type NextRequest, NextResponse } from "next/server";
import { updateSession, isAuthenticated } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // update user's auth session
  const res = await updateSession(request);

  const authenticated = await isAuthenticated(request);

  if (!authenticated && request.nextUrl.pathname !== "/login") {
    const redirectUrl = new URL(`/login`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
