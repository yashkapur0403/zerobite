import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { toast } from '../components/Toast.jsx'

export default function NGODashboard() {
  const { profile } = useAuth()
  const { surplusItems, acceptedItems, acceptSurplusItem, emergencyActive } = useData()

  const [deliveryStatus, setDeliveryStatus] = useState({})

  const ngoName = profile?.name || 'FoodAid Trust'

  // Surplus available for pickup
  const activeAlerts = useMemo(() => {
    return surplusItems.filter(s => s.status === 'Active').slice(0, 5)
  }, [surplusItems])

  // Accepted pickups
  const stats = useMemo(() => {
    const totalPickups = acceptedItems.length
    const totalMeals = acceptedItems.reduce((s, x) => s + (Number(x.quantity ?? x.predictedSurplus ?? 0) || 0), 0)
    const byFood = acceptedItems.reduce((m, x) => {
      const k = x.foodType || 'Cooked Meals'
      m[k] = (m[k] || 0) + (Number(x.quantity ?? x.predictedSurplus ?? 0) || 0)
      return m
    }, {})
    const topFood = Object.entries(byFood).sort((a, b) => b[1] - a[1]).slice(0, 3)

    return { totalPickups, totalMeals, topFood }
  }, [acceptedItems])

  const handleAccept = async (id) => {
    try {
      await acceptSurplusItem(id, ngoName)
      toast('Surplus pickup confirmed and assigned to your team!', 'success')
    } catch (e) {
      toast('Failed to accept pickup', 'error')
    }
  }

  const markDelivered = (id) => {
    setDeliveryStatus(prev => ({ ...prev, [id]: 'Delivered' }))
    toast('Pickup marked as Distributed to Beneficiaries! 🎉', 'success')
  }

  return (
    <section className="space-y-6">

      {/* Header */}
      <div className="card p-6 bg-gradient-to-r from-emerald-700 via-teal-700 to-primary-700 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
                NGO Portal
              </span>
              <span className="text-xs text-emerald-100">• {profile?.address || 'C-Scheme, Jaipur'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-2">
              Welcome, {ngoName} 🤝
            </h1>
            <p className="text-sm text-emerald-100 mt-1 max-w-xl">
              Track incoming food surplus broadcasts, manage rescue logistics, and distribute meals to communities in need.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/surplus-alerts"
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 font-semibold text-sm hover:bg-emerald-50 transition shadow-sm flex items-center gap-1.5"
            >
              <span>🔔</span> View All Surplus ({surplusItems.filter(s=>s.status==='Active').length})
            </Link>
            <Link
              to="/emergency"
              className="px-4 py-2.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-semibold text-sm transition shadow-sm flex items-center gap-1.5"
            >
              <span>🚨</span> Emergency Drive
            </Link>
          </div>
        </div>
      </div>

      {/* Emergency banner if active */}
      {emergencyActive && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">🚨</span>
            <div>
              <p className="text-sm font-bold">EMERGENCY FOOD ALERT BROADCAST IS ACTIVE</p>
              <p className="text-xs text-red-700">Immediate response requested. Please check surplus alerts and coordinate rapid pickup.</p>
            </div>
          </div>
          <Link to="/surplus-alerts" className="btn btn-primary text-xs bg-red-600 hover:bg-red-700">
            View Urgent Alerts
          </Link>
        </div>
      )}

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 border border-emerald-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Total Pickups Completed</span>
            <span className="text-xl">🚛</span>
          </div>
          <p className="text-2xl font-bold text-emerald-800 mt-1">{stats.totalPickups}</p>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">Verified food rescues</p>
        </div>

        <div className="card p-5 border border-emerald-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Beneficiary Meals Delivered</span>
            <span className="text-xl">🍲</span>
          </div>
          <p className="text-2xl font-bold text-emerald-800 mt-1">{stats.totalMeals}</p>
          <p className="text-[11px] text-gray-500 mt-1">Direct community impact</p>
        </div>

        <div className="card p-5 border border-emerald-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Top Food Distribution</span>
            <span className="text-xl">📊</span>
          </div>
          <div className="mt-2 space-y-1">
            {stats.topFood.map(([category, count]) => (
              <div key={category} className="flex justify-between text-xs">
                <span className="text-gray-600">{category}</span>
                <span className="font-semibold text-emerald-800">{count} meals</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Immediate Pickups Requiring Response */}
      <div className="card p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg text-primary-800">Fresh Surplus Alerts in Your Area</h3>
            <p className="text-xs text-gray-500">Donors waiting for NGO claim and pickup dispatch</p>
          </div>
          <Link to="/surplus-alerts" className="text-xs font-semibold text-primary-700 hover:underline">
            View Full Feed ({surplusItems.filter(s=>s.status==='Active').length}) →
          </Link>
        </div>

        {activeAlerts.length === 0 ? (
          <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-xl text-center">
            All current surplus items have been claimed! Check back soon or monitor incoming feeds.
          </p>
        ) : (
          <div className="grid gap-3">
            {activeAlerts.map(a => (
              <div key={a.id} className="p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">{a.donor}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-primary-100 text-primary-800 font-medium">
                      {a.foodType}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">📍 {a.location} • <strong className="text-emerald-700">{a.quantity || a.predictedSurplus} meals</strong> available</p>
                </div>
                <button
                  onClick={() => handleAccept(a.id)}
                  className="btn btn-primary text-xs py-2 px-4 shadow-sm self-start sm:self-auto shrink-0"
                >
                  Claim &amp; Dispatch Pickup
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accepted Pickups Table & Workflow Management */}
      <div className="card p-6 border border-gray-100">
        <h3 className="font-bold text-lg text-primary-800 mb-1">Your Scheduled &amp; Completed Pickups</h3>
        <p className="text-xs text-gray-500 mb-4">Manage dispatch stages from pickup to beneficiary distribution</p>

        {acceptedItems.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No accepted pickups yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-left font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Donor / Event</th>
                  <th className="py-2.5 px-3">Pickup Location</th>
                  <th className="py-2.5 px-3">Meals</th>
                  <th className="py-2.5 px-3">Food Type</th>
                  <th className="py-2.5 px-3">Accepted Time</th>
                  <th className="py-2.5 px-3 text-right">Workflow Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {acceptedItems.slice(0, 8).map(r => {
                  const isDelivered = deliveryStatus[r.id] === 'Delivered'
                  return (
                    <tr key={r.id} className="hover:bg-gray-50/70">
                      <td className="py-3 px-3 font-semibold text-gray-800">{r.donor}</td>
                      <td className="py-3 px-3 text-gray-600">{r.location}</td>
                      <td className="py-3 px-3 font-bold text-emerald-700">{r.quantity ?? r.predictedSurplus ?? 0}</td>
                      <td className="py-3 px-3 text-gray-600">{r.foodType}</td>
                      <td className="py-3 px-3 text-gray-400">
                        {r.acceptedAt ? new Date(r.acceptedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isDelivered ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                            ✅ Distributed
                          </span>
                        ) : (
                          <button
                            onClick={() => markDelivered(r.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold border border-emerald-200 transition"
                          >
                            Mark Delivered ✓
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </section>
  )
}
