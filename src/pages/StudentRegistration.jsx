import { Link } from 'react-router-dom'

function StudentRegistration() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] flex justify-center items-center p-4 sm:p-8">
      {/* Main App Container */}
      <div className="w-full max-w-6xl h-[600px] flex shadow-sm">
        
        {/* Sidebar */}
        <aside className="w-48 bg-[#1d3557] text-white flex flex-col justify-between py-6 px-4 shrink-0">
          <div className="flex flex-col gap-6">
            <div className="text-sm font-medium mb-2">SMS</div>
            <div className="flex flex-col gap-3">
              <div className="text-sm text-gray-300 cursor-pointer">Dashboard</div>
              <div className="text-sm text-gray-300 cursor-pointer">Students</div>
              <div className="text-sm text-gray-300 cursor-pointer">Trainers</div>
              <div className="text-sm text-gray-300 cursor-pointer">Courses</div>
            </div>
            
            <div className="flex flex-col gap-3 mt-4">
              <div className="text-sm text-gray-300 cursor-pointer">Settings</div>
            </div>
          </div>
          <div className="text-sm text-gray-300 cursor-pointer hover:text-white">
            Logout
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-[#dbecef] p-8 overflow-y-auto flex flex-col">
          
          {/* Top Bar: Tabs & Actions */}
          <div className="flex justify-between items-center mb-8 mt-2">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-medium text-black">All Students</h2>
              <input 
                type="text" 
                placeholder="Search students.." 
                className="bg-white px-3 py-1.5 text-sm text-black border-none outline-none w-48 shadow-sm"
              />
              <div className="bg-white px-4 py-1.5 text-sm text-black shadow-sm cursor-pointer">
                All Courses
              </div>
            </div>
            <button className="bg-[#4a76b8] hover:bg-[#3a5f94] transition-colors text-white text-sm px-6 py-2 rounded-sm shadow-sm">
              Add Student
            </button>
          </div>

          {/* Table Section */}
          <div className="w-full flex-1">
            {/* Table Header */}
            <div className="grid grid-cols-[80px_1fr_1.5fr_1fr_1fr_80px_100px] text-xs font-medium text-black pb-3 mb-2 border-b border-gray-300/50">
              <div>ID</div>
              <div>Name</div>
              <div>Email</div>
              <div>Course</div>
              <div>Intake</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {/* Table Rows */}
            <div className="flex flex-col gap-4 text-sm text-black mt-2">
              
              {/* Row 1 */}
              <div className="grid grid-cols-[80px_1fr_1.5fr_1fr_1fr_80px_100px] items-center">
                <div>STU001</div>
                <div>Ashley Tracy</div>
                <div>ashley@gmail.com</div>
                <div>Web Dev</div>
                <div>Nov 2026</div>
                <div>
                  <span className="bg-[#6ee7b7] text-black text-xs px-2 py-0.5 inline-block">Active</span>
                </div>
                <div className="flex gap-2 text-base">
                  <span className="cursor-pointer">👁️</span>
                  <span className="cursor-pointer">❌</span>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-[80px_1fr_1.5fr_1fr_1fr_80px_100px] items-center">
                <div>STU002</div>
                <div>John Doe</div>
                <div>john@gmail.com</div>
                <div>Data Sci</div>
                <div>Nov 2026</div>
                <div>
                  <span className="bg-[#6ee7b7] text-black text-xs px-2 py-0.5 inline-block">Active</span>
                </div>
                <div className="flex gap-2 text-base">
                  <span className="cursor-pointer">👁️</span>
                  <span className="cursor-pointer">❌</span>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-[80px_1fr_1.5fr_1fr_1fr_80px_100px] items-center">
                <div>STU003</div>
                <div>Princess Cherie</div>
                <div>princess@gmail.com</div>
                <div>Design</div>
                <div>Nov 2026</div>
                <div>
                  <span className="bg-[#6ee7b7] text-black text-xs px-2 py-0.5 inline-block">Active</span>
                </div>
                <div className="flex gap-2 text-base">
                  <span className="cursor-pointer">👁️</span>
                  <span className="cursor-pointer">❌</span>
                </div>
              </div>

            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-auto pt-8 pb-4">
            <div className="flex items-center gap-6 bg-white px-6 py-2 shadow-sm text-sm text-black">
              <span className="cursor-pointer text-gray-500">&lt;</span>
              <span className="font-medium">1</span>
              <span className="text-gray-500 cursor-pointer">2</span>
              <span className="cursor-pointer text-gray-500">&gt;</span>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}

export default StudentRegistration