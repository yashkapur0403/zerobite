import { useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import DonorDashboard from './pages/DonorDashboard.jsx'
import EventPrediction from './pages/EventPrediction.jsx'
import NGOMatching from './pages/NGOMatching.jsx'
import NGODashboard from './pages/NGODashboard.jsx'
import CSRDashboard from './pages/CSRDashboard.jsx'
import EmergencyMode from './pages/EmergencyMode.jsx'
import DonationHistory from './pages/DonationHistory.jsx'
import SurplusAlerts from './pages/SurplusAlerts.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import Toast, { toast } from './components/Toast.jsx'
import { useAuth } from './context/AuthContext.jsx'

// Base authentication check
function RequireAuth({ children }) {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      toast('Please log in to access this feature.', 'info')
    }
  }, [user, loading])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

// Role-based route guard
function RequireRole({ allowedRoles, children }) {
  const { user, profile, loading } = useAuth()
  const userRole = profile?.type || 'Donor'
  const isUnauthorized = !loading && user && !allowedRoles.includes(userRole)
  const isUnauthenticated = !loading && !user

  useEffect(() => {
    if (isUnauthenticated) {
      toast('Please log in to continue.', 'info')
    } else if (isUnauthorized) {
      toast(`Access restricted to ${allowedRoles.join(' / ')} accounts.`, 'warning')
    }
  }, [isUnauthenticated, isUnauthorized, allowedRoles])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (isUnauthorized) return <Navigate to={userRole === 'Admin' ? '/admin' : '/'} replace />
  return children
}

// Admin-only route guard
function RequireAdmin({ children }) {
  const { user, profile, loading } = useAuth()
  const isNotAdmin = !loading && user && profile?.type !== 'Admin'
  const isUnauthenticated = !loading && !user

  useEffect(() => {
    if (isUnauthenticated) {
      toast('Please log in as administrator.', 'info')
    } else if (isNotAdmin) {
      toast('Administrator credentials required.', 'warning')
    }
  }, [isUnauthenticated, isNotAdmin])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (isNotAdmin) return <Navigate to="/" replace />
  return children
}

function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div key={location.pathname} className="animate-fade">
          <Routes location={location}>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* Donor route group */}
            <Route
              path="/donor-dashboard"
              element={<RequireRole allowedRoles={['Donor']}><DonorDashboard /></RequireRole>}
            />
            <Route
              path="/event-prediction"
              element={<RequireRole allowedRoles={['Donor']}><EventPrediction /></RequireRole>}
            />
            <Route
              path="/csr-dashboard"
              element={<RequireRole allowedRoles={['Donor']}><CSRDashboard /></RequireRole>}
            />

            {/* NGO route group */}
            <Route
              path="/ngo-dashboard"
              element={<RequireRole allowedRoles={['NGO']}><NGODashboard /></RequireRole>}
            />
            <Route
              path="/surplus-alerts"
              element={<RequireRole allowedRoles={['NGO']}><SurplusAlerts /></RequireRole>}
            />
            <Route
              path="/emergency"
              element={<RequireRole allowedRoles={['NGO', 'Admin']}><EmergencyMode /></RequireRole>}
            />

            {/* Shared authenticated routes */}
            <Route
              path="/ngo-matching"
              element={<RequireAuth><NGOMatching /></RequireAuth>}
            />
            <Route
              path="/donation-history"
              element={<RequireAuth><DonationHistory /></RequireAuth>}
            />

            {/* Admin route group */}
            <Route
              path="/admin"
              element={<RequireAdmin><AdminDashboard /></RequireAdmin>}
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      <footer className="text-center text-xs text-gray-500 py-6 border-t border-gray-100 bg-white">
        © 2025 ZeroBite | Smart Food Waste Management &amp; Priority Redistribution System.
      </footer>
      <Toast />
    </div>
  )
}

export default App
