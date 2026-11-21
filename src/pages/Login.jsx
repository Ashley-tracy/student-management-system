import { Link } from 'react-router-dom'

function Login() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] flex justify-center items-start pt-16 px-4 sm:px-8">
      {/* Main light blue container */}
      <div className="w-full max-w-3xl bg-[#dbecef] p-8 sm:p-12 md:p-20 flex justify-center">
        
        {/* White login card */}
        <div className="bg-white w-full max-w-sm p-8 sm:p-10 flex flex-col items-center shadow-sm">
          
          <h1 className="text-3xl font-bold text-black mb-8">Login</h1>

          {/* Form container - left aligned inside the card */}
          <div className="w-full flex flex-col items-start gap-4">
            
            {/* Email Field */}
            <div className="w-full flex flex-col gap-1">
              <label className="text-sm text-black">Email:</label>
              <input 
                type="email" 
                className="w-full border border-gray-400 p-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Password Field */}
            <div className="w-full flex flex-col gap-1 mt-2">
              <label className="text-sm text-black">Password:</label>
              <input 
                type="password" 
                className="w-full border border-gray-400 p-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Login Button */}
            <div className="w-full flex justify-center mt-4 mb-8">
              <button className="bg-[#3b5998] text-white px-8 py-2 text-sm font-medium hover:bg-[#2d4373] transition-colors">
                Login
              </button>
            </div>

            {/* Footer Links */}
            <div className="w-full flex flex-col items-center gap-4 text-sm text-black mt-4">
              <Link to="#" className="hover:underline">
                Forgot password
              </Link>
              <p>
                No account? Sign up from admin
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Login