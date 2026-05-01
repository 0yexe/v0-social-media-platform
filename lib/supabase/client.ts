import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Agent ne bataya tha ki keys mix ho gayi hain, ye code unhe sahi check karega
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Agar galti se "KEY=VALUE" poora paste ho gaya ho, toh ye use saaf kar dega
  const cleanUrl = url.includes('=') ? url.split('=')[1] : url;
  const cleanKey = key.includes('=') ? key.split('=')[1] : key;

  return createBrowserClient(
    cleanUrl.trim(),
    cleanKey.trim()
  )
}
