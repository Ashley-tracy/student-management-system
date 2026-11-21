import { Link } from 'react-router-dom'

function StudentDashboard() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] flex justify-center items-center p-4 sm:p-8">
      {/* Main App Container */}
      <div className="w-full max-w-6xl h-[600px] flex shadow-sm">
        
        {/* Sidebar */}
        <aside className="w-48 bg-[#1d3557] text-white flex flex-col justify-between py-6 px-4 shrink-0">
          <div className="flex flex-col gap-6">
            <div className="text-sm text-gray-300">Dashboard</div>
          </div>
          <div className="text-sm text-gray-300 cursor-pointer hover:text-white">
            Logout
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-[#dbecef] p-10 overflow-y-auto relative">
          
          {/* Top Right User Name */}
          <div className="absolute top-8 right-10 text-black text-sm">
            Ashley Tracy
          </div>

          <div className="mt-12 flex gap-12">
            {/* Left Column: Avatar & Info */}
            <div className="flex flex-col items-center w-48 shrink-0">
              {/* Avatar */}
              <div className="w-36 h-36 bg-white rounded-full mb-6"></div>
              
              {/* Student Info */}
              <div className="text-sm text-black flex flex-col gap-1 w-full">
                <p>Ashley Tracy</p>
                <p>STU001</p>
                <p>ashley@gmail.com</p>
              </div>

              {/* Edit Profile Button */}
              <button className="mt-4 bg-[#4a76b8] hover:bg-[#3a5f94] transition-colors text-white text-sm px-6 py-2 rounded-sm w-full">
                Edit Profile
              </button>
            </div>

            {/* Right Column: Course & Links */}
            <div className="flex-1 flex flex-col pt-4">
              
              {/* Course Intake Section */}
              <div className="mb-10 relative">
                <h2 className="text-xl text-[#1d3557] mb-2 font-medium">My Course Intake</h2>
                <div className="text-sm text-black flex flex-col gap-1">
                  <Link to="#" className="underline text-[#1d3557]">Web Development</Link>
                  <p>Intake Nov 2026-Mar 2027</p>
                </div>
                
                {/* Active Badge */}
                <div className="absolute top-0 right-0 bg-[#6ee7b7] text-black text-sm px-8 py-2">
                  Active
                </div>
              </div>

              {/* Quick Links Section */}
              <div>
                <h2 className="text-xl text-[#1d3557] mb-4 font-medium">Quick Links</h2>
                <div className="flex gap-4">
                  <button className="bg-white text-black text-sm px-8 py-4 shadow-sm hover:shadow-md transition-shadow">
                    My Courses
                  </button>
                  <button className="bg-white text-black text-sm px-8 py-4 shadow-sm hover:shadow-md transition-shadow">
                    View schedule
                  </button>
                </div>
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  )
}

export default StudentDashboard