import { type NextRequest, NextResponse } from "next/server";
import { updateSession, isAuthenticated } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  console.log('Middleware processing:', request.nextUrl.pathname);

  // Paths that should be accessible without authentication
  const publicPaths = [
    "/login",
    "/api/nonce",
    "/auth/callback",
    "/auth/confirm",
    "/auth/signout"
  ];

  // Check if the current path is in the public paths list
  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname === path
  );

  // If it's a public path, let it through without session updates or auth checks
  if (isPublicPath) {
    console.log('Allowing public path:', request.nextUrl.pathname);
    return NextResponse.next(); // Let the request proceed to the API route or page
  }

  // For non-public paths, update the session and check authentication
  const res = await updateSession(request); // updateSession might return a response (e.g., redirect)
  const authenticated = await isAuthenticated(request); // Check auth status *after* potential session update
  console.log('Auth check result:', authenticated, 'for path:', request.nextUrl.pathname);

  if (!authenticated) {
    console.log('Redirecting to login from:', request.nextUrl.pathname);
    const redirectUrl = new URL(`/login`, request.url);
    return NextResponse.redirect(redirectUrl); // Explicitly redirect
  }

  // If authenticated, return the response from updateSession (which might contain updated cookies)
  // If updateSession returned NextResponse.next(), this will just continue the chain.
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
