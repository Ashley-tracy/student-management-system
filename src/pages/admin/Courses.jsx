import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function Courses() {
  const [courses, setCourses] = useState([])
  const [trainers, setTrainers] = useState([]) // For the dropdown
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    duration_weeks: '',
    trainerId: ''
  })

  const navigate = useNavigate()

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    // 1. Fetch Courses
    const { data: coursesData, error } = await supabase
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

    if (!error && coursesData) setCourses(coursesData)

    // 2. Fetch Trainers for the dropdown
    const { data: trainersData } = await supabase
      .from('trainers')
      .select(`id, profiles (full_name)`)

    if (trainersData) setTrainers(trainersData)

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  // Handle Add Course Form Submit
  const handleAddCourse = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // 1. Insert the Course
    const { data: newCourse, error: courseError } = await supabase
      .from('courses')
      .insert({
        code: formData.code,
        title: formData.title,
        duration_weeks: parseInt(formData.duration_weeks),
        is_active: true
      })
      .select()
      .single()

    if (courseError) {
      alert('Error creating course: ' + courseError.message)
      setIsSubmitting(false)
      return
    }

    // 2. Assign the Trainer (if one was selected)
    if (formData.trainerId) {
      const { error: linkError } = await supabase
        .from('course_trainers')
        .insert({
          course_id: newCourse.id,
          trainer_id: formData.trainerId
        })
      
      if (linkError) {
        alert('Course created, but failed to assign trainer: ' + linkError.message)
      }
    }

    // 3. Refresh the list and close modal
    await fetchInitialData()
    setIsSubmitting(false)
    closeModalAndReset()
  }

  const closeModalAndReset = () => {
    setIsModalOpen(false)
    setFormData({ code: '', title: '', duration_weeks: '', trainerId: '' })
  }

  // Filter courses based on search input
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#D8E8ED] flex font-sans relative overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-48 bg-[#1B365D] text-white flex flex-col justify-between py-8 px-6 shadow-md z-10">
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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#3B69B8] hover:bg-[#2d5497] text-white text-sm font-medium px-6 py-2.5 rounded-sm shadow-sm transition-colors"
          >
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
                          <button className="hover:scale-110 transition-transform">✏️</button>
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

      {/* ADD COURSE SLIDE-OVER MODAL */}
      <div 
        className={`absolute top-0 right-0 h-full w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isModalOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-8 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-medium text-black">Add New Course</h2>
            <button onClick={closeModalAndReset} className="text-gray-500 hover:text-black text-2xl leading-none">&times;</button>
          </div>

          <form onSubmit={handleAddCourse} className="flex flex-col gap-5 flex-1">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Course Code</label>
              <input 
                type="text" required placeholder="e.g. CS102"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="w-full bg-[#F4F4F4] p-3 text-sm outline-none border border-transparent focus:border-[#3B69B8]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Course Title</label>
              <input 
                type="text" required placeholder="e.g. Web Development"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-[#F4F4F4] p-3 text-sm outline-none border border-transparent focus:border-[#3B69B8]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Duration (Weeks)</label>
              <input 
                type="number" required placeholder="e.g. 12"
                value={formData.duration_weeks}
                onChange={(e) => setFormData({...formData, duration_weeks: e.target.value})}
                className="w-full bg-[#F4F4F4] p-3 text-sm outline-none border border-transparent focus:border-[#3B69B8]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Assign Trainer</label>
              <select 
                value={formData.trainerId}
                onChange={(e) => setFormData({...formData, trainerId: e.target.value})}
                className="w-full bg-[#F4F4F4] p-3 text-sm outline-none border border-transparent focus:border-[#3B69B8]"
              >
                <option value="">Select a trainer (optional)...</option>
                {trainers.map(trainer => (
                  <option key={trainer.id} value={trainer.id}>{trainer.profiles?.full_name}</option>
                ))}
              </select>
            </div>

            <div className="mt-auto pt-6">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#3B69B8] text-white py-3 rounded-sm hover:bg-[#2d5497] disabled:opacity-50 font-medium transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Overlay backdrop */}
      {isModalOpen && (
        <div 
          onClick={closeModalAndReset}
          className="absolute inset-0 bg-black/20 z-40"
        ></div>
      )}

    </div>
  )
}

export default Courses