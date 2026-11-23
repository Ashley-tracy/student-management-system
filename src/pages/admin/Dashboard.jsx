import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function AdminDashboard() {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ students: 0, trainers: 0, courses: 0, trainings: 0 })
  const [recentStudents, setRecentStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  // Re-fetch data whenever the route changes to this page (e.g., clicking "Dashboard" in sidebar)
  useEffect(() => {
    fetchAdminData()
  }, [location.key])

  const fetchAdminData = async () => {
    try {
      // 1. Verify Session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/admin/login')
        return
      }

      // 2. Fetch Admin Profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single()
      if (prof) setProfile(prof)

      // 3. Fetch Stats & Recent Students in parallel
      const [studentsRes, trainersRes, coursesRes, trainingsRes, recentRes] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('trainers').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        // Wrap in try/catch logic if training_programs doesn't exist yet
        supabase.from('training_programs').select('*', { count: 'exact', head: true }).then(r => r).catch(() => ({ count: 0 })),
        
        // Fetch recent students with their profile name and course title
        supabase
          .from('students')
          .select(`
            created_at, 
            admission_no, 
            profiles (full_name), 
            enrollments (
              courses (title)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(3)
      ])
      
      setStats({
        students: studentsRes.count || 0,
        trainers: trainersRes.count || 0,
        courses: coursesRes.count || 0,
        trainings: trainingsRes?.count || 0 
      })

      if (recentRes.data) {
        setRecentStudents(recentRes.data)
      }
    } catch (error) {
      console.error("Dashboard Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  if (loading) return <div className="min-h-screen bg-[#DCECF2] flex items-center justify-center font-sans text-black">Loading...</div>

  return (
    <div className="min-h-screen bg-[#DCECF2] flex font-sans">
      
      {/* Sidebar */}
      <div className="w-64 bg-[#1B365D] text-white flex flex-col justify-between py-8 px-8 shadow-md">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-5">
            <p className="text-lg font-medium tracking-wide mb-2">SMS</p>
            {/* The location.key dependency above ensures clicking this link soft-refreshes the data */}
            <Link to="/admin/dashboard" className="text-sm font-medium hover:text-gray-300">Dashboard</Link>
            <Link to="/admin/students" className="text-sm font-medium hover:text-gray-300">Students</Link>
            <Link to="/admin/trainers" className="text-sm font-medium hover:text-gray-300">Trainers</Link>
            <Link to="/admin/courses" className="text-sm font-medium hover:text-gray-300">Courses</Link>
          </div>
          
          <div className="mt-4">
            <Link to="/admin/settings" className="text-sm font-medium hover:text-gray-300">Settings</Link>
          </div>
        </div>
        
        <div>
          <button onClick={handleLogout} className="text-sm font-medium hover:underline text-left">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 md:p-16 flex flex-col relative overflow-y-auto">
        
        {/* Top Right Admin Name */}
        <div className="absolute top-10 right-16">
          <p className="text-sm font-medium text-black">{profile?.full_name || 'Admin'}</p>
        </div>

        {/* Welcome Header */}
        <div className="mb-10 mt-4">
          <h1 className="text-3xl font-normal text-black mb-2">Admin Dashboard</h1>
          <p className="text-sm text-gray-800">Welcome back, {profile?.full_name?.split(' ')[0] || 'Admin'}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-sm shadow-sm flex flex-col justify-center h-32">
            <p className="text-xs text-gray-500 mb-2">Total</p>
            <p className="text-base font-medium text-black">Students</p>
            <p className="text-2xl font-bold text-black mt-2">{stats.students}</p>
          </div>
          <div className="bg-white p-6 rounded-sm shadow-sm flex flex-col justify-center h-32">
            <p className="text-xs text-gray-500 mb-2">Total</p>
            <p className="text-base font-medium text-black">Trainers</p>
            <p className="text-2xl font-bold text-black mt-2">{stats.trainers}</p>
          </div>
          <div className="bg-white p-6 rounded-sm shadow-sm flex flex-col justify-center h-32">
            <p className="text-xs text-gray-500 mb-2">Total</p>
            <p className="text-base font-medium text-black">Courses</p>
            <p className="text-2xl font-bold text-black mt-2">{stats.courses}</p>
          </div>
          <div className="bg-white p-6 rounded-sm shadow-sm flex flex-col justify-center h-32">
            <p className="text-xs text-gray-500 mb-2">Total</p>
            <p className="text-base font-medium text-black">Trainings</p>
            <p className="text-2xl font-bold text-black mt-2">{stats.trainings}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 flex-1">
          
          {/* Recent Registrations Table */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-black">Recent Registration</h2>
              <Link 
                to="/admin/students" 
                className="bg-white text-black text-xs font-medium px-5 py-2.5 shadow-sm hover:bg-gray-50 transition-colors"
              >
                View All →
              </Link>
            </div>
            
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-800 text-sm border-b border-gray-300">
                  <th className="font-normal pb-4 w-1/3">Student Name</th>
                  <th className="font-normal pb-4 w-1/3">Course</th>
                  <th className="font-normal pb-4 w-1/3">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm text-black">
                {recentStudents.length > 0 ? (
                  recentStudents.map((student, i) => (
                    <tr key={i} className="border-b border-transparent hover:bg-gray-50/50">
                      <td className="py-4">
                        {/* Fallback to admission_no or Unknown if profile isn't linked yet */}
                        {student.profiles?.full_name || student.admission_no || 'Unknown'}
                      </td>
                      <td className="py-4">{student.enrollments?.[0]?.courses?.title || 'Not Enrolled'}</td>
                      <td className="py-4">
                        {new Date(student.created_at).toLocaleDateString('en-US', { 
                          month: 'short', day: 'numeric', year: 'numeric' 
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-4 text-gray-500">No recent students</td>
                    <td className="py-4">-</td>
                    <td className="py-4">-</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Actions */}
          <div className="w-full lg:w-72">
            <h2 className="text-xl text-black mb-6">Quick Actions</h2>
            <div className="flex flex-col gap-4">
              {/* By appending ?action=new, we can tell the next page to auto-open the Add Modal */}
              <Link 
                to="/admin/students?action=new" 
                className="bg-white text-black text-sm font-medium px-6 py-4 shadow-sm hover:bg-gray-50 block transition-colors"
              >
                Add Student
              </Link>
              <Link 
                to="/admin/trainers?action=new" 
                className="bg-white text-black text-sm font-medium px-6 py-4 shadow-sm hover:bg-gray-50 block transition-colors"
              >
                Add Trainer
              </Link>
              <Link 
                to="/admin/courses?action=new" 
                className="bg-white text-black text-sm font-medium px-6 py-4 shadow-sm hover:bg-gray-50 block transition-colors"
              >
                Add Course
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default AdminDashboard