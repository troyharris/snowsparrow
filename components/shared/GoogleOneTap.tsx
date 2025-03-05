'use client'

import Script from 'next/script'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Add TypeScript definition for Google One Tap
interface CredentialResponse {
  credential: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: CredentialResponse) => void;
            nonce: string;
            use_fedcm_for_prompt: boolean;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GoogleOneTapComponent = () => {
  const supabase = createClient()
  const router = useRouter()

  // Generate nonce for security
  const generateNonce = async (): Promise<string[]> => {
    const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
    const encoder = new TextEncoder()
    const encodedNonce = encoder.encode(nonce)
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

    return [nonce, hashedNonce]
  }

  useEffect(() => {
    const initializeGoogleOneTap = () => {
      console.log('Initializing Google One Tap')
      window.addEventListener('load', async () => {
        const [nonce, hashedNonce] = await generateNonce()
        
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
            try {
              // Send ID token to Supabase
              const { error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
                nonce,
              })

              if (error) throw error
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
