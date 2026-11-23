import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 5 * 60 * 1000 // 5 minutes

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Check lockout on mount
  useEffect(() => {
    const until = parseInt(localStorage.getItem('login_lockout') || '0', 10)
    if (until && Date.now() < until) {
      const mins = Math.ceil((until - Date.now()) / 60000)
      setError(`Too many failed attempts. Try again in ${mins} minute(s).`)
    }
  }, [])

  const getAttempts = () => parseInt(localStorage.getItem('login_attempts') || '0', 10)
  const setAttempts = (n) => localStorage.setItem('login_attempts', String(n))
  const lockOut = () => {
    localStorage.setItem('login_lockout', String(Date.now() + LOCKOUT_MS))
    setAttempts(0)
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    // 1. Lockout gate
    const lockUntil = parseInt(localStorage.getItem('login_lockout') || '0', 10)
    if (lockUntil && Date.now() < lockUntil) {
      const mins = Math.ceil((lockUntil - Date.now()) / 60000)
      setError(`Too many failed attempts. Try again in ${mins} minute(s).`)
      return
    }

    setLoading(true)
    setError(null)

    const attemptedEmail = email.trim().toLowerCase()
    const attemptedPassword = password
    setPassword('') // Clear immediately for security

    try {
      // 2. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: attemptedEmail,
        password: attemptedPassword,
      })

      if (authError) {
        const attempts = getAttempts() + 1
        setAttempts(attempts)
        if (attempts >= MAX_ATTEMPTS) lockOut()

        console.error('[login]', authError.message)
        setError('Invalid credentials. Please try again.')
        setLoading(false)
        return
      }

      // 3. Fetch role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', authData.user.id)
        .single()

      if (profileError || !profile) {
        console.error('[login] profile lookup failed', profileError)
        await supabase.auth.signOut()
        setError('Account error: Profile not found. Contact an administrator.')
        setLoading(false)
        return
      }

      // 4. Sanitize and check role
      const userRole = profile.role ? profile.role.toLowerCase().trim() : ''

      // Reset lockout counters on success
      setAttempts(0)
      localStorage.removeItem('login_lockout')
      setEmail('')

      // 5. Route to the correct dashboard
      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else if (userRole === 'trainer') {
        navigate('/trainer/dashboard', { replace: true })
      } else if (userRole === 'student') {
        navigate('/student/dashboard', { replace: true })
      } else {
        await supabase.auth.signOut()
        setError(`Unknown user role: "${profile.role}". Please contact an administrator.`)
      }

    } catch (err) {
      console.error('[login] unexpected', err)
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 font-sans">
      
      {/* Main Blue Container */}
      <div className="bg-[#D8E8ED] p-8 md:p-12 w-full max-w-2xl rounded-sm shadow-sm flex justify-center">
        
        {/* White Login Card */}
        <div className="bg-white w-full max-w-md p-8 md:p-10 shadow-sm border border-gray-100">
          
          <h1 className="text-3xl font-bold text-center text-black mb-8">
            Login
          </h1>

          {error && (
            <div role="alert" className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5" autoComplete="off" noValidate>
            
            {/* Email Input */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-800 mb-1 ml-1">Email:</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                className="border border-gray-400 p-2 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-800 mb-1 ml-1">Password:</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="border border-gray-400 p-2 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-[#3B69B8] hover:bg-[#2d5497] text-white font-medium py-2 px-8 transition-colors disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-8 flex flex-col items-center gap-4 text-sm text-gray-800">
            <Link to="/forgot-password" className="hover:underline">
              Forgot password
            </Link>
            <p>
              No account? Contact your administrator.
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}

export default Login