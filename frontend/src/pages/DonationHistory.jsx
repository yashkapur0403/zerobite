import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'

export default function DonationHistory() {
  const { profile } = useAuth()
  const { acceptedItems } = useData()
  const [filterView, setFilterView] = useState('All')

  const userRole = profile?.type || 'Donor'
  const userName = profile?.name || ''

  const rows = useMemo(() => {
    const toDate = (it) => {
      if (it.acceptedAt?.toDate) return it.acceptedAt.toDate()
      if (it.createdAt?.toDate) return it.createdAt.toDate()
      if (it.acceptedAt) return new Date(it.acceptedAt)
      if (it.createdAt) return new Date(it.createdAt)
      return new Date()
    }

    return [...acceptedItems]
      .filter(it => {
        if (filterView === 'Mine') {
          if (userRole === 'Donor') {
            return it.donor?.toLowerCase().includes(userName.toLowerCase().split(' ')[0])
          }
          if (userRole === 'NGO') {
            return it.acceptedBy?.toLowerCase().includes(userName.toLowerCase().split(' ')[0])
          }
        }
        return true
      })
      .sort((a, b) => toDate(b) - toDate(a))
      .map(it => ({
        id: it.id,
        date: toDate(it).toLocaleDateString() + ' ' + toDate(it).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: it.location,
        meals: it.quantity ?? it.predictedSurplus ?? 0,
        donor: it.donor,
        foodType: it.foodType,
        acceptedBy: it.acceptedBy || 'FoodAid Trust',
      }))
  }, [acceptedItems, filterView, userRole, userName])

  return (
    <section className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-primary-800">Donation History &amp; Audit Log</h2>
            <p className="text-gray-600 text-sm mt-0.5">Verified food rescue transactions and beneficiary delivery records.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterView('All')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                filterView === 'All'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Rescues
            </button>
            <button
              onClick={() => setFilterView('Mine')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                filterView === 'Mine'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              My Records ({userRole})
            </button>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="mt-8 text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-3xl mb-2">📜</p>
            <p className="text-sm font-semibold text-gray-700">No completed donations in this view</p>
            <p className="text-xs text-gray-400 mt-1">Claimed pickups will automatically be cataloged here.</p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200 font-semibold bg-gray-50/60">
                  <th className="py-2.5 px-3">Rescue Timestamp</th>
                  <th className="py-2.5 px-3">Donor / Event Source</th>
                  <th className="py-2.5 px-3">Pickup Location</th>
                  <th className="py-2.5 px-3">Food Type</th>
                  <th className="py-2.5 px-3">Meals Salvaged</th>
                  <th className="py-2.5 px-3">NGO Custodian</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 text-gray-500 font-medium">{r.date}</td>
                    <td className="py-3 px-3 font-bold text-gray-800">{r.donor}</td>
                    <td className="py-3 px-3 text-gray-600">{r.location}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px]">
                        {r.foodType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-primary-800">{r.meals}</td>
                    <td className="py-3 px-3 text-emerald-700 font-medium">{r.acceptedBy}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        Verified ✓
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
