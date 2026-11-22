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

    // CLEAR THE FIELDS IMMEDIATELY
    setEmail('')
    setPassword('')

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const { data: role, error: roleError } = await supabase.rpc('get_my_role')

    if (roleError || !role) {
      setError('Could not verify user role.')
      setLoading(false)
      return
    }

    if (role !== 'admin') {
      await supabase.auth.signOut()
      setError('Access denied. You are not an administrator.')
      setLoading(false)
      return
    }

    // Fetch the profile name right here so the dashboard doesn't have to wait for it
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', authData.user.id)
      .single()

    // Navigate instantly and pass BOTH the session and the name
    navigate('/admin/dashboard', { 
      state: { 
        session: authData.session,
        adminName: profileData?.full_name || 'Admin'
      } 
    })
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
          <div className="bg-red-50 text-red-600 text-sm p-3 mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-8">
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