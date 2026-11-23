import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Don't crash the app at import time, just log a clear error
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!supabaseConfigured) {
  console.error(
    "Missing Supabase env vars. Check your .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server."
  )
}

// Temporary debug — remove after confirming login works
console.log("SUPABASE URL:", supabaseUrl)

// Create the client. We use placeholders only so the app doesn't crash on load if env vars are missing.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
)