import { Link } from 'react-router-dom'

function TrainerDashboard() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] flex justify-center items-center p-4 sm:p-8">
      {/* Main App Container */}
      <div className="w-full max-w-6xl h-[600px] flex shadow-sm">
        
        {/* Sidebar */}
        <aside className="w-48 bg-[#1d3557] text-white flex flex-col justify-between py-6 px-4 shrink-0">
          <div className="flex flex-col gap-6">
            <div className="text-sm font-medium">SMS</div>
            <div className="text-sm text-gray-300">Dashboard</div>
          </div>
          <div className="text-sm text-gray-300 cursor-pointer hover:text-white">
            Logout
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-[#dbecef] p-10 overflow-y-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl text-black">Welcome, David!</h1>
            <p className="text-sm text-black mt-1">Here are your courses</p>
          </div>

          {/* Top Action Cards */}
          <div className="flex flex-wrap gap-4 mb-12">
            <div className="bg-white rounded-sm w-32 h-24 p-4 flex items-center shadow-sm">
              <span className="text-sm text-black">My courses</span>
            </div>
            <div className="bg-white rounded-sm w-32 h-24 p-4 flex items-center shadow-sm">
              <span className="text-sm text-black">My Students</span>
            </div>
            <div className="bg-white rounded-sm w-32 h-24 p-4 flex items-center shadow-sm">
              <span className="text-sm text-black">Next Session</span>
            </div>
          </div>

          {/* My Courses Section */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg text-[#4a76b8]">My Courses</h2>
            <button className="bg-[#4a76b8] hover:bg-[#3a5f94] transition-colors text-white text-sm px-4 py-1.5 rounded-sm flex items-center gap-2">
              View all <span aria-hidden="true">→</span>
            </button>
          </div>

          {/* Course Details */}
          <div className="flex justify-between items-center mt-6">
            <div>
              <p className="text-base text-black mb-1">Data Science</p>
              <p className="text-base text-black">Nov 2026-March 2027</p>
            </div>
            <button className="bg-[#4a76b8] hover:bg-[#3a5f94] transition-colors text-white text-sm px-4 py-1.5 rounded-sm">
              View Students
            </button>
          </div>

        </main>
      </div>
    </div>
  )
}

export default TrainerDashboard