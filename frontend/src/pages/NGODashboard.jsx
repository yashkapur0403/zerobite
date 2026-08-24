import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { collection, onSnapshot } from 'firebase/firestore'
import { db, DEMO_MODE } from '../firebase'
import seedSurplus from '../data/surplus.json'

const MOCK_ACCEPTED = seedSurplus.slice(0, 8).map((s, i) => ({
  id: `mock-accepted-${i}`, donor: s.donor, location: s.location,
  foodType: s.foodType, quantity: s.quantity, predictedSurplus: s.predictedSurplus,
  createdAt: new Date(Date.now() - i * 3600000).toISOString(),
  acceptedAt: new Date(Date.now() - i * 3600000 + 600000).toISOString(),
}))

export default function NGODashboard() {
  const { user, profile } = useAuth()
  const [accepted, setAccepted] = useState(DEMO_MODE ? MOCK_ACCEPTED : [])

  useEffect(() => {
    if (DEMO_MODE) return

    const unsub = onSnapshot(collection(db, 'accepted'), (snap) => {
      setAccepted(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [])

  const stats = useMemo(() => {
    const totalPickups = accepted.length
    const totalMeals = accepted.reduce((s, x) => s + (Number(x.quantity ?? x.predictedSurplus ?? 0) || 0), 0)
    const byFood = accepted.reduce((m, x) => {
      const k = x.foodType || 'Other'; m[k] = (m[k] || 0) + (Number(x.quantity ?? x.predictedSurplus ?? 0) || 0); return m
    }, {})
    const topFood = Object.entries(byFood).sort((a,b)=>b[1]-a[1]).slice(0,3)
    const toDate = (it) => {
      if (it.acceptedAt?.toDate) return it.acceptedAt.toDate()
      if (it.createdAt?.toDate) return it.createdAt.toDate()
      if (it.createdAt) return new Date(it.createdAt)
      return new Date()
    }
    const recent = [...accepted].sort((a,b)=>toDate(b) - toDate(a)).slice(0,5)
    return { totalPickups, totalMeals, topFood, recent }
  }, [accepted])

  return (
    <section className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-primary-800">NGO Dashboard{profile?.name ? ` • ${profile.name}` : ''}</h2>
        <p className="text-gray-600 text-sm mt-1">Overview of your accepted pickups and meals delivered.</p>

        <div className="mt-4 grid sm:grid-cols-3 gap-4">
          <div className="card p-4">
            <p className="text-xs text-gray-500">Total Pickups</p>
            <p className="text-2xl font-semibold text-primary-800">{stats.totalPickups}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">Meals Delivered</p>
            <p className="text-2xl font-semibold text-primary-800">{stats.totalMeals}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">Top Food Types</p>
            <div className="mt-1 space-y-1 text-sm">
              {stats.topFood.length === 0 ? <p className="text-gray-600">—</p> : stats.topFood.map(([k,v]) => (
                <div key={k} className="flex justify-between"><span className="text-gray-700">{k}</span><span className="text-primary-800 font-medium">{v}</span></div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-primary-800">Recent Accepted</h3>
          {stats.recent.length === 0 ? (
            <p className="text-sm text-gray-600 mt-2">No accepted pickups yet.</p>
          ) : (
            <div className="mt-2 grid gap-3">
              {stats.recent.map(r => (
                <div key={r.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-primary-800">{r.donor} • {r.location}</p>
                    <p className="text-xs text-gray-500">{r.foodType} • Meals: {r.quantity ?? r.predictedSurplus ?? 0}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {r.acceptedAt?.toDate ? r.acceptedAt.toDate().toLocaleString() : (r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : (r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
