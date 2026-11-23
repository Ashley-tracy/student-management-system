import { useEffect, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function Trainers() {
  const [trainers, setTrainers] = useState([])
  const [courses, setCourses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [editingTrainer, setEditingTrainer] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    specialization: '',
    phone: ''
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
      const { data: trainersData, error } = await supabase
        .from('trainers')
        .select(`
          id,
          specialization,
          phone,
          profile_id,
          profiles ( full_name, email ),
          course_trainers (
            courses ( id, title )
          )
        `)
        .order('id', { ascending: false })

      if (error) {
        console.error("Error fetching trainers:", error)
      } else {
        setTrainers(trainersData || [])
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

  const handleEditTrainer = (trainer) => {
    setEditingTrainer(trainer)
    setFormData({
      full_name: trainer.full_name || '',
      email: trainer.email || '',
      specialization: trainer.specialization || '',
      phone: trainer.phone || '',
    })
    setIsModalOpen(true)
  }

  const handleSubmitTrainer = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingTrainer) {
        // ---- EDIT ----
        const { error: profErr } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            email: formData.email,
          })
          .eq('id', editingTrainer.profile_id)
        if (profErr) throw profErr

        const { error: trainerErr } = await supabase
          .from('trainers')
          .update({
            specialization: formData.specialization || null,
            phone: formData.phone || null,
          })
          .eq('id', editingTrainer.id)
        if (trainerErr) throw trainerErr

        await fetchInitialData()
        closeModalAndReset()
      } else {
        // ---- ADD ----
        const tempPassword = `Trn!${Math.random().toString(36).slice(-6)}`
        const payload = {
          email: formData.email,
          password: tempPassword,
          full_name: formData.full_name,
          role: 'trainer',
          phone: formData.phone || null,
          specialization: formData.specialization || null,
        }

        const { data, error } = await supabase.functions.invoke('create-user', {
          body: payload,
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

        setGeneratedPassword(tempPassword)
        await fetchInitialData()
      }
    } catch (err) {
      console.error('[trainer-submit] failed:', err)
      alert('Error: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTrainer = async (trainer) => {
    if (!confirm(`Delete ${trainer.full_name}? Their login account and course assignments will also be removed.`)) return

    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: trainer.profile_id },
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
      console.error('[delete-trainer] failed:', err)
      alert('Delete failed: ' + err.message)
    }
  }

  const closeModalAndReset = () => {
    setIsModalOpen(false)
    setGeneratedPassword('')
    setEditingTrainer(null)
    setFormData({ full_name: '', email: '', specialization: '', phone: '' })
  }

  const flatTrainers = trainers.map(t => ({
    id: t.id,
    profile_id: t.profile_id,
    full_name: t.profiles?.full_name || 'Unknown',
    email: t.profiles?.email || 'N/A',
    specialization: t.specialization || 'General',
    phone: t.phone,
    course_titles: (t.course_trainers || []).map(ct => ct.courses?.title).filter(Boolean),
    is_active: true
  }))

  const filteredTrainers = flatTrainers.filter(trainer => {
    const search = searchTerm.toLowerCase()
    const matchesSearch =
      trainer.full_name.toLowerCase().includes(search) ||
      trainer.email.toLowerCase().includes(search) ||
      trainer.specialization.toLowerCase().includes(search)

    const matchesCourse = selectedCourse
      ? (trainers.find(t => t.id === trainer.id)?.course_trainers || [])
          .some(ct => ct.courses?.id === parseInt(selectedCourse))
      : true

    return matchesSearch && matchesCourse
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredTrainers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTrainers.length / itemsPerPage)

  const formatId = (index) => `TRN${String(index + 1).padStart(3, '0')}`

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

      {/* Main */}
      <div className="flex-1 p-10 md:p-16 flex flex-col relative">

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl text-black mb-1">Manage Trainers</h1>
            <p className="text-sm text-gray-800">View, add, edit and remove trainers</p>
          </div>
          <div className="absolute top-10 right-16">
            <p className="text-sm font-medium text-black">Admin</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8 w-full max-w-4xl">
          <input
            type="text"
            placeholder="Search trainers..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
            className="w-64 bg-white text-black placeholder-gray-500 p-2.5 text-sm outline-none shadow-sm border border-gray-300"
          />

          <div className="flex items-center gap-4 ml-auto">
            <div className="relative">
              <select
                value={selectedCourse}
                onChange={(e) => { setSelectedCourse(e.target.value); setCurrentPage(1) }}
                className="bg-white text-black text-sm font-medium px-6 py-2.5 shadow-sm border border-gray-200 hover:bg-gray-50 outline-none appearance-none cursor-pointer pr-10"
                style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-black text-sm font-medium px-6 py-2.5 shadow-sm border border-gray-200 hover:bg-gray-50 flex items-center gap-1"
            >
              <span className="text-lg leading-none mb-0.5">+</span> Add trainer
            </button>
          </div>
        </div>

        <div className="w-full max-w-4xl">
          {loading ? (
            <div className="p-8 text-center text-gray-700">Loading trainers...</div>
          ) : (
            <table className="w-full text-left border-collapse bg-white shadow-sm">
              <thead>
                <tr className="text-black text-sm border-b border-gray-300">
                  <th className="font-medium py-4 px-4 border-r border-gray-200 w-24">ID</th>
                  <th className="font-medium py-4 px-4 border-r border-gray-200 w-40">Name</th>
                  <th className="font-medium py-4 px-4 border-r border-gray-200 w-48">Email</th>
                  <th className="font-medium py-4 px-4 border-r border-gray-200">Specialization</th>
                  <th className="font-medium py-4 px-4 border-r border-gray-200">Courses</th>
                  <th className="font-medium py-4 px-4 border-r border-gray-200 w-24">Status</th>
                  <th className="font-medium py-4 px-4 w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-black">
                {currentItems.length > 0 ? (
                  currentItems.map((trainer, index) => (
                    <tr key={trainer.id} className="border-b border-gray-200">
                      <td className="py-4 px-4 border-r border-gray-200">{formatId(indexOfFirstItem + index)}</td>
                      <td className="py-4 px-4 border-r border-gray-200">{trainer.full_name}</td>
                      <td className="py-4 px-4 border-r border-gray-200 text-xs">{trainer.email}</td>
                      <td className="py-4 px-4 border-r border-gray-200">{trainer.specialization}</td>
                      <td className="py-4 px-4 border-r border-gray-200 truncate max-w-[120px]">
                        {trainer.course_titles.length > 0 ? trainer.course_titles.join(', ') : 'N/A'}
                      </td>
                      <td className="py-4 px-4 border-r border-gray-200">
                        <span className="bg-[#6EE7B7] text-black text-xs font-medium px-3 py-1 rounded-sm inline-block">
                          Active
                        </span>
                      </td>
                      <td className="py-4 px-4 flex gap-3 text-base mt-1">
                        <button
                          onClick={() => alert(`Trainer: ${trainer.full_name}\nEmail: ${trainer.email}\nSpecialization: ${trainer.specialization}`)}
                          className="hover:scale-110 transition-transform"
                          title="View"
                        >👁️</button>
                        <button
                          onClick={() => handleEditTrainer(trainer)}
                          className="hover:scale-110 transition-transform"
                          title="Edit"
                        >✏️</button>
                        <button
                          onClick={() => handleDeleteTrainer(trainer)}
                          className="hover:scale-110 transition-transform"
                          title="Delete"
                        >❌</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-600">No trainers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-16">
            <div className="bg-white px-6 py-3 flex items-center gap-6 shadow-sm">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="text-gray-600 hover:text-black disabled:opacity-30 text-sm font-bold"
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                disabled={currentPage === totalPages}
                className="text-gray-600 hover:text-black disabled:opacity-30 text-sm font-bold"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over modal */}
      <div
        className={`absolute top-0 right-0 h-full w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isModalOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-8 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-medium text-black">
              {editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
            </h2>
            <button onClick={closeModalAndReset} className="text-gray-500 hover:text-black text-2xl leading-none">&times;</button>
          </div>

          {generatedPassword ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="bg-green-50 text-green-700 p-6 rounded-sm mb-6 w-full">
                <p className="font-medium mb-2">Trainer Created Successfully!</p>
                <p className="text-sm">Copy this temporary password and give it to the trainer.</p>
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
            <form onSubmit={handleSubmitTrainer} className="flex flex-col gap-5 flex-1">
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
                <label className="block text-sm text-gray-700 mb-1">Specialization</label>
                <input
                  type="text" required placeholder="e.g. Data Science"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full bg-[#F4F4F4] p-3 text-sm outline-none border border-transparent focus:border-[#3B69B8]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Phone (optional)</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#F4F4F4] p-3 text-sm outline-none border border-transparent focus:border-[#3B69B8]"
                />
              </div>

              <div className="mt-auto pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#3B69B8] text-white py-3 rounded-sm hover:bg-[#2d5497] disabled:opacity-50 font-medium transition-colors"
                >
                  {isSubmitting
                    ? (editingTrainer ? 'Saving...' : 'Creating...')
                    : (editingTrainer ? 'Save Changes' : 'Create Trainer')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div onClick={closeModalAndReset} className="absolute inset-0 bg-black/20 z-40"></div>
      )}

    </div>
  )
}

export default Trainers