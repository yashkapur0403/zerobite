import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { toast } from '../components/Toast.jsx'

export default function DonorDashboard() {
  const { user, profile } = useAuth()
  const { surplusItems, addSurplusItem } = useData()
  const navigate = useNavigate()

  // Quick donation modal / form state
  const [quickFormOpen, setQuickFormOpen] = useState(false)
  const [eventName, setEventName] = useState('')
  const [location, setLocation] = useState(profile?.address || '')
  const [foodType, setFoodType] = useState('Cooked Meals')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const donorName = profile?.name || 'Arjun Mehta'
  const donorId = user?.uid || 'demo-uid-001'

  // Filter surplus for this donor (or general active if in demo mode)
  const mySurplus = useMemo(() => {
    return surplusItems.filter(item => {
      if (item.donorId && item.donorId === donorId) return true
      if (item.donor && item.donor.toLowerCase().includes(donorName.toLowerCase().split(' ')[0])) return true
      return false
    })
  }, [surplusItems, donorId, donorName])

  // Total stats
  const stats = useMemo(() => {
    const totalReported = mySurplus.reduce((acc, it) => acc + (Number(it.quantity || it.predictedSurplus || 0)), 0)
    const activeAlerts = mySurplus.filter(it => it.status === 'Active').length
    const acceptedAlerts = mySurplus.filter(it => it.status === 'Accepted').length
    const mealsDonated = 320 + totalReported
    const co2Saved = (mealsDonated * 0.42).toFixed(1)
    return {
      activeAlerts,
      acceptedAlerts,
      mealsDonated,
      co2Saved,
    }
  }, [mySurplus])

  const handleQuickSubmit = async (e) => {
    e.preventDefault()
    if (!location || !quantity) {
      toast('Please provide location and quantity', 'warning')
      return
    }

    setSubmitting(true)
    try {
      await addSurplusItem({
        donor: donorName,
        donorId,
        eventName: eventName || 'Banquet Surplus',
        location,
        foodType,
        quantity: Number(quantity),
        predictedSurplus: Number(quantity),
        notes,
      })
      toast('Surplus broadcasted to all nearby NGOs!', 'success')
      setQuickFormOpen(false)
      setEventName('')
      setQuantity('')
      setNotes('')
    } catch (err) {
      toast('Failed to broadcast surplus.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="space-y-6">

      {/* Hero Welcome banner */}
      <div className="card p-6 bg-gradient-to-r from-primary-700 via-primary-600 to-emerald-600 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
                Donor Portal
              </span>
              <span className="text-xs text-primary-100">• {profile?.address || 'Jaipur, Rajasthan'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-2">
              Welcome back, {donorName} 👋
            </h1>
            <p className="text-sm text-primary-100 mt-1 max-w-xl">
              Monitor active surplus alerts, forecast event waste before celebrations end, and connect directly with verified NGOs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setQuickFormOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white text-primary-800 font-semibold text-sm hover:bg-primary-50 transition shadow-sm flex items-center gap-1.5"
            >
              <span>📢</span> Broadcast Surplus
            </button>
            <button
              onClick={() => navigate('/event-prediction')}
              className="px-4 py-2.5 rounded-xl bg-primary-800/80 hover:bg-primary-800 text-white font-semibold text-sm transition border border-white/20 flex items-center gap-1.5"
            >
              <span>⚡</span> Smart Predictor
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 border border-primary-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Active Broadcasts</span>
              <span className="text-lg">📡</span>
            </div>
            <p className="text-2xl font-bold text-primary-800 mt-1">{stats.activeAlerts}</p>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-2">Live for NGO pickup</p>
        </div>

        <div className="card p-4 border border-primary-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Total Meals Donated</span>
              <span className="text-lg">🍲</span>
            </div>
            <p className="text-2xl font-bold text-primary-800 mt-1">{stats.mealsDonated}</p>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Cumulative verified impact</p>
        </div>

        <div className="card p-4 border border-primary-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>CO₂ Emissions Prevented</span>
              <span className="text-lg">🌱</span>
            </div>
            <p className="text-2xl font-bold text-primary-800 mt-1">{stats.co2Saved} kg</p>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-2">Green footprint saved</p>
        </div>

        <div className="card p-4 border border-primary-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Current CSR Level</span>
              <span className="text-lg">🥈</span>
            </div>
            <p className="text-xl font-bold text-amber-600 mt-1">Silver Donor</p>
          </div>
          <Link to="/csr-dashboard" className="text-[11px] text-primary-700 font-medium mt-2 hover:underline">
            View Badges & Goals →
          </Link>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="card p-5 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
          Donor Operations Hub
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/event-prediction"
            className="p-3.5 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50/50 transition flex items-start gap-3 group"
          >
            <div className="h-10 w-10 rounded-lg bg-primary-100 text-primary-700 grid place-content-center text-lg shrink-0">
              📊
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-700">Surplus Predictor</p>
              <p className="text-xs text-gray-500 mt-0.5">Forecast meals surplus before events end.</p>
            </div>
          </Link>

          <Link
            to="/ngo-matching"
            className="p-3.5 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50/50 transition flex items-start gap-3 group"
          >
            <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 grid place-content-center text-lg shrink-0">
              🤝
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-700">NGO Matchmaking</p>
              <p className="text-xs text-gray-500 mt-0.5">Rank NGOs by distance and capacity.</p>
            </div>
          </Link>

          <Link
            to="/csr-dashboard"
            className="p-3.5 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50/50 transition flex items-start gap-3 group"
          >
            <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 grid place-content-center text-lg shrink-0">
              🏆
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-700">CSR Dashboard</p>
              <p className="text-xs text-gray-500 mt-0.5">Track carbon offsets and monthly goals.</p>
            </div>
          </Link>

          <Link
            to="/donation-history"
            className="p-3.5 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50/50 transition flex items-start gap-3 group"
          >
            <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-700 grid place-content-center text-lg shrink-0">
              📜
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-700">Donation History</p>
              <p className="text-xs text-gray-500 mt-0.5">Audit log of all accepted pickups.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Active Broadcasts & Live Status */}
      <div className="card p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-primary-800">Your Live Food Donations</h3>
            <p className="text-xs text-gray-500 mt-0.5">Track pickup status and matching progress for your surplus food.</p>
          </div>
          <button
            onClick={() => setQuickFormOpen(true)}
            className="btn btn-outline text-xs px-3 py-1.5"
          >
            + Post New Alert
          </button>
        </div>

        {mySurplus.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <p className="text-3xl mb-2">🍽</p>
            <p className="font-medium text-gray-700">No active surplus reports found</p>
            <p className="text-xs text-gray-500 mt-1">Broadcast excess meals or run an event prediction to alert NGOs.</p>
            <button
              onClick={() => setQuickFormOpen(true)}
              className="btn btn-primary mt-4 text-xs"
            >
              Report Food Surplus Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100 text-left">
                  <th className="py-2.5 pr-4 font-medium">Food Item / Event</th>
                  <th className="py-2.5 pr-4 font-medium">Location</th>
                  <th className="py-2.5 pr-4 font-medium">Portions</th>
                  <th className="py-2.5 pr-4 font-medium">Type</th>
                  <th className="py-2.5 pr-4 font-medium">Status</th>
                  <th className="py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mySurplus.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 pr-4 font-medium text-gray-800">
                      <div>
                        <p>{item.eventName || item.foodType}</p>
                        <p className="text-[11px] text-gray-400">ID: {item.id}</p>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-600 text-xs">{item.location}</td>
                    <td className="py-3 pr-4 font-semibold text-primary-700">
                      {item.quantity || item.predictedSurplus || 0} meals
                    </td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-md">
                        {item.foodType}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {item.status === 'Accepted' ? (
                        <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium inline-flex items-center gap-1">
                          <span>✅</span> Pickup Scheduled
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs rounded-full bg-amber-100 text-amber-700 font-medium inline-flex items-center gap-1">
                          <span>🔔</span> Awaiting NGO
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-xs">
                      <Link
                        to="/ngo-matching"
                        className="text-primary-600 hover:text-primary-800 font-medium underline"
                      >
                        Match NGO →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Surplus Modal */}
      {quickFormOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setQuickFormOpen(false)}
        >
          <div
            className="card w-full max-w-md p-6 bg-white shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-primary-900">Broadcast Surplus Food</h3>
                <p className="text-xs text-gray-500">Alert verified local NGOs immediately</p>
              </div>
              <button
                onClick={() => setQuickFormOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleQuickSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Event / Banquet Name</label>
                <input
                  type="text"
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  placeholder="e.g. Wedding Reception, Tech Summit Dinner"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Food Category</label>
                  <select
                    value={foodType}
                    onChange={e => setFoodType(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none"
                  >
                    <option>Cooked Meals</option>
                    <option>Dry Rations</option>
                    <option>Bakery</option>
                    <option>Fruits &amp; Veg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Available Meals / Qty</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    required
                    placeholder="e.g. 80"
                    min="1"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pickup Location & Venue</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  required
                  placeholder="e.g. Grand Banquet Hall, C-Scheme, Jaipur"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Packaging / Handling Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Packed in hot boxes, available till 11:30 PM"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickFormOpen(false)}
                  className="btn btn-outline text-sm py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary text-sm py-2 px-4 shadow"
                >
                  {submitting ? 'Broadcasting…' : 'Alert Nearby NGOs'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  )
}
