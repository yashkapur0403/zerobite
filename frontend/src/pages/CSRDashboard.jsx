import { useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useAuth } from '../context/AuthContext.jsx'
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { db, DEMO_MODE } from '../firebase'

const DEMO_STATS = { mealsDonated: 320, co2Saved: 134.4, monthlyGoalMeals: 500, monthlyGoalEnabled: true, donorName: 'Demo User' }

export default function CSRDashboard() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState(DEMO_MODE ? DEMO_STATS : { mealsDonated: 0, co2Saved: 0, monthlyGoalMeals: 500, monthlyGoalEnabled: true, donorName: 'You' })
  const [goalInput, setGoalInput] = useState(500)

  useEffect(() => {
    if (DEMO_MODE || !user) return

    const donorName = profile?.name || user.email || 'You'
    const ref = doc(db, 'csr_stats', user.uid)
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.exists() ? snap.data() : { mealsDonated: 0, co2Saved: 0, monthlyGoalMeals: 500, monthlyGoalEnabled: true }
      setStats({ ...data, donorName })
      setGoalInput(data.monthlyGoalMeals ?? 500)
    })
    return () => unsub()
  }, [user?.uid, profile?.name])

  const totals = useMemo(() => ({
    meals: stats.mealsDonated || 0,
    co2: stats.co2Saved || 0,
  }), [stats])

  const progress = useMemo(() => {
    const goal = stats.monthlyGoalEnabled === false ? 0 : (stats.monthlyGoalMeals || 500)
    const done = Math.min(totals.meals, goal)
    const pct = goal > 0 ? Math.min(100, Math.round((done / goal) * 100)) : 0
    return { done, goal, pct }
  }, [stats, totals.meals])

  const chartData = useMemo(() => ([
    { name: 'Donated', value: Math.round(totals.meals) },
    { name: 'Goal', value: Math.round(stats.monthlyGoalEnabled === false ? 0 : (stats.monthlyGoalMeals || 500)) },
  ]), [totals.meals, stats.monthlyGoalMeals, stats.monthlyGoalEnabled])

  const badgeLevels = [
    { name: 'Bronze', threshold: 100 },
    { name: 'Silver', threshold: 300 },
    { name: 'Gold', threshold: 600 },
  ]

  const saveGoalEnabled = (enabled) => {
    setStats(prev => ({ ...prev, monthlyGoalEnabled: enabled }))
    if (!DEMO_MODE && user) {
      const ref = doc(db, 'csr_stats', user.uid)
      updateDoc(ref, { monthlyGoalEnabled: enabled }).catch(async () => {
        await setDoc(ref, { monthlyGoalEnabled: enabled }, { merge: true })
      })
    }
  }

  const saveGoalMeals = () => {
    setStats(prev => ({ ...prev, monthlyGoalMeals: Math.max(0, goalInput) }))
    if (!DEMO_MODE && user) {
      const ref = doc(db, 'csr_stats', user.uid)
      updateDoc(ref, { monthlyGoalMeals: Math.max(0, goalInput) }).catch(async () => {
        await setDoc(ref, { monthlyGoalMeals: Math.max(0, goalInput) }, { merge: true })
      })
    }
  }

  return (
    <section className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-primary-800">CSR Dashboard</h2>
        <p className="text-gray-600 text-sm mt-1">Your monthly donor impact at a glance.</p>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="card p-4">
            <p className="text-xs text-gray-500">Total Meals Donated (This Month)</p>
            <p className="text-2xl font-semibold text-primary-800">{totals.meals}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">CO₂ Saved (kg)</p>
            <p className="text-2xl font-semibold text-primary-800">{totals.co2.toFixed(1)}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">Badges Earned</p>
            <div className="flex items-center gap-2 mt-1">
              {badgeLevels.map(b => (
                <span key={b.name} className={`px-2 py-1 rounded-lg text-xs ${totals.meals >= b.threshold ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-500'}`}>{b.name}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={stats.monthlyGoalEnabled !== false} onChange={(e) => saveGoalEnabled(e.target.checked)} />
              Enable monthly goal
            </label>
            {stats.monthlyGoalEnabled !== false && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Goal</span>
                <input type="number" className="w-28 rounded-xl border border-gray-300 px-3 py-1 text-sm" value={goalInput} onChange={(e)=>setGoalInput(parseInt(e.target.value||0))} />
                <button className="btn btn-outline h-8 px-3 text-sm" onClick={saveGoalMeals}>Save</button>
              </div>
            )}
          </div>

          {stats.monthlyGoalEnabled !== false ? (
            <>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Monthly Goal Progress</span>
                <span>{progress.done}/{progress.goal} meals • {progress.pct}%</span>
              </div>
              <div className="mt-1 h-3 w-full rounded-full bg-primary-100 overflow-hidden">
                <div className="h-full bg-primary-600" style={{ width: `${progress.pct}%` }} />
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-600">Goal tracking is disabled. Enable it to see progress.</p>
          )}
        </div>

        <div className="mt-6 h-64 w-full card p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-4 text-sm text-primary-800">Your actions make a difference — keep donating with ZeroBite!</p>
      </div>
    </section>
  )
}
