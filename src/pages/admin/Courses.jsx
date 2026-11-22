import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function Courses() {
  const [courses, setCourses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    // Fetch courses and join the trainers table to get the trainer's name
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        code,
        title,
        duration_weeks,
        is_active,
        course_trainers (
          trainers (
            profiles (full_name)
          )
        )
      `)
      .order('code', { ascending: true })

    if (!error && data) {
      setCourses(data)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  // Filter courses based on search input
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#D8E8ED] flex font-sans">
      
      {/* Sidebar */}
      <div className="w-48 bg-[#1B365D] text-white flex flex-col justify-between py-8 px-6 shadow-md">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-medium tracking-wide mb-2">SMS</p>
            <Link to="/admin/dashboard" className="text-xs font-medium hover:text-gray-300">Dashboard</Link>
            <Link to="/admin/students" className="text-xs font-medium hover:text-gray-300">Students</Link>
            <Link to="/admin/trainers" className="text-xs font-medium hover:text-gray-300">Trainers</Link>
            <Link to="/admin/courses" className="text-xs font-medium hover:text-gray-300">Courses</Link>
          </div>
          <div className="mt-8">
            <Link to="/admin/settings" className="text-xs font-medium hover:text-gray-300">Settings</Link>
          </div>
        </div>
        <div>
          <button onClick={handleLogout} className="text-xs font-medium hover:underline text-left">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 md:p-16 flex flex-col relative">
        
        {/* Header Row */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-normal text-black">Manage Courses</h1>
          <button className="bg-[#3B69B8] hover:bg-[#2d5497] text-white text-sm font-medium px-6 py-2.5 rounded-sm shadow-sm transition-colors">
            Add Course
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="Search courses...."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md bg-white text-black placeholder-gray-500 p-3 outline-none border border-gray-300 shadow-sm"
          />
        </div>

        {/* Table Container */}
        <div className="bg-white w-full max-w-5xl shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading courses...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-black text-sm">
                  <th className="font-normal py-3 px-4 border-b border-r border-gray-300 w-24">Code</th>
                  <th className="font-normal py-3 px-4 border-b border-r border-gray-300">Course Name</th>
                  <th className="font-normal py-3 px-4 border-b border-r border-gray-300 w-32">Duration</th>
                  <th className="font-normal py-3 px-4 border-b border-r border-gray-300">Trainer</th>
                  <th className="font-normal py-3 px-4 border-b border-r border-gray-300 w-32">Status</th>
                  <th className="font-normal py-3 px-4 border-b border-gray-300 w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-black">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => {
                    // Extract the trainer name from the nested join data
                    const trainerName = course.course_trainers?.[0]?.trainers?.profiles?.full_name || 'Unassigned'
                    
                    return (
                      <tr key={course.id} className="border-b border-gray-300">
                        <td className="py-3 px-4 border-r border-gray-300">{course.code}</td>
                        <td className="py-3 px-4 border-r border-gray-300">{course.title}</td>
                        <td className="py-3 px-4 border-r border-gray-300">{course.duration_weeks} Months</td>
                        <td className="py-3 px-4 border-r border-gray-300">{trainerName}</td>
                        <td className="py-3 px-4 border-r border-gray-300">
                          {course.is_active ? (
                            <span className="bg-[#6EE7B7] text-black text-xs font-medium px-4 py-1 rounded-sm">
                              Active
                            </span>
                          ) : (
                            <span className="bg-gray-300 text-black text-xs font-medium px-4 py-1 rounded-sm">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 flex gap-3 text-lg">
                          {/* Edit Icon */}
                          <button className="hover:scale-110 transition-transform">✏️</button>
                          {/* Delete Icon */}
                          <button className="hover:scale-110 transition-transform">❌</button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No courses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}

export default Courses