import { useEffect, useMemo, useState } from 'react'
import { toast } from '../components/Toast.jsx'
import { collection, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, getDocs, deleteDoc, setDoc } from 'firebase/firestore'
import { db, DEMO_MODE } from '../firebase'
import { useAuth } from '../context/AuthContext.jsx'
import seedSurplus from '../data/surplus.json'
import seedNgos from '../data/ngos.json'

const makeSeedItems = () => seedSurplus.map((s, i) => ({ ...s, id: `local-${i}` }))

export default function SurplusAlerts() {
  const [items, setItems] = useState(DEMO_MODE ? makeSeedItems() : [])
  const [accepted, setAccepted] = useState([])
  const [tab, setTab] = useState('active')
  const [foodFilter, setFoodFilter] = useState('All')
  const { profile } = useAuth()

  useEffect(() => {
    if (DEMO_MODE) return // seed already set in useState

    const unsubSurplus = onSnapshot(collection(db, 'surplus'), (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    const unsubAccepted = onSnapshot(collection(db, 'accepted'), (snap) => {
      setAccepted(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => { unsubSurplus(); unsubAccepted() }
  }, [])

  const active = useMemo(() => items.filter(i => i.status === 'Active').sort((a,b) => (b.predictedSurplus || 0) - (a.predictedSurplus || 0)), [items])
  const foodTypes = useMemo(() => ['All', ...Array.from(new Set([...items, ...accepted].map(i => i.foodType)))], [items, accepted])
  const shown = useMemo(() => {
    const list = tab === 'active' ? active : accepted
    return list.filter(i => foodFilter === 'All' ? true : i.foodType === foodFilter)
  }, [tab, active, accepted, foodFilter])

  const accept = async (surplusId) => {
    const item = items.find(x => x.id === surplusId)
    if (!item || item.status === 'Accepted') return

    if (DEMO_MODE) {
      setItems(prev => prev.map(x => x.id === surplusId ? { ...x, status: 'Accepted' } : x))
      setAccepted(prev => [...prev, {
        id: `accepted-${surplusId}`, surplusId,
        donor: item.donor, location: item.location, foodType: item.foodType,
        quantity: item.quantity ?? item.predictedSurplus ?? 0,
        predictedSurplus: item.predictedSurplus ?? item.quantity ?? 0,
        createdAt: new Date().toISOString(), acceptedAt: new Date().toISOString(),
      }])
      toast('Donation accepted')
      return
    }

    try {
      await updateDoc(doc(db, 'surplus', surplusId), { status: 'Accepted' })
      await addDoc(collection(db, 'accepted'), {
        surplusId, donor: item.donor, location: item.location, foodType: item.foodType,
        quantity: item.quantity ?? item.predictedSurplus ?? 0,
        predictedSurplus: item.predictedSurplus ?? item.quantity ?? 0,
        createdAt: item.createdAt || serverTimestamp(), acceptedAt: serverTimestamp(),
      })
      toast('Donation accepted')
    } catch (e) {
      toast('Failed to accept donation. Please try again.', 'error')
    }
  }

  const rejectItem = async (surplusId) => {
    const item = items.find(x => x.id === surplusId)
    if (!item || item.status !== 'Active') return

    if (DEMO_MODE) {
      setItems(prev => prev.map(x => x.id === surplusId ? { ...x, status: 'Rejected' } : x))
      toast('Donation rejected')
      return
    }

    try {
      await updateDoc(doc(db, 'surplus', surplusId), { status: 'Rejected', rejectedAt: serverTimestamp() })
      toast('Donation rejected')
    } catch (e) {
      toast('Failed to reject donation. Please try again.', 'error')
    }
  }

  const resetToDemo = async () => {
    if (!profile || profile.type !== 'Admin') { toast('Admin only action', 'error'); return }
    const ok = window.confirm('Reset to demo state? This will:\n- Clear all surplus donations\n- Clear all accepted donations\n- Clear CSR stats\n- Clear NGO data\n- Reseed with fresh active sample data\n\nContinue?')
    if (!ok) return

    if (DEMO_MODE) {
      setItems(makeSeedItems())
      setAccepted([])
      toast('✅ Demo state restored! All donations are now Active.')
      return
    }

    try {
      const sSnap = await getDocs(collection(db, 'surplus'))
      await Promise.all(sSnap.docs.map(d => deleteDoc(doc(db, 'surplus', d.id))))
      const aSnap = await getDocs(collection(db, 'accepted'))
      await Promise.all(aSnap.docs.map(d => deleteDoc(doc(db, 'accepted', d.id))))
      const cSnap = await getDocs(collection(db, 'csr_stats'))
      await Promise.all(cSnap.docs.map(d => deleteDoc(doc(db, 'csr_stats', d.id))))
      const nSnap = await getDocs(collection(db, 'ngos'))
      await Promise.all(nSnap.docs.map(d => deleteDoc(doc(db, 'ngos', d.id))))
      await Promise.all((seedSurplus || []).map(s => addDoc(collection(db, 'surplus'), {
        donor: s.donor, location: s.location, foodType: s.foodType,
        quantity: s.quantity, predictedSurplus: s.predictedSurplus,
        status: 'Active', createdAt: serverTimestamp(),
      })))
      console.log('Seeding NGOs:', seedNgos?.length, 'items')
      await Promise.all((seedNgos || []).map(n => addDoc(collection(db, 'ngos'), {
        name: n.name, location: n.location, distanceKm: n.distanceKm,
        capacity: n.capacity, foodType: n.foodType, createdAt: serverTimestamp(),
      })))
      console.log('NGOs seeded successfully')
      await setDoc(doc(db, 'csr_stats', 'default'), { mealsDonated: 0, co2Saved: 0, donations: 0, createdAt: serverTimestamp() })
      toast('✅ Demo state restored! All donations are now Active.')
    } catch (e) {
      toast('Failed to reset demo state. Please try again.', 'error')
      console.error(e)
    }
  }

  return (
    <section className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-primary-800">Surplus Alerts</h2>
        <p className="text-gray-600 text-sm mt-1">Available surplus donations near you.</p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl border border-primary-200 overflow-hidden">
            <button className={`px-3 py-2 text-sm ${tab==='active' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`} onClick={()=>setTab('active')}>Active</button>
            <button className={`px-3 py-2 text-sm ${tab==='accepted' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`} onClick={()=>setTab('accepted')}>Accepted</button>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div>
              <label className="text-xs text-gray-500 mr-2">Food Type</label>
              <select value={foodFilter} onChange={e=>setFoodFilter(e.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm">
                {foodTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {profile?.type === 'Admin' && (
              <button onClick={resetToDemo} className="btn btn-outline h-10">Reset to Demo State</button>
            )}
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="mt-6 text-sm text-gray-600">No items to show.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {shown.map(a => (
              <div key={a.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-primary-800">{a.donor} • {a.location}</p>
                  <p className="text-xs text-gray-500">{a.foodType} • Qty: {a.quantity} • Predicted Surplus: {a.predictedSurplus}</p>
                </div>
                {tab === 'active' ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => accept(a.id)} className="btn btn-primary">Accept</button>
                    <button onClick={() => rejectItem(a.id)} className="btn btn-outline">Reject</button>
                  </div>
                ) : (
                  <span className="text-xs text-primary-700">Accepted</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
