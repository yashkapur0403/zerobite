import { useState, useMemo } from 'react'
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout.jsx'
import { toast } from '../components/Toast.jsx'

const INITIAL_USERS = [
  { uid: 'demo-uid-001', name: 'Arjun Mehta', email: 'demo@zerobite.app', type: 'Donor', status: 'Active', joined: 'Oct 2025', location: 'Jaipur' },
  { uid: 'ngo-uid-001', name: 'FoodAid Trust', email: 'ngo@zerobite.app', type: 'NGO', status: 'Active', joined: 'Mar 2025', location: 'C-Scheme, Jaipur' },
  { uid: 'admin-uid-001', name: 'Priya Sharma', email: 'admin@zerobite.app', type: 'Admin', status: 'Active', joined: 'Jan 2025', location: 'Mumbai' },
  { uid: 'ngo-uid-002', name: 'HungerFree Foundation', email: 'hunger@ngo.in', type: 'NGO', status: 'Active', joined: 'Sep 2025', location: 'Vaishali Nagar' },
  { uid: 'usr-uid-003', name: 'Ravi Patel', email: 'ravi@donor.in', type: 'Donor', status: 'Active', joined: 'Aug 2025', location: 'Mansarovar' },
  { uid: 'usr-uid-004', name: 'TechCorp CSR Banquet', email: 'csr@techcorp.in', type: 'Donor', status: 'Active', joined: 'Jul 2025', location: 'Sitapura' },
  { uid: 'ngo-uid-003', name: 'Share & Care Society', email: 'share@ngo.org', type: 'NGO', status: 'Active', joined: 'May 2025', location: 'Malviya Nagar' },
]

export default function AdminDashboard() {
  const { profile } = useAuth()
  const { surplusItems, acceptedItems, ngos, emergencyActive } = useData()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('overview')
  const [userRoleFilter, setUserRoleFilter] = useState('All')
  const [usersList, setUsersList] = useState(INITIAL_USERS)
  const [searchQuery, setSearchQuery] = useState('')

  // Access guard
  if (profile?.type !== 'Admin') {
    return (
      <div className="card p-10 text-center space-y-4 max-w-md mx-auto my-12">
        <p className="text-5xl">🚫</p>
        <h2 className="text-xl font-bold text-red-600">Admin Privileges Required</h2>
        <p className="text-gray-600 text-sm">
          You must be signed in with an administrative account to view this control panel.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Sign In as Admin
        </button>
      </div>
    )
  }

  // Filtered users
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchRole = userRoleFilter === 'All' || u.type === userRoleFilter
      const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.location.toLowerCase().includes(searchQuery.toLowerCase())
      return matchRole && matchSearch
    })
  }, [usersList, userRoleFilter, searchQuery])

  // Aggregate stats
  const totalMeals = useMemo(() => {
    return surplusItems.reduce((acc, it) => acc + (Number(it.quantity || it.predictedSurplus || 0)), 0)
  }, [surplusItems])

  const totalPickups = acceptedItems.length
  const activeAlerts = surplusItems.filter(i => i.status === 'Active').length

  const toggleUserStatus = (uid) => {
    setUsersList(prev => prev.map(u => {
      if (u.uid === uid) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active'
        toast(`User status changed to ${nextStatus}`, 'info')
        return { ...u, status: nextStatus }
      }
      return u
    }))
  }

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>

      {/* MODULE 1: PLATFORM OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Platform Analytics &amp; KPIs</h3>
            <p className="text-xs text-gray-500">Live operational telemetry across donors and partner NGOs</p>
          </div>

          {emergencyActive && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-red-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl animate-pulse">🚨</span>
                <div>
                  <p className="text-sm font-bold">EMERGENCY MODE ACTIVE ON PLATFORM</p>
                  <p className="text-xs text-red-600">Urgent food surplus broadcast is engaged for all nearby NGOs.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/emergency')}
                className="btn btn-outline text-xs border-red-300 text-red-800 hover:bg-red-100"
              >
                Manage Emergency
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4 border border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Total Food Surplus</span>
                <span className="text-lg">🍲</span>
              </div>
              <p className="text-2xl font-bold text-primary-800 mt-1">{totalMeals}+</p>
              <p className="text-[11px] text-gray-400 mt-1">Meals logged this cycle</p>
            </div>

            <div className="card p-4 border border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Active Broadcasts</span>
                <span className="text-lg">📡</span>
              </div>
              <p className="text-2xl font-bold text-amber-600 mt-1">{activeAlerts}</p>
              <p className="text-[11px] text-amber-600 font-medium mt-1">Awaiting NGO response</p>
            </div>

            <div className="card p-4 border border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Accepted Pickups</span>
                <span className="text-lg">✅</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{totalPickups}</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Completed / in route</p>
            </div>

            <div className="card p-4 border border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Partner NGOs</span>
                <span className="text-lg">🤝</span>
              </div>
              <p className="text-2xl font-bold text-purple-700 mt-1">{ngos.length}</p>
              <p className="text-[11px] text-gray-400 mt-1">Verified organizations</p>
            </div>
          </div>

          {/* Quick summary split */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-5 border border-gray-100 space-y-3">
              <h4 className="font-bold text-sm text-gray-800">Recent Surplus Broadcasts</h4>
              <div className="space-y-2">
                {surplusItems.slice(0, 4).map(it => (
                  <div key={it.id} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-gray-800">{it.donor} • {it.foodType}</p>
                      <p className="text-gray-500">{it.location} • {it.quantity || it.predictedSurplus} portions</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${
                      it.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {it.status}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab('surplus')}
                className="text-xs font-semibold text-primary-700 hover:underline block pt-1"
              >
                View all surplus items →
              </button>
            </div>

            <div className="card p-5 border border-gray-100 space-y-3">
              <h4 className="font-bold text-sm text-gray-800">Quick System Actions</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setActiveTab('users')}
                  className="p-3 rounded-xl border border-gray-200 text-left hover:bg-gray-50 transition"
                >
                  <p className="font-bold text-gray-800">👥 Manage Users</p>
                  <p className="text-gray-500 mt-0.5">{usersList.length} registered profiles</p>
                </button>
                <button
                  onClick={() => setActiveTab('ngos')}
                  className="p-3 rounded-xl border border-gray-200 text-left hover:bg-gray-50 transition"
                >
                  <p className="font-bold text-gray-800">🤝 NGO Directory</p>
                  <p className="text-gray-500 mt-0.5">Inspect capacities</p>
                </button>
                <button
                  onClick={() => navigate('/ngo-matching')}
                  className="p-3 rounded-xl border border-gray-200 text-left hover:bg-gray-50 transition"
                >
                  <p className="font-bold text-gray-800">⚖️ Priority Algorithm</p>
                  <p className="text-gray-500 mt-0.5">Capacity ÷ Distance test</p>
                </button>
                <button
                  onClick={() => navigate('/event-prediction')}
                  className="p-3 rounded-xl border border-gray-200 text-left hover:bg-gray-50 transition"
                >
                  <p className="font-bold text-gray-800">⚡ Test Predictor</p>
                  <p className="text-gray-500 mt-0.5">Event guest calculation</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: USER DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-fade">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">User Management Directory</h3>
              <p className="text-xs text-gray-500">Monitor accounts across Donors, NGOs, and Administrators</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by name, email, city..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs w-48 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
                className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs bg-white focus:outline-none"
              >
                <option value="All">All Roles</option>
                <option value="Donor">Donors</option>
                <option value="NGO">NGOs</option>
                <option value="Admin">Admins</option>
              </select>
            </div>
          </div>

          <div className="card p-0 border border-gray-200 overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-left font-semibold">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map(u => (
                    <tr key={u.uid} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[10px]">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{u.name}</p>
                            <p className="text-[11px] text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          u.type === 'Donor' ? 'bg-blue-100 text-blue-700' :
                          u.type === 'NGO' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {u.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{u.location}</td>
                      <td className="py-3 px-4 text-gray-400">{u.joined}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {u.type !== 'Admin' && (
                          <button
                            onClick={() => toggleUserStatus(u.uid)}
                            className="text-xs text-gray-500 hover:text-purple-700 underline font-medium"
                          >
                            {u.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: SURPLUS MONITOR */}
      {activeTab === 'surplus' && (
        <div className="space-y-4 animate-fade">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Food Surplus Feed Monitor</h3>
            <p className="text-xs text-gray-500">Live inventory of reported meals, catering surplus, and pickup requests</p>
          </div>

          <div className="card p-0 border border-gray-200 overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-left font-semibold">
                  <tr>
                    <th className="py-3 px-4">Donor / Source</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Meals Qty</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reported</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {surplusItems.slice(0, 15).map(it => (
                    <tr key={it.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-800">{it.donor}</td>
                      <td className="py-3 px-4 text-gray-600">{it.location}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                          {it.foodType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-primary-800">
                        {it.quantity || it.predictedSurplus} portions
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          it.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {it.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {it.createdAt ? new Date(it.createdAt).toLocaleDateString() : 'Today'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 4: PARTNER NGOS */}
      {activeTab === 'ngos' && (
        <div className="space-y-4 animate-fade">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Partner NGOs Directory</h3>
            <p className="text-xs text-gray-500">Verified distribution partners, vehicle capacities, and meal specializations</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ngos.map(ngo => (
              <div key={ngo.id} className="card p-4 border border-gray-200 bg-white space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-sm text-gray-900">{ngo.name}</h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-gray-500">{ngo.location}</p>
                <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Meal Capacity</span>
                    <span className="font-bold text-primary-800">{ngo.capacity} meals</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Serving Preference</span>
                    <span className="font-semibold text-gray-700">{ngo.foodType}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 5: SYSTEM LOGS */}
      {activeTab === 'activity' && (
        <div className="space-y-4 animate-fade">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Audit &amp; Activity Log</h3>
            <p className="text-xs text-gray-500">Chronological telemetry of donor announcements and pickups</p>
          </div>

          <div className="card p-4 border border-gray-200 bg-white space-y-3">
            {[
              { id: 1, action: 'Surplus Broadcast', desc: 'Arjun Mehta logged 80 meals for wedding banquet', time: 'Just now', icon: '🍲' },
              { id: 2, action: 'NGO Acceptance', desc: 'FoodAid Trust accepted pickup at C-Scheme Hall', time: '12 min ago', icon: '✅' },
              { id: 3, action: 'Prediction Run', desc: 'Predicted surplus calculated: 110 meals at JLN Marg', time: '1 hour ago', icon: '⚡' },
              { id: 4, action: 'NGO Registry', desc: 'HungerFree verified for Dry Rations pickup', time: '3 hours ago', icon: '🤝' },
              { id: 5, action: 'Admin Auth', desc: 'Super admin Priya Sharma accessed platform console', time: 'Today', icon: '🛡️' },
            ].map(log => (
              <div key={log.id} className="p-3 rounded-xl bg-gray-50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{log.icon}</span>
                  <div>
                    <p className="font-bold text-gray-800">{log.action}</p>
                    <p className="text-gray-500">{log.desc}</p>
                  </div>
                </div>
                <span className="text-gray-400 font-medium">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </AdminLayout>
  )
}
