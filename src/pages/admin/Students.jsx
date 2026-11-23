import { useEffect, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function Students() {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [editingStudent, setEditingStudent] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    admission_no: '',
    course_id: ''
  })

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('action') === 'new') setIsModalOpen(true)
  }, [searchParams])

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const { data: studentsData, error } = await supabase
        .from('students')
        .select(`
          id,
          admission_no,
          full_name,
          email,
          phone,
          profile_id,
          created_at,
          enrollments (
            id,
            status,
            courses ( id, title )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Error fetching students:", error)
      } else {
        setStudents(studentsData || [])
      }

      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title')
        .eq('is_active', true)
        .order('title', { ascending: true })

      if (coursesData) setCourses(coursesData)
    } catch (err) {
      console.error("Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const handleEditStudent = (student) => {
    setEditingStudent(student)
    setFormData({
      full_name: student.full_name || '',
      email: student.email || '',
      admission_no: student.admission_no || '',
      course_id: student.enrollments?.[0]?.courses?.id?.toString() || '',
    })
    setIsModalOpen(true)
  }

  const handleSubmitStudent = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingStudent) {
        // ---- EDIT ----
        const { error: studentErr } = await supabase
          .from('students')
          .update({
            full_name: formData.full_name,
            email: formData.email,
            admission_no: formData.admission_no,
          })
          .eq('id', editingStudent.id)
        if (studentErr) throw studentErr

        if (editingStudent.profile_id) {
          await supabase
            .from('profiles')
            .update({ full_name: formData.full_name })
            .eq('id', editingStudent.profile_id)
        }

        // Sync enrollment
        const currentCourseId = editingStudent.enrollments?.[0]?.courses?.id
        const targetCourseId = formData.course_id ? parseInt(formData.course_id) : null

        if (currentCourseId !== targetCourseId) {
          if (currentCourseId) {
            await supabase
              .from('enrollments')
              .delete()
              .eq('student_id', editingStudent.id)
              .eq('course_id', currentCourseId)
          }
          if (targetCourseId) {
            const { error: enrollErr } = await supabase
              .from('enrollments')
              .insert({
                student_id: editingStudent.id,
                course_id: targetCourseId,
                status: 'enrolled',
              })
            if (enrollErr) throw enrollErr
          }
        }

        await fetchInitialData()
        closeModalAndReset()
      } else {
        // ---- ADD ----
        const tempPassword = `Stu!${Math.random().toString(36).slice(-6)}`
        const { data, error } = await supabase.functions.invoke('create-user', {
          body: {
            email: formData.email,
            password: tempPassword,
            full_name: formData.full_name,
            role: 'student',
            admission_no: formData.admission_no,
          },
        })

        if (error || data?.error) {
          let msg = 'Unknown error'
          if (error?.context) {
            try {
              const body = await error.context.json()
              msg = body?.error || JSON.stringify(body)
            } catch { msg = error.message }
          } else if (data?.error) {
            msg = data.error
          } else if (error?.message) {
            msg = error.message
          }
          throw new Error(msg)
        }

        if (formData.course_id && data.student_id) {
          const { error: enrollError } = await supabase
            .from('enrollments')
            .insert({
              student_id: data.student_id,
              course_id: parseInt(formData.course_id),
              status: 'enrolled',
            })
          if (enrollError) console.error('Enrollment error:', enrollError)
        }

        setGeneratedPassword(tempPassword)
        await fetchInitialData()
      }
    } catch (err) {
      console.error('[student-submit] failed:', err)
      alert('Error: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStudent = async (student) => {
    if (!confirm(`Delete ${student.full_name}? Their login account and enrollments will also be removed.`)) return

    if (!student.profile_id) {
      const { error } = await supabase.from('students').delete().eq('id', student.id)
      if (error) { alert('Delete failed: ' + error.message); return }
      await fetchInitialData()
      return
    }

    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: student.profile_id },
      })

      if (error || data?.error) {
        let msg = 'Unknown error'
        if (error?.context) {
          try {
            const body = await error.context.json()
            msg = body?.error || JSON.stringify(body)
          } catch { msg = error.message }
        } else if (data?.error) {
          msg = data.error
        }
        throw new Error(msg)
      }

      await fetchInitialData()
    } catch (err) {
      console.error('[delete-student] failed:', err)
      alert('Delete failed: ' + err.message)
    }
  }

  const closeModalAndReset = () => {
    setIsModalOpen(false)
    setGeneratedPassword('')
    setEditingStudent(null)
    setFormData({ full_name: '', email: '', admission_no: '', course_id: '' })
  }

  const filteredStudents = students.filter(student => {
    const search = searchTerm.toLowerCase()
    const matchesSearch =
      (student.full_name || '').toLowerCase().includes(search) ||
      (student.email || '').toLowerCase().includes(search) ||
      (student.admission_no || '').toLowerCase().includes(search)

    const matchesCourse = selectedCourse
      ? student.enrollments?.some(e => e.courses?.id === parseInt(selectedCourse))
      : true

    return matchesSearch && matchesCourse
  })

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

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg text-black font-normal w-32">All Students</h1>

          <div className="flex-1 flex justify-center px-4">
            <input
              type="text"
              placeholder="Search students.."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="w-full max-w-sm bg-white text-black placeholder-gray-500 p-2.5 text-sm outline-none shadow-sm border border-gray-300"
            />
          </div>

          <div className="flex items-center gap-4 w-64 justify-end">
            <div className="relative">
              <select
                value={selectedCourse}
                onChange={(e) => { setSelectedCourse(e.target.value); setCurrentPage(1) }}
                className="bg-white text-black text-xs font-medium px-4 py-2.5 shadow-sm border border-gray-200 hover:bg-gray-50 outline-none appearance-none cursor-pointer pr-8"
                style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#3B69B8] hover:bg-[#2d5497] text-white text-xs font-medium px-6 py-2.5 rounded-sm shadow-sm transition-colors"
            >
              Add Student
            </button>
          </div>
        </div>

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
                    const firstCourse = student.enrollments?.[0]?.courses
                    return (
                      <tr key={student.id}>
                        <td className="py-2.5">{student.admission_no}</td>
                        <td className="py-2.5">{student.full_name || 'Unknown'}</td>
                        <td className="py-2.5">{student.email || 'N/A'}</td>
                        <td className="py-2.5 truncate max-w-[100px]">
                          {firstCourse?.title || 'Not Enrolled'}
                        </td>
                        <td className="py-2.5">
                          {student.created_at
                            ? new Date(student.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="py-2.5">
                          <span className="bg-[#6EE7B7] text-black text-xs font-medium px-3 py-0.5 rounded-sm inline-block">
                            Active
                          </span>
                        </td>
                        <td className="py-2.5 flex gap-3 text-base mt-1">
                          <button
                            onClick={() => alert(`Student: ${student.full_name}\nAdmission: ${student.admission_no}\nEmail: ${student.email}`)}
                            className="hover:scale-110 transition-transform"
                            title="View"
                          >👁️</button>
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="hover:scale-110 transition-transform"
                            title="Edit"
                          >✏️</button>
                          <button
                            onClick={() => handleDeleteStudent(student)}
                            className="hover:scale-110 transition-transform"
                            title="Delete"
                          >❌</button>
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

      {/* Slide-out Modal */}
      <div
        className={`absolute top-0 right-0 h-full w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isModalOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-8 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-medium text-black">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            <button onClick={closeModalAndReset} className="text-gray-500 hover:text-black text-2xl leading-none">&times;</button>
          </div>

          {generatedPassword ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="bg-green-50 text-green-700 p-6 rounded-sm mb-6 w-full">
                <p className="font-medium mb-2">Student Created Successfully!</p>
                <p className="text-sm">Give this temporary password to the student so they can log in.</p>
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
            <form onSubmit={handleSubmitStudent} className="flex flex-col gap-5 flex-1">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                <input
                  type="text" required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-[#F4F4F4] p-3 text-sm outline-none border border-transparent focus:border-[#3B69B8]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Email Address</label>
                <input
                  type="email" required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#F4F4F4] p-3 text-sm outline-none border border-transparent focus:border-[#3B69B8]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Admission Number</label>
                <input
                  type="text" required placeholder="e.g. STU004"
                  value={formData.admission_no}
                  onChange={(e) => setFormData({ ...formData, admission_no: e.target.value })}
                  className="w-full bg-[#F4F4F4] p-3 text-sm outline-none border border-transparent focus:border-[#3B69B8]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Assign Course</label>
                <select
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  className="w-full bg-[#F4F4F4] p-3 text-sm outline-none border border-transparent focus:border-[#3B69B8]"
                >
                  <option value="">No course yet</option>
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
                  {isSubmitting
                    ? (editingStudent ? 'Saving...' : 'Creating...')
                    : (editingStudent ? 'Save Changes' : 'Create Student')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

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