import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// We will build these soon
import Login from './pages/auth/Login'
import AdminLogin from './pages/auth/AdminLogin'
import AdminDashboard from './pages/admin/Dashboard'
import TrainerDashboard from './pages/trainer/Dashboard'
import StudentDashboard from './pages/student/Dashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allow={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Future admin routes will go here */}
          </Route>

          {/* Trainer Routes */}
          <Route element={<ProtectedRoute allow={['trainer']} />}>
            <Route path="/trainer" element={<TrainerDashboard />} />
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allow={['student']} />}>
            <Route path="/student" element={<StudentDashboard />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}