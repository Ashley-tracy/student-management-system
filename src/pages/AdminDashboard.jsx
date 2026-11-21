import { Link } from 'react-router-dom'

function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] flex justify-center items-center p-4 sm:p-8">
      {/* Main App Container */}
      <div className="w-full max-w-6xl h-[600px] flex shadow-sm">
        
        {/* Sidebar */}
        <aside className="w-56 bg-[#1d3557] text-white flex flex-col justify-between py-6 px-6 shrink-0">
          <div className="flex flex-col gap-8">
            {/* Top Links */}
            <div className="flex flex-col gap-4">
              <div className="text-base font-medium mb-2">SMS</div>
              <div className="text-sm text-gray-200 cursor-pointer">Dashboard</div>
              <div className="text-sm text-gray-200 cursor-pointer">Students</div>
              <div className="text-sm text-gray-200 cursor-pointer">Trainers</div>
              <div className="text-sm text-gray-200 cursor-pointer">Courses</div>
            </div>

            {/* Settings Section */}
            <div className="flex flex-col gap-4 mt-4">
              <div className="text-sm text-gray-200 cursor-pointer">Settings</div>
            </div>
          </div>

          {/* Logout */}
          <div className="text-sm text-gray-300 cursor-pointer hover:text-white">
            Logout
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-[#dbecef] p-8 overflow-y-auto relative">
          
          {/* Top Right Admin Label */}
          <div className="absolute top-8 right-10 text-black text-sm">
            Admin
          </div>

          {/* Header */}
          <div className="mb-6 mt-2">
            <h1 className="text-2xl text-black">Admin Dashboard</h1>
            <p className="text-sm text-black mt-1">Welcome back, Admin!</p>
          </div>

          {/* Top Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-10">
            <div className="bg-white p-4 h-20 flex flex-col justify-center shadow-sm">
              <p className="text-xs text-black">Total</p>
              <p className="text-sm text-black">Students</p>
            </div>
            <div className="bg-white p-4 h-20 flex flex-col justify-center shadow-sm">
              <p className="text-xs text-black">Total</p>
              <p className="text-sm text-black">Trainers</p>
            </div>
            <div className="bg-white p-4 h-20 flex flex-col justify-center shadow-sm">
              <p className="text-xs text-black">Total</p>
              <p className="text-sm text-black">Courses</p>
            </div>
            <div className="bg-white p-4 h-20 flex flex-col justify-center shadow-sm">
              <p className="text-xs text-black">Total</p>
              <p className="text-sm text-black">Trainings</p>
            </div>
          </div>

          {/* Bottom Section: Table & Actions */}
          <div className="flex gap-8">
            
            {/* Recent Registration Table */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base text-black">Recent Registration</h2>
                <button className="bg-white text-black text-sm px-3 py-1 shadow-sm hover:shadow-md transition-shadow">
                  View All →
                </button>
              </div>
              
              <div className="w-full">
                {/* Table Header */}
                <div className="grid grid-cols-3 text-sm text-black pb-2 mb-2 font-medium">
                  <div>Student Name</div>
                  <div>Course</div>
                  <div>Date</div>
                </div>
                
                {/* Table Rows */}
                <div className="flex flex-col gap-3 text-sm text-black">
                  <div className="grid grid-cols-3">
                    <div>Ashley Tracy</div>
                    <div>Web Development</div>
                    <div>Nov 17 2026</div>
                  </div>
                  <div className="grid grid-cols-3">
                    <div>John Doe</div>
                    <div>Data Science</div>
                    <div>Nov 16 2026</div>
                  </div>
                  <div className="grid grid-cols-3">
                    <div>Princess Cherie</div>
                    <div>Cyber Security</div>
                    <div>Nov 15 2026</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="w-48 shrink-0">
              <h2 className="text-base text-black mb-4">Quick Actions</h2>
              <div className="flex flex-col gap-3">
                <button className="bg-white text-black text-sm px-4 py-3 shadow-sm hover:shadow-md transition-shadow text-left">
                  Add Student
                </button>
                <button className="bg-white text-black text-sm px-4 py-3 shadow-sm hover:shadow-md transition-shadow text-left">
                  Add Trainer
                </button>
                <button className="bg-white text-black text-sm px-4 py-3 shadow-sm hover:shadow-md transition-shadow text-left">
                  Add Course
                </button>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  )
}

export default AdminDashboard