import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ allow }) {
  const { session, profile, loading } = useAuth()

  if (loading) return <div className="p-8 text-center">Loading…</div>
  if (!session) return <Navigate to={allow?.includes('admin') ? '/admin/login' : '/login'} replace />
  if (!profile) return <div className="p-8 text-center">Loading profile…</div>
  if (allow && !allow.includes(profile.role)) {
    const home = profile.role === 'admin' ? '/admin' : profile.role === 'trainer' ? '/trainer' : '/student'
    return <Navigate to={home} replace />
  }
  return <Outlet />
}