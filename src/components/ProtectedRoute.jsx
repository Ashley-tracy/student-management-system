import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

export default function ProtectedRoute({ allow }) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  // Orphan session: auth exists but no profile row. Sign out and bounce.
  useEffect(() => {
    if (!loading && session && !profile) {
      console.warn('[protected-route] session without profile — signing out')
      supabase.auth.signOut()
    }
  }, [loading, session, profile])

  // 1. Still fetching session/profile → spinner
  if (loading) {
    return <div className="p-8 text-center text-gray-700">Loading…</div>
  }

  // 2. No session → go to the correct login page
  if (!session) {
    const loginPath = allow?.includes('admin') ? '/admin/login' : '/login'
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />
  }

  // 3. Session exists but profile missing → orphan; sign-out is in flight above,
  //    show a message and a manual fallback in case signOut stalls
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-8 text-center font-sans">
        <div>
          <p className="mb-4 text-gray-800">
            We couldn't load your profile. Please sign in again.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Sign out & retry
          </button>
        </div>
      </div>
    )
  }

  // 4. Role mismatch → send to their own dashboard (not the bare /admin)
  if (allow && !allow.includes(profile.role)) {
    const home =
      profile.role === 'admin'
        ? '/admin/dashboard'
        : profile.role === 'trainer'
          ? '/trainer/dashboard'
          : '/student/dashboard'
    return <Navigate to={home} replace />
  }

  // 5. Authorized
  return <Outlet />
}