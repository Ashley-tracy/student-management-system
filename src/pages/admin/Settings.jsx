import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function Settings() {
  const navigate = useNavigate()
  
  // Tabs state
  const [activeTab, setActiveTab] = useState('General')

  // Form state
  const [formData, setFormData] = useState({
    systemName: 'Student Management System',
    institutionName: 'ABC Learning Institute',
    academicYear: '2026-2027',
    defaultIntake: 'November 2026'
  })

  // Toggles state
  const [toggles, setToggles] = useState({
    emailNotif: true,
    smsAlerts: false,
    selfReg: true
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleToggle = (key) => {
    setToggles({ ...toggles, [key]: !toggles[key] })
  }

  const handleSave = () => {
    // In a real app, you would send formData to Supabase here
    alert('Settings saved successfully!')
  }

  const handleReset = () => {
    setFormData({
      systemName: 'Student Management System',
      institutionName: 'ABC Learning Institute',
      academicYear: '2026-2027',
      defaultIntake: 'November 2026'
    })
    setToggles({ emailNotif: true, smsAlerts: false, selfReg: true })
  }

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
      <div className="flex-1 p-10 md:p-14 flex flex-col relative overflow-y-auto">
        
        {/* Top Right Admin Name */}
        <div className="absolute top-10 right-16">
          <p className="text-sm font-medium text-black">Admin</p>
        </div>

        {/* Header */}
        <div className="mb-8 mt-2">
          <h1 className="text-2xl text-black mb-1">Settings</h1>
          <p className="text-sm text-gray-800">Manage system settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-10">
          {['General', 'Users', 'Notifications', 'System'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-sm shadow-sm transition-colors ${
                activeTab === tab 
                  ? 'bg-[#3B69B8] text-white' 
                  : 'bg-white text-black hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-10 flex-1">
          
          {/* Left Side: General Settings Form */}
          <div className="flex-1 max-w-2xl">
            <h2 className="text-base font-medium text-black mb-8">General Settings</h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center">
                <label className="w-48 text-sm text-black">System Name</label>
                <input 
                  type="text"
                  name="systemName"
                  value={formData.systemName}
                  onChange={handleChange}
                  className="flex-1 bg-white p-2.5 text-sm text-black outline-none shadow-sm border border-gray-200"
                />
              </div>

              <div className="flex items-center">
                <label className="w-48 text-sm text-black">Institution Name</label>
                <input 
                  type="text"
                  name="institutionName"
                  value={formData.institutionName}
                  onChange={handleChange}
                  className="flex-1 bg-white p-2.5 text-sm text-black outline-none shadow-sm border border-gray-200"
                />
              </div>

              <div className="flex items-center">
                <label className="w-48 text-sm text-black">Academic Year</label>
                <input 
                  type="text"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  className="flex-1 bg-white p-2.5 text-sm text-black outline-none shadow-sm border border-gray-200"
                />
              </div>

              <div className="flex items-center">
                <label className="w-48 text-sm text-black">Default Course Intake</label>
                <input 
                  type="text"
                  name="defaultIntake"
                  value={formData.defaultIntake}
                  onChange={handleChange}
                  className="flex-1 bg-white p-2.5 text-sm text-black outline-none shadow-sm border border-gray-200"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-6 mt-16 mb-8 ml-48">
              <button 
                onClick={handleSave}
                className="bg-[#3B69B8] hover:bg-[#2d5497] text-white text-sm font-medium px-10 py-2.5 rounded-sm shadow-sm transition-colors"
              >
                Save Settings
              </button>
              <button 
                onClick={handleReset}
                className="bg-white text-black text-sm font-medium px-10 py-2.5 rounded-sm shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Right Side: Profile Settings */}
          <div className="w-full lg:w-80">
            <div className="bg-white p-8 shadow-sm min-h-[500px] flex flex-col items-center">
              <h2 className="text-lg text-black mb-8">Profile Settings</h2>
              
              {/* Avatar Circle */}
              <div className="w-32 h-32 rounded-full border border-gray-300 mb-6"></div>
              
              {/* Upload Button */}
              <button className="bg-[#3B69B8] hover:bg-[#2d5497] text-white text-sm font-medium px-6 py-2 rounded-sm shadow-sm transition-colors mb-8">
                Upload Logo
              </button>

              {/* Toggles List */}
              <div className="w-full flex flex-col gap-6 mt-4">
                
                {/* Toggle 1 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black">Enable Email Notifications</span>
                  <button 
                    onClick={() => handleToggle('emailNotif')}
                    className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${toggles.emailNotif ? 'bg-[#29A3D9]' : 'bg-gray-400'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${toggles.emailNotif ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Toggle 2 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black">Enable Sms Alerts</span>
                  <button 
                    onClick={() => handleToggle('smsAlerts')}
                    className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${toggles.smsAlerts ? 'bg-[#29A3D9]' : 'bg-gray-400'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${toggles.smsAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Toggle 3 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black">Allow Self Registration</span>
                  <button 
                    onClick={() => handleToggle('selfReg')}
                    className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${toggles.selfReg ? 'bg-[#29A3D9]' : 'bg-gray-400'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${toggles.selfReg ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default Settings