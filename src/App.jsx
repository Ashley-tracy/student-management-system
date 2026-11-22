import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'

// Auth Pages
import Login from './pages/auth/Login'
import AdminLogin from './pages/auth/AdminLogin'

// Dashboards
import StudentDashboard from './pages/student/Dashboard'
// import TrainerDashboard from './pages/trainer/Dashboard'
import TrainerDashboard from './pages/trainer/Dashboard'
// import AdminDashboard from './pages/admin/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      
      {/* Login Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* Dashboard Routes */}
      <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
       <Route path="/admin/dashboard" element={<AdminDashboard />} />
       
      {/* Catch-all: If URL doesn't match anything, go to landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App