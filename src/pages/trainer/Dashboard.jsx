import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function TrainerDashboard() {
  const [profile, setProfile] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTrainerData()
  }, [])

  const fetchTrainerData = async () => {
    // 1. Get logged in user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 2. Get profile
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(prof)

    // 3. Get trainer record
    const { data: trainer } = await supabase
      .from('trainers')
      .select('*')
      .eq('profile_id', user.id)
      .single()

    // 4. Get courses assigned to this trainer
    if (trainer) {
      const { data: assignedCourses } = await supabase
        .from('course_trainers')
        .select('courses (id, title, duration_weeks)')
        .eq('trainer_id', trainer.id)
      
      if (assignedCourses) {
        // Format the data nicely
        const formatted = assignedCourses.map(c => c.courses)
        setCourses(formatted)
      }
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">Loading...</div>

  // Get first name for the welcome message
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Trainer'

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 flex items-center justify-center font-sans">
      
      {/* Main Dashboard Container */}
      <div className="bg-[#DCECF2] w-full max-w-6xl h-[80vh] flex shadow-sm">
        
        {/* Left Sidebar - Dark Navy */}
        <div className="w-48 bg-[#1B365D] text-white flex flex-col justify-between py-6 px-6">
          <div className="flex flex-col gap-6">
            <p className="text-sm font-medium tracking-wide">SMS</p>
            <p className="text-xs font-medium tracking-wide">Dashboard</p>
          </div>
          <div>
            <button onClick={handleLogout} className="text-xs font-medium hover:underline text-left">
              Logout
            </button>
          </div>
        </div>

        {/* Right Main Content Area */}
        <div className="flex-1 p-8 md:p-12 flex flex-col relative overflow-y-auto">
          
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-normal text-black mb-1">Welcome, {firstName}!</h1>
            <p className="text-sm text-gray-700">Here are your courses</p>
          </div>

          {/* Top 3 Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16 max-w-2xl">
            <button className="bg-white text-black text-sm font-medium p-6 rounded-sm shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
              My courses
            </button>
            <button className="bg-white text-black text-sm font-medium p-6 rounded-sm shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
              My Students
            </button>
            <button className="bg-white text-black text-sm font-medium p-6 rounded-sm shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
              Next Session
            </button>
          </div>

          {/* Course List Section */}
          <div className="flex-1 flex flex-col">
            
            {/* Section Header with View All Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg text-[#3B69B8]">My Courses</h2>
              <button className="bg-[#3B69B8] hover:bg-[#2d5497] text-white text-sm font-medium px-6 py-1.5 rounded-sm transition-colors flex items-center gap-2">
                View all <span>→</span>
              </button>
            </div>

            {/* List of Courses */}
            <div className="flex flex-col gap-6">
              {courses.length > 0 ? (
                courses.map((course, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-medium text-black">{course.title}</h3>
                      <p className="text-sm text-gray-700 mt-1">Nov 2026-March 2027</p>
                    </div>
                    <button className="bg-[#3B69B8] hover:bg-[#2d5497] text-white text-xs font-medium px-4 py-1.5 rounded-sm transition-colors">
                      View Students
                    </button>
                  </div>
                ))
              ) : (
                // Fallback if no courses are assigned yet
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-medium text-black">Data Science</h3>
                    <p className="text-sm text-gray-700 mt-1">Nov 2026-March 2027</p>
                  </div>
                  <button className="bg-[#3B69B8] hover:bg-[#2d5497] text-white text-xs font-medium px-4 py-1.5 rounded-sm transition-colors">
                    View Students
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

export default TrainerDashboard