import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Attempt to sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Fetch their profile to determine their role
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

    // Redirect based on role
    if (profile.role === 'admin') navigate('/admin')
    else if (profile.role === 'trainer') navigate('/trainer')
    else navigate('/student')
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
            <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 rounded text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            
            {/* Email Input */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-800 mb-1 ml-1">Email:</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
              No account? Sign up from admin
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}

export default Login