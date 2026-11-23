import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch profile safely — never leaves `loading` true on failure
  const fetchProfile = useCallback(async (userId, isMounted) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', userId)
        .maybeSingle() // safer than .single() — returns null instead of throwing

      if (isMounted?.()) {
        if (error) {
          console.error('[auth] profile fetch failed', error)
          setProfile(null)
        } else {
          setProfile(data || null)
        }
        setLoading(false)
      }
    } catch (err) {
      console.error('[auth] unexpected', err)
      if (isMounted?.()) {
        setProfile(null)
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const isMounted = () => mounted

    // 1. Initial session
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return
      if (error) {
        console.error('[auth] getSession failed', error)
        setLoading(false)
        return
      }
      setSession(data.session)
      if (data.session?.user?.id) {
        fetchProfile(data.session.user.id, isMounted)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    // 2. Live auth updates
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return
      setSession(newSession)
      if (newSession?.user?.id) {
        setLoading(true) // show loader while we re-fetch
        fetchProfile(newSession.user.id, isMounted)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}