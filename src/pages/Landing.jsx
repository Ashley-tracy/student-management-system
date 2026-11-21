import { Link } from 'react-router-dom'

 function Landing() {
  return (
    <div className="min-h-screen bg-[#dbecef] flex justify-center items-start pt-16 px-4 sm:px-8">
      <div className="w-full max-w-5xl flex flex-col gap-16">

        {/* Top Navigation */}
        <div className="flex justify-end w-full">
          <Link
            to="/login"
            className="text-gray-800 text-sm font-medium hover:text-gray-600 transition-colors"
          >
            Login
          </Link>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl md:text-5xl font-normal text-gray-900 leading-tight">
            Student <br />
            Management <br />
            System
          </h1>
          <p className="text-sm text-gray-700 max-w-xs leading-relaxed mt-2">
            Manage students, courses and training <br />
            in one place
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 w-full">
          <Link
            to="/manage-students"
            className="bg-white rounded-xl p-6 h-32 flex items-start justify-start shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <span className="text-gray-800 font-medium text-sm leading-snug">
              Manage<br />Students
            </span>
          </Link>

          <Link
            to="/register-courses"
            className="bg-white rounded-xl p-6 h-32 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <span className="text-gray-800 font-medium text-sm leading-snug">
              Register<br />Courses
            </span>
          </Link>

          <Link
            to="/track-training"
            className="bg-white rounded-xl p-6 h-32 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <span className="text-gray-800 font-medium text-sm leading-snug">
              Track Training
            </span>
          </Link>

          <Link
            to="/view-reports"
            className="bg-white rounded-xl p-6 h-32 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <span className="text-gray-800 font-medium text-sm leading-snug">
              View Reports
            </span>
          </Link>
        </div>

      </div>
    </div>
  )
}
export default Landing;