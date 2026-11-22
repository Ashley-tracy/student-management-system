import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function Students() {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([]) // For the dropdown
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    admissionNo: '',
    courseId: ''
  })

  const navigate = useNavigate()

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    // 1. Fetch Students
    const { data: studentsData, error } = await supabase
      .from('students')
      .select(`
        id,
        admission_no,
        created_at,
        profiles (full_name, email),
        enrollments (courses (title))
      `)
      .order('created_at', { ascending: false })

    if (!error && studentsData) setStudents(studentsData)

    // 2. Fetch Courses for the dropdown
    const { data: coursesData } = await supabase
      .from('courses')
      .select('id, title')
      .eq('is_active', true)

    if (coursesData) setCourses(coursesData)

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  // Handle Add Student Form Submit
  const handleAddStudent = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // 1. Generate a random secure password for the student
    const tempPassword = `Stu!${Math.random().toString(36).slice(-6)}`
    
    // 2. Create the Auth User (We use supabase.auth.signUp)
    // In a real production app, you would use an Edge Function to prevent auto-login,
    // but for this school project, we will log them out immediately after creation.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: tempPassword,
      options: {
        data: {
          full_name: formData.fullName,
          role: 'student'
        }
      }
    })

    if (authError) {
      alert('Error creating student account: ' + authError.message)
      setIsSubmitting(false)
      return
    }

    const userId = authData.user.id

    // 3. Update the Student record (Profile is auto-created by our DB trigger)
    const { data: studentRecord, error: studentError } = await supabase
      .from('students')
      .insert({
        profile_id: userId,
        admission_no: formData.admissionNo,
      })
      .select()
      .single()

    if (studentError) {
      alert('Error creating student profile: ' + studentError.message)
      setIsSubmitting(false)
      return
    }

    // 4. Enroll them in the selected course
    if (formData.courseId) {
      await supabase.from('enrollments').insert({
        student_id: studentRecord.id,
        course_id: formData.courseId,
        status: 'active'
      })
    }

    // 5. Show the password to the admin and refresh the list
    setGeneratedPassword(tempPassword)
    fetchInitialData() 
    setIsSubmitting(false)
  }

  const closeModalAndReset = () => {
    setIsModalOpen(false)
    setGeneratedPassword('')
    setFormData({ fullName: '', email: '', admissionNo: '', courseId: '' })
  }

  // Filter students based on search input
  const filteredStudents = students.filter(student => {
    const name = student.profiles?.full_name?.toLowerCase() || ''
    const email = student.profiles?.email?.toLowerCase() || ''
    const admission = student.admission_no?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()
    
    return name.includes(search) || email.includes(search) || admission.includes(search)
  })

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)

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
      <div className="flex-1 p-10 md:p-14 flex flex-col relative">
        
        {/* Header Row */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg text-black font-normal w-32">All Students</h1>
          
          <div className="flex-1 flex justify-center px-4">
            <input 
              type="text" 
              placeholder="Search students.."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full max-w-sm bg-white text-black placeholder-gray-500 p-2.5 text-sm outline-none shadow-sm border border-gray-300"
            />
          </div>

          <div className="flex items-center gap-4 w-64 justify-end">
            <button className="bg-white text-black text-xs font-medium px-6 py-2.5 shadow-sm border border-gray-200 hover:bg-gray-50">
              All Courses
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#3B69B8] hover:bg-[#2d5497] text-white text-xs font-medium px-6 py-2.5 rounded-sm shadow-sm transition-colors"
            >
              Add Student
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full max-w-5xl mt-4">
          {loading ? (
            <div className="p-8 text-center text-gray-700">Loading students...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-black text-sm">
                  <th className="font-normal pb-4 w-20">ID</th>
                  <th className="font-normal pb-4 w-32">Name</th>
                  <th className="font-normal pb-4 w-48">Email</th>
                  <th className="font-normal pb-4 w-24">Course</th>
                  <th className="font-normal pb-4 w-24">Intake</th>
                  <th className="font-normal pb-4 w-24">Status</th>
                  <th className="font-normal pb-4 w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-black">
                {currentItems.length > 0 ? (
                  currentItems.map((student) => {
                    const courseTitle = student.enrollments?.[0]?.courses?.title || 'N/A'
                    
                    return (
                      <tr key={student.id}>
                        <td className="py-2.5">{student.admission_no}</td>
                        <td className="py-2.5">{student.profiles?.full_name || 'Unknown'}</td>
                        <td className="py-2.5">{student.profiles?.email || 'N/A'}</td>
                        <td className="py-2.5 truncate max-w-[100px]">{courseTitle}</td>
                        <td className="py-2.5">Nov 2026</td>
                        <td className="py-2.5">
                          <span className="bg-[#6EE7B7] text-black text-xs font-medium px-3 py-0.5 rounded-sm inline-block">
                            Active
                          </span>
                        </td>
                        <td className="py-2.5 flex gap-3 text-base mt-1">
                          <button className="hover:scale-110 transition-transform">👁️</button>
                          <button className="hover:scale-110 transition-transform">✏️</button>
                          <button className="hover:scale-110 transition-transform">❌</button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-gray-600">No students found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 0 && (
          <div className="flex justify-center mt-20">
            <div className="bg-white px-6 py-3 flex items-center gap-6 shadow-sm">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="text-gray-600 hover:text-black disabled:opacity-30 text-sm font-bold"
              >
                &lt;
              </button>
              
              {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`text-sm ${currentPage === page ? 'font-bold text-black' : 'text-gray-600 hover:text-black'}`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="text-gray-600 hover:text-black disabled:opacity-30 text-sm font-bold"
              >
                &gt;
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ADD STUDENT SLIDE-OVER MODAL */}
      <div 
        className={`absolute top-0 right-0 h-full w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isModalOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-8 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-medium text-black">Add New Student</h2>
            <button onClick={closeModalAndReset} className="text-gray-500 hover:text-black text-2xl leading-none">&times;</button>
          </div>

          {generatedPassword ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="bg-green-50 text-green-700 p-6 rounded-sm mb-6 w-full">
                <p className="font-medium mb-2">Student Created Successfully!</p>
                <p className="text-sm">Please copy this temporary password and give it to the student. They will need it to log in.</p>
              </div>
              
              <div className="bg-gray-100 p-4 w-full mb-8 border border-gray-300">
                <p className="text-xs text-gray-500 mb-1">Temporary Password</p>
                <p className="text-lg font-mono font-bold text-black">{generatedPassword}</p>
              </div>

              <button 
                onClick={closeModalAndReset}
                className="bg-[#3B69B8] text-white px-8 py-2.5 rounded-sm hover:bg-[#2d5497] w-full"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleAddStudent} className="flex flex-col gap-5 flex-1">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-[#F4F4F4] p-3 text-sm outline-none border border-transparent focus:border-[#3B69B8]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-[#F4F4F4] p-3 text-sm outline-none border border-transparent focus:border-[#3B69B8]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Admission Number</label>
                <input 
                  type="text" required placeholder="e.g. STU004"
                  value={formData.admissionNo}
                  onChange={(e) => setFormData({...formData, admissionNo: e.target.value})}
                  className="w-full bg-[#F4F4F4] p-3 text-sm outline-none border border-transparent focus:border-[#3B69B8]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Assign Course</label>
                <select 
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                  className="w-full bg-[#F4F4F4] p-3 text-sm outline-none border border-transparent focus:border-[#3B69B8]"
                >
                  <option value="">Select a course...</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <div className="mt-auto pt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#3B69B8] text-white py-3 rounded-sm hover:bg-[#2d5497] disabled:opacity-50 font-medium transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          )}
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

export default Students