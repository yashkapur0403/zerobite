import { useMemo, useState } from 'react'
import { toast } from '../components/Toast.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'

export default function SurplusAlerts() {
  const { profile } = useAuth()
  const { surplusItems, acceptedItems, acceptSurplusItem, rejectSurplusItem, resetDemoState } = useData()

  const [tab, setTab] = useState('active')
  const [foodFilter, setFoodFilter] = useState('All')

  const active = useMemo(() => {
    return surplusItems
      .filter(i => i.status === 'Active')
      .sort((a, b) => (b.predictedSurplus || b.quantity || 0) - (a.predictedSurplus || a.quantity || 0))
  }, [surplusItems])

  const foodTypes = useMemo(() => {
    return ['All', ...Array.from(new Set([...surplusItems, ...acceptedItems].map(i => i.foodType).filter(Boolean)))]
  }, [surplusItems, acceptedItems])

  const shown = useMemo(() => {
    const list = tab === 'active' ? active : acceptedItems
    return list.filter(i => foodFilter === 'All' ? true : i.foodType === foodFilter)
  }, [tab, active, acceptedItems, foodFilter])

  const handleAccept = async (surplusId) => {
    try {
      await acceptSurplusItem(surplusId, profile?.name || 'Your NGO')
      toast('Donation accepted and claimed for your NGO!', 'success')
    } catch (e) {
      toast('Failed to accept donation.', 'error')
    }
  }

  const handleReject = async (surplusId) => {
    try {
      await rejectSurplusItem(surplusId)
      toast('Surplus alert dismissed.', 'info')
    } catch (e) {
      toast('Failed to reject donation.', 'error')
    }
  }

  return (
    <section className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-primary-800">Live Surplus Alerts</h2>
            <p className="text-gray-600 text-sm mt-0.5">Real-time catering and banquet food available for immediate rescue.</p>
          </div>
          {profile?.type === 'Admin' && (
            <button onClick={resetDemoState} className="btn btn-outline text-xs h-9">
              ↺ Reset Demo Data
            </button>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
          <div className="inline-flex rounded-xl border border-primary-200 overflow-hidden p-0.5 bg-gray-50">
            <button
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                tab === 'active' ? 'bg-primary-600 text-white shadow-xs' : 'text-gray-700 hover:text-primary-800'
              }`}
              onClick={() => setTab('active')}
            >
              Active ({active.length})
            </button>
            <button
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                tab === 'accepted' ? 'bg-primary-600 text-white shadow-xs' : 'text-gray-700 hover:text-primary-800'
              }`}
              onClick={() => setTab('accepted')}
            >
              Accepted Pickups ({acceptedItems.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Filter by Type:</label>
            <select
              value={foodFilter}
              onChange={e => setFoodFilter(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs bg-white focus:outline-none"
            >
              {foodTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="mt-8 text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-3xl mb-2">🍽</p>
            <p className="text-sm font-semibold text-gray-700">No surplus donations match this filter</p>
            <p className="text-xs text-gray-400 mt-1">Check back soon as banquet donors report surplus.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {shown.map(a => (
              <div
                key={a.id}
                className="card p-4 border border-gray-200 hover:border-primary-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 text-sm">{a.donor}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-primary-100 text-primary-800">
                      {a.foodType}
                    </span>
                    {a.eventName && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {a.eventName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    📍 Location: <strong>{a.location}</strong> • Portions: <strong className="text-primary-800">{a.quantity || a.predictedSurplus} meals</strong>
                  </p>
                </div>

                {tab === 'active' ? (
                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      onClick={() => handleAccept(a.id)}
                      className="btn btn-primary text-xs py-2 px-4 shadow-xs"
                    >
                      Claim Pickup
                    </button>
                    <button
                      onClick={() => handleReject(a.id)}
                      className="btn btn-outline text-xs py-2 px-3 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    >
                      Dismiss
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-3 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                      Claimed by {a.acceptedBy || 'Partner NGO'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
