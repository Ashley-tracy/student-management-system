import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 5 * 60 * 1000 // 5 minutes

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Check lockout on mount
  useEffect(() => {
    const until = parseInt(localStorage.getItem('admin_login_lockout') || '0', 10)
    if (until && Date.now() < until) {
      const mins = Math.ceil((until - Date.now()) / 60000)
      setError(`Too many failed attempts. Try again in ${mins} minute(s).`)
    }
  }, [])

  const getAttempts = () =>
    parseInt(localStorage.getItem('admin_login_attempts') || '0', 10)

  const setAttempts = (n) => localStorage.setItem('admin_login_attempts', String(n))

  const lockOut = () => {
    localStorage.setItem('admin_login_lockout', String(Date.now() + LOCKOUT_MS))
    setAttempts(0)
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    // --- Security gate 1: lockout ---
    const lockUntil = parseInt(localStorage.getItem('admin_login_lockout') || '0', 10)
    if (lockUntil && Date.now() < lockUntil) {
      const mins = Math.ceil((lockUntil - Date.now()) / 60000)
      setError(`Too many failed attempts. Try again in ${mins} minute(s).`)
      return
    }

    setLoading(true)
    setError(null)

    // --- Security gate 2: clear password from state/DOM immediately ---
    const attemptedEmail = email.trim().toLowerCase()
    const attemptedPassword = password
    setPassword('')

    try {
      // 1. Authenticate
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: attemptedEmail,
          password: attemptedPassword,
        })

      if (authError) {
        // Generic message so attackers can't distinguish "wrong email" vs "wrong password"
        const attempts = getAttempts() + 1
        setAttempts(attempts)
        if (attempts >= MAX_ATTEMPTS) lockOut()

        // Log real error for debugging, but never show it
        console.error('[admin-login]', authError.message)
        setError('Invalid credentials. Please try again.')
        setLoading(false)
        return
      }

      // 2. Verify admin role server-side (JWT can't be forged, but role must be re-checked)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', authData.user.id)
        .single()

      if (profileError || !profile) {
        console.error('[admin-login] profile lookup failed', profileError)
        await supabase.auth.signOut()
        setError('Access denied. Please contact an administrator.')
        setLoading(false)
        return
      }

      if (profile.role !== 'admin') {
        await supabase.auth.signOut()
        setError('Access denied. You are not an administrator.')
        setLoading(false)
        return
      }

      // 3. Success — reset attempts and clear form fully
      setAttempts(0)
      localStorage.removeItem('admin_login_lockout')
      setEmail('')

      navigate('/admin/dashboard', {
        replace: true, // don't leave login page in history
        state: {
          adminName: profile.full_name,
        },
      })
    } catch (err) {
      console.error('[admin-login] unexpected', err)
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#D8E8ED] flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-2xl py-16 px-8 md:px-24 shadow-sm ml-0 md:ml-32 lg:ml-48">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-medium text-black mb-2">SMS</h1>
          <h2 className="text-2xl font-medium text-black mb-2">Admin Login</h2>
          <p className="text-sm text-gray-700">Access the Student Management System</p>
        </div>

        {error && (
          <div
            role="alert"
            className="bg-red-50 text-red-600 text-sm p-3 mb-6 text-center"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-8"
          autoComplete="off"
          noValidate
        >
          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              className="w-full bg-[#F4F4F4] text-black placeholder-gray-500 p-4 outline-none focus:ring-2 focus:ring-[#2FA6D9]"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full bg-[#F4F4F4] text-black placeholder-gray-500 p-4 outline-none focus:ring-2 focus:ring-[#2FA6D9]"
            />
          </div>

          <div className="mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#29A3D9] hover:bg-[#1E8DBC] text-white font-medium py-4 transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <div className="mt-10 text-center">
          <Link to="/" className="text-[#3B69B8] text-sm hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin