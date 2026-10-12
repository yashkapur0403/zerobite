import { useMemo, useState } from 'react'
import { toast } from '../components/Toast.jsx'
import { useData } from '../context/DataContext.jsx'
import { Link } from 'react-router-dom'

export default function NGOMatching() {
  const { ngos } = useData()
  const [filterType, setFilterType] = useState('All')
  const [selectedNgo, setSelectedNgo] = useState(null)

  const rows = useMemo(() => {
    return ngos
      .filter(n => filterType === 'All' || n.foodType === filterType)
      .map(n => ({
        ...n,
        priority: n.distanceKm > 0 ? (n.capacity / n.distanceKm) : n.capacity,
      }))
      .sort((a, b) => b.priority - a.priority)
  }, [ngos, filterType])

  const foodTypes = ['All', 'Cooked Meals', 'Dry Rations', 'Bakery', 'Fruits & Veg']

  const handleSelect = (ngo) => {
    setSelectedNgo(ngo)
    toast(`Match confirmed! Notification sent to ${ngo.name} (Priority Score: ${ngo.priority.toFixed(1)})`, 'success')
  }

  return (
    <section className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-primary-800">Priority-Based NGO Matching</h2>
            <p className="text-gray-600 text-sm mt-0.5">
              Optimized allocation matrix based on <strong>Capacity ÷ Proximity</strong> and dietary specialization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Filter Food Specialty:</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs bg-white focus:outline-none"
            >
              {foodTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {selectedNgo && (
          <div className="mt-4 p-4 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-between">
            <div className="text-xs text-primary-900">
              <span className="font-bold">Active Match: </span>
              {selectedNgo.name} ({selectedNgo.location}) • Capacity: {selectedNgo.capacity} meals • Priority Score: {selectedNgo.priority.toFixed(1)}
            </div>
            <Link to="/surplus-alerts" className="text-xs font-semibold text-primary-700 underline">
              View Surplus Feed →
            </Link>
          </div>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 font-semibold">
                <th className="py-2.5 pr-4">Rank</th>
                <th className="py-2.5 pr-4">NGO Organization</th>
                <th className="py-2.5 pr-4">District / Area</th>
                <th className="py-2.5 pr-4">Distance</th>
                <th className="py-2.5 pr-4">Meal Capacity</th>
                <th className="py-2.5 pr-4">Preferred Food</th>
                <th className="py-2.5 pr-4">Priority Score</th>
                <th className="py-2.5 pr-0 text-right">Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((n, index) => (
                <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 font-bold text-gray-400">
                    #{index + 1}
                  </td>
                  <td className="py-3 pr-4 font-bold text-primary-800">
                    {n.name}
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{n.location}</td>
                  <td className="py-3 pr-4 text-gray-700 font-medium">{n.distanceKm} km</td>
                  <td className="py-3 pr-4 font-semibold text-emerald-700">{n.capacity} meals</td>
                  <td className="py-3 pr-4">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px]">
                      {n.foodType}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-bold text-purple-700">
                    {(n.priority).toFixed(1)}
                  </td>
                  <td className="py-3 pr-0 text-right">
                    <button
                      onClick={() => handleSelect(n)}
                      className="btn btn-primary text-xs py-1.5 px-3.5 shadow-xs"
                    >
                      Assign NGO
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
