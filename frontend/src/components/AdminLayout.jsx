import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { DEMO_MODE } from '../firebase'

export default function AdminLayout({ activeTab, onTabChange, children }) {
  const { user, profile, signOut } = useAuth()
  const { resetDemoState } = useData()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'overview', label: 'Platform Overview', icon: '📊' },
    { id: 'users', label: 'User Directory', icon: '👥' },
    { id: 'surplus', label: 'Surplus Monitor', icon: '📡' },
    { id: 'ngos', label: 'Partner NGOs', icon: '🤝' },
    { id: 'activity', label: 'Activity Logs', icon: '📜' },
  ]

  const handleLogout = () => {
    signOut().then(() => navigate('/login'))
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/60 overflow-hidden shadow-sm">
      {/* Top Admin Shell Header */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg tracking-wide text-white">ZeroBite Admin Console</h2>
              <span className="bg-purple-500/20 text-purple-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-purple-500/30">
                Super Admin
              </span>
              {DEMO_MODE && (
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in as {profile?.name || user?.email} ({profile?.address || 'System Admin'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetDemoState}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ↺ Reset Demo Data
          </button>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 transition"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row min-h-[580px]">
        {/* Admin Navigation Sidebar / Shell */}
        <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-4 shrink-0 space-y-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">
              System Modules
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      isActive
                        ? 'bg-purple-50 text-purple-800 border border-purple-200 shadow-xs'
                        : 'text-gray-600 hover:bg-gray-100/70 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">
              Quick Shortcuts
            </p>
            <div className="space-y-1">
              <button
                onClick={() => onTabChange('surplus')}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-primary-700 transition text-left"
              >
                <span>📡</span> Surplus Monitor
              </button>
              <Link
                to="/ngo-matching"
                className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-primary-700 transition"
              >
                <span>🤝</span> Matchmaking Matrix
              </Link>
              <Link
                to="/emergency"
                className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition"
              >
                <span>🚨</span> Emergency Switch
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Admin View Container */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
