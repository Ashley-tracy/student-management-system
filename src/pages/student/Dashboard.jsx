import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function StudentDashboard() {
  const [profile, setProfile] = useState(null)
  const [studentData, setStudentData] = useState(null)
  const [courseData, setCourseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchStudentData()
  }, [])

  const fetchStudentData = async () => {
    // 1. Get current auth user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 2. Get profile data
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(prof)

    // 3. Get student record (admission no, etc)
    const { data: student } = await supabase
      .from('students')
      .select('*')
      .eq('profile_id', user.id)
      .single()
    setStudentData(student)

    // 4. Get their enrolled course (taking the first active one)
    if (student) {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('courses (title)')
        .eq('student_id', student.id)
        .eq('status', 'active')
        .limit(1)
        .single()
      
      if (enrollment && enrollment.courses) {
        setCourseData(enrollment.courses)
      }
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 flex items-center justify-center font-sans">
      
      {/* Main Dashboard Container */}
      <div className="bg-[#D8E8ED] w-full max-w-6xl h-[85vh] flex shadow-sm">
        
        {/* Left Sidebar - Dark Navy */}
        <div className="w-48 bg-[#1B365D] text-white flex flex-col justify-between py-8 px-6">
          <div>
            <p className="text-xs font-medium tracking-wide">Dashboard</p>
          </div>
          <div>
            <button onClick={handleLogout} className="text-xs font-medium hover:underline text-left">
              Logout
            </button>
          </div>
        </div>

        {/* Right Main Content Area */}
        <div className="flex-1 p-8 md:p-12 flex flex-col relative">
          
          {/* Top Right Name */}
          <div className="absolute top-8 right-10">
            <p className="text-sm font-medium text-black">{profile?.full_name || 'Student Name'}</p>
          </div>

          {/* Top Section: Profile & Course Info */}
          <div className="flex flex-col md:flex-row mt-12 md:mt-8 gap-10">
            
            {/* Left Column: Avatar & Personal Info */}
            <div className="flex flex-col items-center md:items-start w-64">
              {/* Avatar Circle */}
              <div className="w-32 h-32 bg-white rounded-full mb-6"></div>
              
              {/* Details */}
              <div className="text-center md:text-left text-sm text-black leading-relaxed">
                <p className="font-medium">{profile?.full_name || 'Student Name'}</p>
                <p>{studentData?.admission_no || 'STU000'}</p>
                <p>{profile?.email || 'email@example.com'}</p>
              </div>

              {/* Edit Profile Button */}
              <button className="mt-6 bg-[#4A76C9] hover:bg-[#3a5f9e] text-white text-xs px-6 py-2 rounded-sm transition-colors shadow-sm">
                Edit Profile
              </button>
            </div>

            {/* Right Column: Course Details */}
            <div className="flex-1 md:mt-6">
              <h2 className="text-xl font-normal text-black mb-4">My Course Intake</h2>
              
              <div className="mb-1">
                {/* Course Title (Underlined like the wireframe) */}
                <a href="#" className="text-[#2D5E8E] underline text-sm font-medium">
                  {courseData?.title || 'Web Development'}
                </a>
              </div>
              
              <p className="text-xs text-black mb-12">
                Intake Nov 2026-Mar 2027
              </p>

              {/* Active Badge */}
              <div className="absolute top-24 right-10">
                <div className="bg-[#6EE7B7] text-black text-xs font-medium px-8 py-2 rounded-sm border border-[#34D399]">
                  Active
                </div>
              </div>

              {/* Quick Links Section */}
              <h2 className="text-xl font-normal text-black mb-4 mt-8">Quick Links</h2>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-black text-sm font-medium px-6 py-3 rounded-sm shadow-sm hover:bg-gray-50 transition-colors">
                  My Courses
                </button>
                <button className="bg-white text-black text-sm font-medium px-6 py-3 rounded-sm shadow-sm hover:bg-gray-50 transition-colors">
                  View schedule
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default StudentDashboard