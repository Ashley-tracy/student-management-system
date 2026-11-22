import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Attempt to sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Fetch their profile to verify they are an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      setError('Could not fetch user profile.')
      setLoading(false)
      return
    }

    // Strict check: If they aren't an admin, kick them out
    if (profile.role !== 'admin') {
      await supabase.auth.signOut()
      setError('Access denied. You are not an administrator.')
      setLoading(false)
      return
    }

    // Success: Send to admin dashboard
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-[#D8E8ED] flex items-center justify-center p-4 font-sans">
      
      {/* White Card Container - shifted slightly to the right */}
      <div className="bg-white w-full max-w-2xl py-16 px-8 md:px-24 shadow-sm ml-0 md:ml-32 lg:ml-48">
        
        {/* Headers */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-medium text-black mb-2">SMS</h1>
          <h2 className="text-2xl font-medium text-black mb-2">Admin Login</h2>
          <p className="text-sm text-gray-700">Access the Student Management System</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-8">
          
          {/* Email Input */}
          <div>
            <input 
              type="email" 
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#F4F4F4] text-black placeholder-gray-500 p-4 outline-none focus:ring-2 focus:ring-[#2FA6D9]"
            />
          </div>

          {/* Password Input */}
          <div>
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#F4F4F4] text-black placeholder-gray-500 p-4 outline-none focus:ring-2 focus:ring-[#2FA6D9]"
            />
          </div>

          {/* Submit Button */}
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

        {/* Back Link */}
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