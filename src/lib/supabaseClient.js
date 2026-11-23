import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Temporary debug — remove after confirming login works
console.log("SUPABASE URL:", supabaseUrl)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Check your .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server."
  )
}

// Single shared client instance — import this everywhere
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})
