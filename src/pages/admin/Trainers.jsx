import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function Trainers() {
  const [trainers, setTrainers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5 

  const navigate = useNavigate()

  useEffect(() => {
    fetchTrainers()
  }, [])

  const fetchTrainers = async () => {
    // Fetch trainers, their profile info, and their assigned courses
    const { data, error } = await supabase
      .from('trainers')
      .select(`
        id,
        specialization,
        is_active,
        profiles (full_name, email),
        course_trainers (courses (title))
      `)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setTrainers(data)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  // Filter trainers based on search input
  const filteredTrainers = trainers.filter(trainer => {
    const name = trainer.profiles?.full_name?.toLowerCase() || ''
    const email = trainer.profiles?.email?.toLowerCase() || ''
    const spec = trainer.specialization?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()
    
    return name.includes(search) || email.includes(search) || spec.includes(search)
  })

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredTrainers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTrainers.length / itemsPerPage)

  // Generate a fake ID for display (e.g., TRN001)
  const formatId = (index) => `TRN${String(index + 1).padStart(3, '0')}`

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
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl text-black mb-1">Manage Trainers</h1>
            <p className="text-sm text-gray-800">View, add, edit and remove trainers</p>
          </div>
          <div className="absolute top-10 right-16">
            <p className="text-sm font-medium text-black">Admin</p>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex justify-between items-center mb-8 w-full max-w-4xl">
          <input 
            type="text" 
            placeholder="Search trainers..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-64 bg-white text-black placeholder-gray-500 p-2.5 text-sm outline-none shadow-sm border border-gray-300"
          />

          <div className="flex items-center gap-4 ml-auto">
            <button className="bg-white text-black text-sm font-medium px-6 py-2.5 shadow-sm border border-gray-200 hover:bg-gray-50">
              All Courses
            </button>
            <button className="bg-white text-black text-sm font-medium px-6 py-2.5 shadow-sm border border-gray-200 hover:bg-gray-50 flex items-center gap-1">
              <span className="text-lg leading-none mb-0.5">+</span> Add trainer
            </button>
          </div>
        </div>

        {/* Table */}
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
                  currentItems.map((trainer, index) => {
                    // Get the first course title for the display, or show N/A
                    const courseTitle = trainer.course_trainers?.[0]?.courses?.title || 'N/A'
                    
                    return (
                      <tr key={trainer.id} className="border-b border-gray-200">
                        <td className="py-4 px-4 border-r border-gray-200">{formatId(indexOfFirstItem + index)}</td>
                        <td className="py-4 px-4 border-r border-gray-200">{trainer.profiles?.full_name || 'Unknown'}</td>
                        <td className="py-4 px-4 border-r border-gray-200 text-xs">{trainer.profiles?.email || 'N/A'}</td>
                        <td className="py-4 px-4 border-r border-gray-200">{trainer.specialization || 'General'}</td>
                        <td className="py-4 px-4 border-r border-gray-200 truncate max-w-[120px]">{courseTitle}</td>
                        <td className="py-4 px-4 border-r border-gray-200">
                          {trainer.is_active ? (
                            <span className="bg-[#6EE7B7] text-black text-xs font-medium px-3 py-1 rounded-sm inline-block">
                              Active
                            </span>
                          ) : (
                            <span className="bg-gray-300 text-black text-xs font-medium px-3 py-1 rounded-sm inline-block">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 flex gap-3 text-base mt-1">
                          <button className="hover:scale-110 transition-transform">👁️</button>
                          <button className="hover:scale-110 transition-transform">✏️</button>
                          <button className="hover:scale-110 transition-transform">❌</button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-600">No trainers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
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
    </div>
  )
}

export default Trainers