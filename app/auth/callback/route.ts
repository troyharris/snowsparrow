import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Define allowed origins for the 'next' parameter
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL, // main origin
  "http://localhost:3000", // Allow localhost for development
];

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/'

  if (!code) {
    console.error('No code received in callback')
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  // Validate the 'next' parameter to prevent open redirects
  if (next && typeof next === 'string' && !ALLOWED_ORIGINS.some(allowedOrigin => typeof allowedOrigin === 'string' && next.startsWith(allowedOrigin))) {
    console.error('Invalid next parameter:', next);
    next = '/'; // Redirect to the homepage if 'next' is invalid
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  
  if (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }
  
  // Log success and session info for debugging
  console.log('Auth callback success, session established')
  
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'
  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${next}`)
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${next}`)
  } else {
    return NextResponse.redirect(`${origin}${next}`)
  }
}
