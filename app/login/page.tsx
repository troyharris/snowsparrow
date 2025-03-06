'use client'

import { login, signup } from "./actions"
import GoogleOneTapComponent from "@/components/shared/GoogleOneTap"
import { createClient } from "@/utils/supabase/client"
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    if (error) {
      console.error('Login error:', decodeURIComponent(error))
    }
  }, [error])

  const handleGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault()
    console.log('Initiating Google sign-in')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth/callback`
        },
      })
      if (error) {
        console.error('Google sign-in error:', error)
      } else {
        console.log('Google sign-in initiated successfully')
      }
    } catch (err) {
      console.error('Google sign-in exception:', err)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <GoogleOneTapComponent />
      <div className="bg-background border border-border rounded-md p-6 shadow-sm w-full max-w-md">
        {error && (
          <div className="mb-4 p-4 text-sm text-red-800 bg-red-50 rounded-md">
            {decodeURIComponent(error)}
          </div>
        )}
        <div className="text-center mb-8">
          <h1 className="text-2xl leading-9 font-semibold tracking-tight text-foreground">
            Welcome to Snowsparrow
          </h1>
          <p className="text-muted mt-2 text-foreground leading-relaxed">
            Sign in to access AI tools for education
          </p>
        </div>

        {/* Google Sign In Button */}
        <button 
          className="w-full flex items-center justify-center gap-2 border border-border rounded-md py-2 px-4 text-sm font-medium text-foreground hover:bg-muted transition-all duration-150 mb-6"
          onClick={handleGoogleSignIn}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          Sign in with Google
        </button>

        {process.env.NEXT_PUBLIC_ENABLE_PASSWORD_AUTH === 'true' && (
          <>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <form className="flex flex-col gap-4">
              <div className="space-y-1">
                <label
                  className="block text-sm font-medium text-foreground"
                  htmlFor="email"
                >
                  Email address
                </label>
                <input
                  className="w-full bg-input border border-border rounded-md text-foreground text-sm leading-5 px-3 py-2 transition-all duration-150 ease-in-out focus:border-accent focus:ring-2 focus:ring-ring"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@school.edu"
                />
              </div>

              <div className="space-y-1">
                <label
                  className="block text-sm font-medium text-foreground"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  className="w-full bg-input border border-border rounded-md text-foreground text-sm leading-5 px-3 py-2 transition-all duration-150 ease-in-out focus:border-accent focus:ring-2 focus:ring-ring"
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                />
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <button
                  className="bg-accent hover:bg-accent-hover text-accent-foreground font-medium py-2 px-4 rounded-md transition-all duration-150 focus:ring-2 focus:ring-ring"
                  formAction={login}
                >
                  Sign in
                </button>
                <button
                  className="bg-accent hover:bg-border text-accent-foreground font-medium py-2 px-4 rounded-md transition-all duration-150 focus:ring-2 focus:ring-ring"
                  formAction={signup}
                >
                  Create account
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <LoadingSpinner text="Loading..." />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
