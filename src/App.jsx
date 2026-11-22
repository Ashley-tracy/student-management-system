import { Routes, Route } from 'react-router-dom'

// Landing Page
import Landing from './pages/Landing'

export default function App() {
  return (
    <Routes>
      // Main Landing Page
      <Route path="/" element={<Landing />} />
    </Routes>
  )
}