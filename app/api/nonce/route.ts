import { NextResponse } from 'next/server';
//import { cookies } from 'next/headers';
//import { createClient } from '@/utils/supabase/server';

export async function GET() {
  //const supabase = createClient();

  const generateNonce = async (): Promise<string[]> => {
    // Generate 32 random bytes
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    // Convert bytes to a binary string (each character code 0-255) safely
    const binaryString = String.fromCharCode(...randomBytes);
    // Encode the binary string to Base64
    const nonce = btoa(binaryString);

    // Hash the Base64 nonce string
    const encoder = new TextEncoder();
    const encodedNonce = encoder.encode(nonce); // Encode the Base64 string
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    return [nonce, hashedNonce];
  };

  const [nonce, hashedNonce] = await generateNonce();

  return NextResponse.json({ nonce, hashedNonce });
}
