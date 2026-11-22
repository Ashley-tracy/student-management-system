import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function AdminDashboard() {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ students: 0, trainers: 0, courses: 0, trainings: 0 })
  const [recentStudents, setRecentStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Get Admin Profile for the top right name
    const { data: prof } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    setProfile(prof)

    // 2. Fetch Stats (using count)
    const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true })
    const { count: trainerCount } = await supabase.from('trainers').select('*', { count: 'exact', head: true })
    const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true })
    
    // We'll just use courseCount for trainings for now, or you can add a 'sessions' table later
    setStats({
      students: studentCount || 0,
      trainers: trainerCount || 0,
      courses: courseCount || 0,
      trainings: courseCount || 0 
    })

    // 3. Fetch Recent Registrations (latest 3 students)
    const { data: recent } = await supabase
      .from('students')
      .select(`
        created_at,
        admission_no,
        profiles (full_name),
        enrollments (courses (title))
      `)
      .order('created_at', { ascending: false })
      .limit(3)

    if (recent) {
      setRecentStudents(recent)
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">Loading...</div>

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 flex items-center justify-center font-sans">
      
      {/* Main Dashboard Container */}
      <div className="bg-[#DCECF2] w-full max-w-7xl h-[85vh] flex shadow-sm">
        
        {/* Left Sidebar - Dark Navy */}
        <div className="w-52 bg-[#1B365D] text-white flex flex-col justify-between py-8 px-6">
          <div className="flex flex-col gap-8">
            {/* Top Navigation */}
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium tracking-wide mb-2">SMS</p>
              <Link to="/admin/dashboard" className="text-sm font-medium hover:text-gray-300">Dashboard</Link>
              <Link to="/admin/students" className="text-sm font-medium hover:text-gray-300">Students</Link>
              <Link to="/admin/trainers" className="text-sm font-medium hover:text-gray-300">Trainers</Link>
              <Link to="/admin/courses" className="text-sm font-medium hover:text-gray-300">Courses</Link>
            </div>
            
            {/* Bottom Navigation */}
            <div className="mt-8">
              <Link to="/admin/settings" className="text-sm font-medium hover:text-gray-300">Settings</Link>
            </div>
          </div>
          
          <div>
            <button onClick={handleLogout} className="text-sm font-medium hover:underline text-left">
              Logout
            </button>
          </div>
        </div>

        {/* Right Main Content Area */}
        <div className="flex-1 p-8 md:p-12 flex flex-col relative overflow-y-auto">
          
          {/* Top Right Admin Name */}
          <div className="absolute top-8 right-12">
            <p className="text-sm font-medium text-black">{profile?.full_name || 'Admin'}</p>
          </div>

          {/* Welcome Header */}
          <div className="mb-8 mt-4">
            <h1 className="text-2xl font-normal text-black mb-1">Admin Dashboard</h1>
            <p className="text-sm text-gray-700">Welcome back, {profile?.full_name?.split(' ')[0] || 'Admin'}!</p>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-white p-5 rounded-sm shadow-sm flex flex-col justify-center h-24">
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="text-base font-medium text-black">Students</p>
            </div>
            <div className="bg-white p-5 rounded-sm shadow-sm flex flex-col justify-center h-24">
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="text-base font-medium text-black">Trainers</p>
            </div>
            <div className="bg-white p-5 rounded-sm shadow-sm flex flex-col justify-center h-24">
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="text-base font-medium text-black">Courses</p>
            </div>
            <div className="bg-white p-5 rounded-sm shadow-sm flex flex-col justify-center h-24">
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="text-base font-medium text-black">Trainings</p>
            </div>
          </div>

          {/* Bottom Section: Recent Registrations & Quick Actions */}
          <div className="flex flex-col md:flex-row gap-12 flex-1">
            
            {/* Left: Recent Registrations Table */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg text-black">Recent Registration</h2>
                <button className="bg-white text-black text-xs font-medium px-4 py-2 shadow-sm hover:bg-gray-50">
                  View All →
                </button>
              </div>
              
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-700 text-sm border-b border-gray-300">
                    <th className="font-normal pb-3 w-1/3">Student Name</th>
                    <th className="font-normal pb-3 w-1/3">Course</th>
                    <th className="font-normal pb-3 w-1/3">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-black">
                  {recentStudents.length > 0 ? (
                    recentStudents.map((student, i) => (
                      <tr key={i} className="border-b border-transparent">
                        <td className="py-3">{student.profiles?.full_name || 'Unknown'}</td>
                        <td className="py-3">{student.enrollments?.[0]?.courses?.title || 'N/A'}</td>
                        <td className="py-3">{new Date(student.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      </tr>
                    ))
                  ) : (
                    // Fallback rows if no recent students exist
                    <>
                      <tr><td className="py-3">Ashley Tracy</td><td className="py-3">Web Development</td><td className="py-3">Nov 17 2026</td></tr>
                      <tr><td className="py-3">John Doe</td><td className="py-3">Data Science</td><td className="py-3">Nov 16 2026</td></tr>
                      <tr><td className="py-3">Princess Cherie</td><td className="py-3">Cyber Security</td><td className="py-3">Nov 15 2026</td></tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Right: Quick Actions */}
            <div className="w-full md:w-64">
              <h2 className="text-lg text-black mb-4">Quick Actions</h2>
              <div className="flex flex-col gap-3">
                <Link to="/admin/students" className="bg-white text-black text-sm font-medium px-4 py-3 shadow-sm hover:bg-gray-50 block transition-colors">
                  Add Student
                </Link>
                <Link to="/admin/trainers" className="bg-white text-black text-sm font-medium px-4 py-3 shadow-sm hover:bg-gray-50 block transition-colors">
                  Add Trainer
                </Link>
                <Link to="/admin/courses" className="bg-white text-black text-sm font-medium px-4 py-3 shadow-sm hover:bg-gray-50 block transition-colors">
                  Add Course
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

export default AdminDashboard