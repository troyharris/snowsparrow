import { type NextRequest, NextResponse } from "next/server";
import { updateSession, isAuthenticated } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  console.log('Middleware processing:', request.nextUrl.pathname);
  
  // update user's auth session
  const res = await updateSession(request);

  // Allow API routes and auth callback to bypass authentication
  if (request.nextUrl.pathname.startsWith("/api/") || request.nextUrl.pathname.startsWith("/auth/callback")) {
    console.log('Bypassing auth check for:', request.nextUrl.pathname);
    return res;
  }

  const authenticated = await isAuthenticated(request);
  console.log('Auth check result:', authenticated, 'for path:', request.nextUrl.pathname);

  if (!authenticated && request.nextUrl.pathname !== "/login") {
    console.log('Redirecting to login from:', request.nextUrl.pathname);
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
