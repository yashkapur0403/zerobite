import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import EventPrediction from './pages/EventPrediction.jsx'
import NGOMatching from './pages/NGOMatching.jsx'
import NGODashboard from './pages/NGODashboard.jsx'
import CSRDashboard from './pages/CSRDashboard.jsx'
import EmergencyMode from './pages/EmergencyMode.jsx'
import DonationHistory from './pages/DonationHistory.jsx'
import SurplusAlerts from './pages/SurplusAlerts.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import Toast from './components/Toast.jsx'
import { toast } from './components/Toast.jsx'
import { useAuth } from './context/AuthContext.jsx'

function App() {
  const location = useLocation()
  const RequireAuth = ({ children }) => {
    const { user, loading } = useAuth()
    if (loading) return null
    if (!user) {
      toast('Please log in to access this feature.', 'info')
      return <Navigate to="/login" replace />
    }
    return children
  }
  const RequireAdmin = ({ children }) => {
    const { user, profile, loading } = useAuth()
    if (loading) return null
    if (!user) return <Navigate to="/login" replace />
    if (profile?.type !== 'Admin') {
      toast('Admin access required.', 'info')
      return <Navigate to="/" replace />
    }
    return children
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div key={location.pathname} className="animate-fade">
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/event-prediction" element={<RequireAuth><EventPrediction /></RequireAuth>} />
            <Route path="/ngo-matching" element={<RequireAuth><NGOMatching /></RequireAuth>} />
            <Route path="/ngo-dashboard" element={<RequireAuth><NGODashboard /></RequireAuth>} />
            <Route path="/csr-dashboard" element={<RequireAuth><CSRDashboard /></RequireAuth>} />
            <Route path="/emergency" element={<RequireAuth><EmergencyMode /></RequireAuth>} />
            <Route path="/donation-history" element={<RequireAuth><DonationHistory /></RequireAuth>} />
            <Route path="/surplus-alerts" element={<RequireAuth><SurplusAlerts /></RequireAuth>} />
            <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          </Routes>
        </div>
      </main>
      <footer className="text-center text-sm text-gray-500 py-6">© 2025 ZeroBite | Smart Food Waste Management.</footer>
      <Toast />
    </div>
  )
}

export default App
