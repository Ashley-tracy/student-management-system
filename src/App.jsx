import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'

// Auth
import Login from './pages/auth/Login'
import AdminLogin from './pages/auth/AdminLogin'


// Dashboards
import StudentDashboard from './pages/student/Dashboard'
import TrainerDashboard from './pages/trainer/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'
import Courses from './pages/admin/Courses'
import Students from './pages/admin/Students'
import Trainers from './pages/admin/Trainers'
import Settings from './pages/admin/Settings'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      
      {/* Admin Login - Added multiple formats just in case */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/adminlogin" element={<AdminLogin />} />
      
      {/* Dashboard Routes */}
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/courses" element={<Courses />} />
      <Route path="/admin/students" element={<Students />} />
      <Route path="/admin/trainers" element={<Trainers />} />
      <Route path="/admin/settings" element={<Settings />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App