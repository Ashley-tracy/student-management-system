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

// Guards
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* ---------- Public ---------- */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ---------- Admin (role: admin only) ---------- */}
      <Route element={<ProtectedRoute allow={['admin']} />}>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/courses" element={<Courses />} />
        <Route path="/admin/students" element={<Students />} />
        <Route path="/admin/trainers" element={<Trainers />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Route>

      {/* ---------- Trainer (role: trainer only) ---------- */}
      <Route element={<ProtectedRoute allow={['trainer']} />}>
        <Route path="/trainer" element={<Navigate to="/trainer/dashboard" replace />} />
        <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
      </Route>

      {/* ---------- Student (role: student only) ---------- */}
      <Route element={<ProtectedRoute allow={['student']} />}>
        <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
      </Route>

      {/* ---------- Catch-all ---------- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App