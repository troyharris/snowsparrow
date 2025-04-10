'use client'

import Script from 'next/script'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { CredentialResponse } from '@/lib/types/google.types' // Import the type

// Global types for window.google are now defined in lib/types/google.types.ts

const GoogleOneTapComponent = () => {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const initializeGoogleOneTap = async () => {
      console.log('Initializing Google One Tap')
      window.addEventListener('load', async () => {
        const response = await fetch('/api/nonce')
        const { nonce, hashedNonce } = await response.json()

        // Check if there's already an existing session before initializing the one-tap UI
        const { data: sessionData, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session', error)
        }
        if (sessionData.session) {
          router.push('/')
          return
        }

        // Initialize Google One Tap
        window.google?.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: async (response: CredentialResponse) => {
            // Ensure the credential exists before proceeding
            if (!response.credential) {
              console.error('Google One Tap callback received no credential.');
              // Optionally display an error message to the user here
              return;
            }

            try {
              // Send ID token to Supabase (now we know response.credential is a string)
              const { error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
                nonce,
              });

              if (error) throw error;
              console.log('Successfully logged in with Google One Tap')

              // Redirect to protected page
              router.push('/')
            } catch (error) {
              console.error('Error logging in with Google One Tap', error)
            }
          },
          nonce: hashedNonce,
          // Use FedCM for Chrome's third-party cookie phase-out
          use_fedcm_for_prompt: true,
        })
        
        // Display the One Tap UI
        window.google?.accounts.id.prompt()
      })
    }
    
    initializeGoogleOneTap()
    return () => window.removeEventListener('load', initializeGoogleOneTap)
  }, [router, supabase.auth])

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" />
      <div id="oneTap" className="fixed top-0 right-0 z-[100]" />
    </>
  )
}

export default GoogleOneTapComponent
