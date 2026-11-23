import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import ChangePasswordModal from '../../components/ChangePasswordModal'

function StudentDashboard() {
  const [profile, setProfile] = useState(null)
  const [studentData, setStudentData] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [activeModal, setActiveModal] = useState(null) // 'edit' | 'courses' | 'schedule' | 'password' | null
  const [editForm, setEditForm] = useState({ full_name: '', phone: '' })
  const [saving, setSaving] = useState(false)

  const navigate = useNavigate()

  useEffect(() => { fetchStudentData() }, [])

  const fetchStudentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }

      // 1. Profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name, email, role')
        .eq('id', user.id)
        .single()

      // Guard: only students should land here
      if (prof && prof.role !== 'student') {
        await supabase.auth.signOut()
        navigate('/login')
        return
      }
      setProfile(prof)

      // 2. Student record
      const { data: student } = await supabase
        .from('students')
        .select('id, admission_no, full_name, email, phone, created_at, profile_id')
        .eq('profile_id', user.id)
        .maybeSingle()

      setStudentData(student)

      if (student) {
        setEditForm({
          full_name: student.full_name || prof?.full_name || '',
          phone: student.phone || '',
        })

        // 3. All enrollments with course details
        const { data: enrollData } = await supabase
          .from('enrollments')
          .select(`
            id,
            status,
            enrollment_date,
            courses ( id, code, title, duration_weeks )
          `)
          .eq('student_id', student.id)
          .order('enrollment_date', { ascending: false })

        setEnrollments(enrollData || [])
      }
    } catch (err) {
      console.error('[student-dashboard]', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { error: studentErr } = await supabase
        .from('students')
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone || null,
        })
        .eq('id', studentData.id)
      if (studentErr) throw studentErr

      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ full_name: editForm.full_name })
        .eq('id', profile.id)
      if (profileErr) throw profileErr

      await fetchStudentData()
      setActiveModal(null)
    } catch (err) {
      alert('Could not save: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const primary = enrollments[0]
  const primaryCourse = primary?.courses
  const intakeLabel = (() => {
    if (!primary?.enrollment_date || !primaryCourse?.duration_weeks) return 'Intake Nov 2026–Mar 2027'
    const start = new Date(primary.enrollment_date)
    const end = new Date(start)
    end.setMonth(end.getMonth() + Math.round((primaryCourse.duration_weeks * 7) / 30))
    const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    return `Intake ${fmt(start)}–${fmt(end)}`
  })()

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 flex items-center justify-center font-sans">

      <div className="bg-[#D8E8ED] w-full max-w-6xl h-[85vh] flex shadow-sm relative overflow-hidden">

        {/* Sidebar */}
        <div className="w-48 bg-[#1B365D] text-white flex flex-col justify-between py-8 px-6 z-10">
          <div>
            <p className="text-xs font-medium tracking-wide">Dashboard</p>
          </div>
          <div>
            <button onClick={handleLogout} className="text-xs font-medium hover:underline text-left">
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 md:p-12 flex flex-col relative">

          <div className="absolute top-8 right-10">
            <p className="text-sm font-medium text-black">{profile?.full_name || 'Student Name'}</p>
          </div>

          <div className="flex flex-col md:flex-row mt-12 md:mt-8 gap-10">

            {/* Avatar + Info */}
            <div className="flex flex-col items-center md:items-start w-64">
              <div className="w-32 h-32 bg-white rounded-full mb-6"></div>
              <div className="text-center md:text-left text-sm text-black leading-relaxed">
                <p className="font-medium">{profile?.full_name || 'Student Name'}</p>
                <p>{studentData?.admission_no || 'STU000'}</p>
                <p>{profile?.email || 'email@example.com'}</p>
              </div>

              <button
                onClick={() => setActiveModal('edit')}
                className="mt-6 bg-[#4A76C9] hover:bg-[#3a5f9e] text-white text-xs px-6 py-2 rounded-sm transition-colors shadow-sm"
              >
                Edit Profile
              </button>

              <button
                onClick={() => setActiveModal('password')}
                className="mt-3 bg-white text-black text-xs px-6 py-2 rounded-sm shadow-sm hover:bg-gray-50 transition-colors border border-gray-200"
              >
                Change Password
              </button>
            </div>

            {/* Course + Quick Links */}
            <div className="flex-1 md:mt-6">
              <h2 className="text-xl font-normal text-black mb-4">My Course Intake</h2>

              <div className="mb-1">
                {primaryCourse ? (
                  <button
                    onClick={() => setActiveModal('courses')}
                    className="text-[#2D5E8E] underline text-sm font-medium"
                  >
                    {primaryCourse.title}
                  </button>
                ) : (
                  <span className="text-[#2D5E8E] text-sm font-medium">Not enrolled yet</span>
                )}
              </div>

              <p className="text-xs text-black mb-12">{intakeLabel}</p>

              <div className="absolute top-24 right-10">
                <div className="bg-[#6EE7B7] text-black text-xs font-medium px-8 py-2 rounded-sm border border-[#34D399]">
                  Active
                </div>
              </div>

              <h2 className="text-xl font-normal text-black mb-4 mt-8">Quick Links</h2>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setActiveModal('courses')}
                  className="bg-white text-black text-sm font-medium px-6 py-3 rounded-sm shadow-sm hover:bg-gray-50 transition-colors"
                >
                  My Courses
                </button>
                <button
                  onClick={() => setActiveModal('schedule')}
                  className="bg-white text-black text-sm font-medium px-6 py-3 rounded-sm shadow-sm hover:bg-gray-50 transition-colors"
                >
                  View schedule
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- MODALS ---------- */}

        {/* Edit Profile */}
        <div className={`absolute top-0 right-0 h-full w-[400px] bg-white shadow-2xl transform transition-transform duration-300 z-50 ${activeModal === 'edit' ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-medium text-black">Edit Profile</h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-black text-2xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5 flex-1">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                <input
                  type="text" required
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full bg-[#F4F4F4] p-3 text-sm outline-none border border-transparent focus:border-[#3B69B8]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-[#F4F4F4] p-3 text-sm outline-none border border-transparent focus:border-[#3B69B8]"
                />
              </div>
              <div className="mt-auto pt-6">
                <button
                  type="submit" disabled={saving}
                  className="w-full bg-[#3B69B8] text-white py-3 rounded-sm hover:bg-[#2d5497] disabled:opacity-50 font-medium transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* My Courses */}
        <div className={`absolute top-0 right-0 h-full w-[400px] bg-white shadow-2xl transform transition-transform duration-300 z-50 ${activeModal === 'courses' ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-medium text-black">My Courses</h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-black text-2xl leading-none">&times;</button>
            </div>
            {enrollments.length === 0 ? (
              <p className="text-sm text-gray-600">You are not enrolled in any course yet.</p>
            ) : (
              <ul className="flex flex-col gap-4 overflow-y-auto">
                {enrollments.map(e => (
                  <li key={e.id} className="bg-[#F4F4F4] p-4">
                    <p className="font-medium text-black">{e.courses?.title || 'Untitled'}</p>
                    <p className="text-xs text-gray-700 mt-1">Code: {e.courses?.code || '—'}</p>
                    <p className="text-xs text-gray-700">Status: {e.status}</p>
                    <p className="text-xs text-gray-700">
                      Enrolled: {e.enrollment_date ? new Date(e.enrollment_date).toLocaleDateString() : '—'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Schedule */}
        <div className={`absolute top-0 right-0 h-full w-[400px] bg-white shadow-2xl transform transition-transform duration-300 z-50 ${activeModal === 'schedule' ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-medium text-black">Schedule</h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-black text-2xl leading-none">&times;</button>
            </div>
            {enrollments.length === 0 ? (
              <p className="text-sm text-gray-600">No schedule yet — you're not enrolled in any course.</p>
            ) : (
              <ul className="flex flex-col gap-4 overflow-y-auto">
                {enrollments.map(e => {
                  const start = e.enrollment_date ? new Date(e.enrollment_date) : null
                  const end = start && e.courses?.duration_weeks
                    ? new Date(start.getTime() + e.courses.duration_weeks * 7 * 86400000)
                    : null
                  return (
                    <li key={e.id} className="bg-[#F4F4F4] p-4">
                      <p className="font-medium text-black">{e.courses?.title || 'Untitled'}</p>
                      <p className="text-xs text-gray-700 mt-1">
                        {start ? start.toLocaleDateString() : '—'} → {end ? end.toLocaleDateString() : '—'}
                      </p>
                      <p className="text-xs text-gray-700">Duration: {e.courses?.duration_weeks || '—'} weeks</p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Change Password */}
        <ChangePasswordModal
          open={activeModal === 'password'}
          onClose={() => setActiveModal(null)}
          email={profile?.email}
        />

        {/* Backdrop */}
        {activeModal && (
          <div
            onClick={() => setActiveModal(null)}
            className="absolute inset-0 bg-black/20 z-40"
          ></div>
        )}

      </div>
    </div>
  )
}

export default StudentDashboard