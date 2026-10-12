import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from './Toast.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()


  const onLogout = () => {
    signOut().then(() => {
      toast('Logged out successfully')
      navigate('/login')
    })
  }

  const linksForRole = (role) => {
    if (role === 'Donor') return [
      { to: '/', label: 'Home' },
      { to: '/event-prediction', label: 'Event Prediction' },
      { to: '/csr-dashboard', label: 'CSR Dashboard' },
      { to: '/donation-history', label: 'Donation History' },
    ]
    if (role === 'NGO') return [
      { to: '/', label: 'Home' },
      { to: '/ngo-dashboard', label: 'NGO Dashboard' },
      { to: '/surplus-alerts', label: 'Surplus Alerts' },
      { to: '/emergency', label: 'Emergency Mode' },
    ]
    if (role === 'Admin') return [
      { to: '/', label: 'Home' },
      { to: '/admin', label: 'Admin Dashboard' },
      { to: '/event-prediction', label: 'Event Prediction' },
      { to: '/ngo-matching', label: 'NGO Matching' },
      { to: '/surplus-alerts', label: 'Surplus Alerts' },
      { to: '/emergency', label: 'Emergency Mode' },
    ]
    // Guest: only Home
    return [
      { to: '/', label: 'Home' },
    ]
  }

  const role = profile?.type || 'Guest'
  const navLinks = linksForRole(role)

  return (
    <header className="bg-white/80 backdrop-blur sticky top-0 z-20 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary-600 text-white grid place-content-center font-bold">ZB</div>
            <span className="font-semibold text-lg">ZeroBite</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to} className={({isActive}) => isActive ? 'text-primary-700 font-semibold' : 'text-gray-700 hover:text-primary-700'}>{l.label}</NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{profile?.type || 'Donor'} • {profile?.name || user.email}</span>
                <button className="btn btn-outline h-9" onClick={onLogout}>Logout</button>
              </div>
            ) : (
              <>
                <button className="btn btn-outline h-9" onClick={() => navigate('/login')}>Login</button>
                <button className="btn btn-primary h-9" onClick={() => navigate('/login')}>Sign Up</button>
              </>
            )}
          </div>
        </div>
      </div>


      <div className="md:hidden border-t bg-white">
        <div className="container mx-auto px-4 py-3 grid grid-cols-2 gap-3">
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to} className={({isActive}) => `text-sm ${isActive ? 'text-primary-700 font-semibold' : 'text-gray-700'}`}>{l.label}</NavLink>
          ))}
        </div>
      </div>
    </header>
  )
}
