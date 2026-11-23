import { Link } from 'react-router-dom'

function Landing() {
  return (
    <div className="min-h-screen bg-[#D8E8ED] flex flex-col p-8 md:p-16 font-sans">
      
      {/* Top Right Login Link */}
      <div className="w-full flex justify-end">
        <Link 
          to="/login" 
          className="text-black text-sm font-medium hover:underline mt-2"
        >
          Login
        </Link>
      </div>

      {/* Hero Text Section */}
      <div className="mt-16 md:mt-24">
        <h1 className="text-5xl md:text-[4.5rem] font-normal text-black leading-[1.15] tracking-tight">
          Student<br />
          Management<br />
          System
        </h1>
        
        <p className="text-xs md:text-sm text-black mt-8 tracking-wide">
          Manage students, courses and training<br />
          in one place
        </p>
      </div>

      {/* Bottom White Feature Cards - Visual Only */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto pt-24 pb-4">
        
        {/* Card 1 */}
        <div className="bg-white rounded-sm p-6 shadow-sm h-32 flex flex-col justify-center transition-all duration-200 hover:shadow-md">
          <span className="text-black text-lg font-medium leading-tight">Manage<br />Students</span>
        </div>
        
        {/* Card 2 */}
        <div className="bg-white rounded-sm p-6 shadow-sm h-32 flex flex-col justify-center transition-all duration-200 hover:shadow-md">
          <span className="text-black text-lg font-medium leading-tight">Register<br />Courses</span>
        </div>
        
        {/* Card 3 */}
        <div className="bg-white rounded-sm p-6 shadow-sm h-32 flex flex-col justify-center items-center transition-all duration-200 hover:shadow-md">
          <span className="text-black text-lg font-medium">Track Training</span>
        </div>
        
        {/* Card 4 */}
        <div className="bg-white rounded-sm p-6 shadow-sm h-32 flex flex-col justify-center items-center transition-all duration-200 hover:shadow-md">
          <span className="text-black text-lg font-medium">View Reports</span>
        </div>

      </div>

    </div>
  )
}

export default Landing