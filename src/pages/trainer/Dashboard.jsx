import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import ChangePasswordModal from '../../components/ChangePasswordModal'

function TrainerDashboard() {
  const [profile, setProfile] = useState(null)
  const [trainer, setTrainer] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeModal, setActiveModal] = useState(null) // 'courses' | 'students' | 'schedule' | 'password' | course object
  const [studentsForCourse, setStudentsForCourse] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchTrainerData() }, [])

  const fetchTrainerData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }

      // Profile (guard: must be a trainer)
      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name, email, role')
        .eq('id', user.id)
        .single()

      if (prof && prof.role !== 'trainer') {
        await supabase.auth.signOut()
        navigate('/login')
        return
      }
      setProfile(prof)

      // Trainer row
      const { data: trainerRow } = await supabase
        .from('trainers')
        .select('id, specialization, phone')
        .eq('profile_id', user.id)
        .maybeSingle()
      setTrainer(trainerRow)

      // Courses assigned to this trainer, with enrollment counts
      if (trainerRow) {
        const { data: assignedCourses } = await supabase
          .from('course_trainers')
          .select(`
            courses (
              id,
              code,
              title,
              duration_weeks,
              created_at,
              enrollments ( id )
            )
          `)
          .eq('trainer_id', trainerRow.id)

        if (assignedCourses) {
          setCourses(
            assignedCourses
              .map(c => c.courses)
              .filter(Boolean)
          )
        }
      }
    } catch (err) {
      console.error('[trainer-dashboard]', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // Compute intake label from course created_at + duration_weeks
  const intakeLabel = (course) => {
    if (!course?.created_at || !course?.duration_weeks) return '—'
    const start = new Date(course.created_at)
    const end = new Date(start.getTime() + course.duration_weeks * 7 * 86400000)
    const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    return `${fmt(start)} – ${fmt(end)}`
  }

  // Open "View Students" for a specific course
  const handleViewStudents = async (course) => {
    setActiveModal({ type: 'students', course })
    setStudentsLoading(true)
    setStudentsForCourse([])

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          status,
          enrollment_date,
          students ( id, full_name, admission_no, email )
        `)
        .eq('course_id', course.id)

      if (error) throw error
      setStudentsForCourse(data || [])
    } catch (err) {
      console.error('[trainer-students]', err)
    } finally {
      setStudentsLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">Loading...</div>

  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Trainer'

  // All students across all trainer's courses (for the "My Students" modal)
  const allStudents = () => {
    setActiveModal({ type: 'students', course: null })
    setStudentsLoading(true)
    setStudentsForCourse([])

    const courseIds = courses.map(c => c.id)
    if (courseIds.length === 0) { setStudentsLoading(false); return }

    supabase
      .from('enrollments')
      .select(`
        id,
        status,
        enrollment_date,
        courses ( title ),
        students ( id, full_name, admission_no, email )
      `)
      .in('course_id', courseIds)
      .then(({ data, error }) => {
        if (!error) setStudentsForCourse(data || [])
        setStudentsLoading(false)
      })
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 flex items-center justify-center font-sans">

      <div className="bg-[#DCECF2] w-full max-w-6xl h-[80vh] flex shadow-sm relative overflow-hidden">

        {/* Sidebar */}
        <div className="w-48 bg-[#1B365D] text-white flex flex-col justify-between py-6 px-6 z-10">
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

        {/* Main */}
        <div className="flex-1 p-8 md:p-12 flex flex-col relative overflow-y-auto">

          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-normal text-black mb-1">Welcome, {firstName}!</h1>
              <p className="text-sm text-gray-700">Here are your courses</p>
            </div>
            <button
              onClick={() => setActiveModal({ type: 'password' })}
              className="bg-white text-black text-xs font-medium px-4 py-2 rounded-sm shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Change Password
            </button>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16 max-w-2xl">
            <button
              onClick={() => setActiveModal({ type: 'courses' })}
              className="bg-white text-black text-sm font-medium p-6 rounded-sm shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              My courses
            </button>
            <button
              onClick={allStudents}
              className="bg-white text-black text-sm font-medium p-6 rounded-sm shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              My Students
            </button>
            <button
              onClick={() => setActiveModal({ type: 'schedule' })}
              className="bg-white text-black text-sm font-medium p-6 rounded-sm shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              Next Session
            </button>
          </div>

          {/* Course list */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg text-[#3B69B8]">My Courses</h2>
              <button
                onClick={() => setActiveModal({ type: 'courses' })}
                className="bg-[#3B69B8] hover:bg-[#2d5497] text-white text-sm font-medium px-6 py-1.5 rounded-sm transition-colors flex items-center gap-2"
              >
                View all <span>→</span>
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <div key={course.id} className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-medium text-black">{course.title}</h3>
                      <p className="text-sm text-gray-700 mt-1">{intakeLabel(course)}</p>
                    </div>
                    <button
                      onClick={() => handleViewStudents(course)}
                      className="bg-[#3B69B8] hover:bg-[#2d5497] text-white text-xs font-medium px-4 py-1.5 rounded-sm transition-colors"
                    >
                      View Students
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-600">
                  You haven't been assigned to any course yet. An admin will assign one soon.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---------- MODALS ---------- */}

        {/* My Courses */}
        <div className={`absolute top-0 right-0 h-full w-[420px] bg-white shadow-2xl transform transition-transform duration-300 z-50 ${activeModal?.type === 'courses' ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-medium text-black">My Courses</h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-black text-2xl leading-none">&times;</button>
            </div>
            {courses.length === 0 ? (
              <p className="text-sm text-gray-600">No courses assigned yet.</p>
            ) : (
              <ul className="flex flex-col gap-4 overflow-y-auto">
                {courses.map(course => (
                  <li key={course.id} className="bg-[#F4F4F4] p-4">
                    <p className="font-medium text-black">{course.title}</p>
                    <p className="text-xs text-gray-700 mt-1">Code: {course.code || '—'}</p>
                    <p className="text-xs text-gray-700">{intakeLabel(course)}</p>
                    <p className="text-xs text-gray-700">
                      Students: {course.enrollments?.length ?? 0}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Students (all or per course) */}
        <div className={`absolute top-0 right-0 h-full w-[480px] bg-white shadow-2xl transform transition-transform duration-300 z-50 ${activeModal?.type === 'students' ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-medium text-black">
                {activeModal?.course ? `Students — ${activeModal.course.title}` : 'All My Students'}
              </h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-black text-2xl leading-none">&times;</button>
            </div>

            {studentsLoading ? (
              <p className="text-sm text-gray-600">Loading students...</p>
            ) : studentsForCourse.length === 0 ? (
              <p className="text-sm text-gray-600">No students enrolled yet.</p>
            ) : (
              <ul className="flex flex-col gap-3 overflow-y-auto">
                {studentsForCourse.map(e => (
                  <li key={e.id} className="bg-[#F4F4F4] p-3">
                    <p className="font-medium text-black">{e.students?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-700 mt-1">
                      {e.students?.admission_no || '—'} · {e.students?.email || '—'}
                    </p>
                    {e.courses?.title && (
                      <p className="text-xs text-gray-700 mt-1">Course: {e.courses.title}</p>
                    )}
                    <p className="text-xs text-gray-700 mt-1">
                      Status: {e.status} · Enrolled {e.enrollment_date ? new Date(e.enrollment_date).toLocaleDateString() : '—'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Next Session / Schedule */}
        <div className={`absolute top-0 right-0 h-full w-[420px] bg-white shadow-2xl transform transition-transform duration-300 z-50 ${activeModal?.type === 'schedule' ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-medium text-black">Upcoming Sessions</h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-black text-2xl leading-none">&times;</button>
            </div>
            {courses.length === 0 ? (
              <p className="text-sm text-gray-600">No courses assigned yet.</p>
            ) : (
              <ul className="flex flex-col gap-4 overflow-y-auto">
                {courses.map(course => {
                  const start = course.created_at ? new Date(course.created_at) : null
                  const end = start && course.duration_weeks
                    ? new Date(start.getTime() + course.duration_weeks * 7 * 86400000)
                    : null
                  return (
                    <li key={course.id} className="bg-[#F4F4F4] p-4">
                      <p className="font-medium text-black">{course.title}</p>
                      <p className="text-xs text-gray-700 mt-1">
                        {start ? start.toLocaleDateString() : '—'} → {end ? end.toLocaleDateString() : '—'}
                      </p>
                      <p className="text-xs text-gray-700">
                        Duration: {course.duration_weeks || '—'} weeks · Students: {course.enrollments?.length ?? 0}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Change Password */}
        <ChangePasswordModal
          open={activeModal?.type === 'password'}
          onClose={() => setActiveModal(null)}
          email={profile?.email}
        />

        {/* Backdrop */}
        {activeModal && (
          <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/20 z-40"></div>
        )}

      </div>
    </div>
  )
}

export default TrainerDashboard