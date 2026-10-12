import { useMemo } from 'react'
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { DEMO_MODE } from '../firebase'
import seedSurplus from '../data/surplus.json'
import seedNgos from '../data/ngos.json'

// ── Platform-wide demo stats ──────────────────────────────────────────────────
const DEMO_STATS = {
  totalUsers: 42,
  totalDonors: 29,
  totalNGOs: 12,
  totalAdmins: 1,
  mealsSaved: seedSurplus.reduce((s, x) => s + (x.predictedSurplus || 0), 0),
  activeAlerts: seedSurplus.filter(x => x.status === 'Active').length,
  totalNGOsRegistered: seedNgos.length,
  co2Prevented: Math.round(seedSurplus.reduce((s, x) => s + (x.predictedSurplus || 0), 0) * 0.45),
}

// Mock recent activity log
const DEMO_ACTIVITY = [
  { id: 1, type: 'donation',  msg: 'Arjun Mehta submitted a surplus alert — 80 meals', time: '2 min ago', icon: '🍽' },
  { id: 2, type: 'accept',    msg: 'Hope Foundation accepted a pickup in Jaipur',       time: '15 min ago', icon: '✅' },
  { id: 3, type: 'register',  msg: 'New NGO registered: Green Meals Initiative',         time: '1 hr ago',  icon: '🤝' },
  { id: 4, type: 'emergency', msg: 'Emergency mode triggered for Andheri West',          time: '3 hr ago',  icon: '🚨' },
  { id: 5, type: 'donation',  msg: 'TechCorp CSR donated 200 meals equivalent',          time: '5 hr ago',  icon: '🏢' },
  { id: 6, type: 'accept',    msg: 'Seva Samiti accepted pickup in Mumbai',               time: '8 hr ago',  icon: '✅' },
]

const DEMO_USERS = [
  { uid: DEMO_ACCOUNTS[0].uid, name: DEMO_ACCOUNTS[0].profile.name, email: DEMO_ACCOUNTS[0].email, type: 'Donor',  status: 'Active',  joined: 'Oct 2025' },
  { uid: DEMO_ACCOUNTS[1].uid, name: DEMO_ACCOUNTS[1].profile.name, email: DEMO_ACCOUNTS[1].email, type: 'Admin',  status: 'Active',  joined: 'Jan 2025' },
  { uid: 'ngo-uid-001', name: 'Hope Foundation',        email: 'hope@ngo.in',        type: 'NGO',    status: 'Active',  joined: 'Mar 2025' },
  { uid: 'ngo-uid-002', name: 'Green Meals Initiative', email: 'green@ngo.in',       type: 'NGO',    status: 'Active',  joined: 'Sep 2025' },
  { uid: 'usr-uid-003', name: 'Ravi Patel',             email: 'ravi@donor.in',      type: 'Donor',  status: 'Active',  joined: 'Aug 2025' },
  { uid: 'usr-uid-004', name: 'TechCorp CSR',           email: 'csr@techcorp.in',    type: 'Donor',  status: 'Suspended', joined: 'Jul 2025' },
]

const typeBadge = { Donor: 'bg-blue-100 text-blue-700', NGO: 'bg-green-100 text-green-700', Admin: 'bg-purple-100 text-purple-700' }
const statusBadge = { Active: 'bg-emerald-100 text-emerald-700', Suspended: 'bg-red-100 text-red-700' }

export default function AdminDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  // Guard: redirect non-admins
  if (profile?.type !== 'Admin') {
    return (
      <div className="card p-10 text-center space-y-4">
        <p className="text-5xl">🚫</p>
        <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
        <p className="text-gray-600 text-sm">This page is only accessible to Admin users.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
      </div>
    )
  }

  const stats = DEMO_STATS

  return (
    <section className="space-y-8">

      {/* Header */}
      <div className="card p-6 bg-gradient-to-r from-primary-700 to-primary-500 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-primary-100 text-sm font-medium">Admin Panel</p>
            <h2 className="text-2xl font-bold mt-1">Welcome, {profile.name} 👑</h2>
            <p className="text-primary-200 text-sm mt-1">{profile.email} • {profile.address}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">Admin Account</span>
            {DEMO_MODE && <span className="px-3 py-1 rounded-full bg-amber-400/30 text-amber-100 text-xs font-semibold">Demo Mode</span>}
          </div>
        </div>
      </div>

      {/* Platform stats */}
      <div>
        <h3 className="text-base font-semibold text-gray-700 mb-3">Platform Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users',      value: stats.totalUsers,         icon: '👥' },
            { label: 'Donors',           value: stats.totalDonors,        icon: '🍽' },
            { label: 'NGOs Registered',  value: stats.totalNGOsRegistered, icon: '🤝' },
            { label: 'Meals Saved',      value: `${stats.mealsSaved}+`,   icon: '✅' },
            { label: 'Active Alerts',    value: stats.activeAlerts,       icon: '🔔' },
            { label: 'CO₂ Prevented',   value: `${stats.co2Prevented} kg`, icon: '🌍' },
            { label: 'Admin Accounts',   value: stats.totalAdmins,        icon: '👑' },
            { label: 'NGOs (Active)',    value: stats.totalNGOs,          icon: '🏢' },
          ].map(s => (
            <div key={s.label} className="card p-4 flex flex-col gap-1">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              <p className="text-xl font-bold text-primary-800">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Users table + Activity side by side */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Users table */}
        <div className="md:col-span-2 card p-6 space-y-4">
          <h3 className="font-semibold text-primary-800">User Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="text-left py-2 pr-4 font-medium">Name</th>
                  <th className="text-left py-2 pr-4 font-medium">Email</th>
                  <th className="text-left py-2 pr-4 font-medium">Role</th>
                  <th className="text-left py-2 pr-4 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {DEMO_USERS.map(u => (
                  <tr key={u.uid} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                          {u.name.split(' ').map(w => w[0]).join('').slice(0,2)}
                        </div>
                        <span className="font-medium text-gray-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-500 text-xs">{u.email}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge[u.type]}`}>{u.type}</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[u.status]}`}>{u.status}</span>
                    </td>
                    <td className="py-2.5 text-gray-500 text-xs">{u.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {DEMO_MODE && (
            <p className="text-xs text-gray-400 mt-2">Demo data — connect Firebase to see real users.</p>
          )}
        </div>

        {/* Activity feed */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-primary-800">Recent Activity</h3>
          <div className="space-y-3">
            {DEMO_ACTIVITY.map(a => (
              <div key={a.id} className="flex gap-3 items-start">
                <span className="text-lg shrink-0">{a.icon}</span>
                <div>
                  <p className="text-sm text-gray-700 leading-snug">{a.msg}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-primary-800">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'View Surplus Alerts', to: '/surplus-alerts',    icon: '🔔' },
            { label: 'NGO Matching',        to: '/ngo-matching',      icon: '🤝' },
            { label: 'Donation History',    to: '/donation-history',  icon: '📋' },
            { label: 'Emergency Mode',      to: '/emergency',         icon: '🚨' },
          ].map(a => (
            <button key={a.to} onClick={() => navigate(a.to)}
              className="card p-4 flex items-center gap-3 hover:bg-primary-50 transition-colors text-left group">
              <span className="text-2xl">{a.icon}</span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

    </section>
  )
}
