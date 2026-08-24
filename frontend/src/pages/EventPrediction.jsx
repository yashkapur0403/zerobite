import { useMemo, useState } from 'react'
import { toast } from '../components/Toast.jsx'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { useAuth } from '../context/AuthContext.jsx'
import { addDoc, collection, serverTimestamp, doc, setDoc, updateDoc, increment, getDocs, query, where } from 'firebase/firestore'
import { db, DEMO_MODE } from '../firebase'

export default function EventPrediction() {
  const [invited, setInvited] = useState(0)
  const [checkedIn, setCheckedIn] = useState(0)
  const [servingRate, setServingRate] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [predicted, setPredicted] = useState(null)
  const [location, setLocation] = useState('')
  const [foodType, setFoodType] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { user, profile } = useAuth()

  const surplus = useMemo(() => {
    const expectedToBeServed = servingRate * timeLeft
    const base = Math.max(0, invited - (checkedIn + expectedToBeServed))
    return predicted ?? base
  }, [invited, checkedIn, servingRate, timeLeft, predicted])

  const data = useMemo(() => ([
    { name: 'Guests Invited', value: invited },
    { name: 'Guests Checked In', value: checkedIn },
    { name: 'Predicted Surplus', value: Math.max(0, Math.round(surplus)) },
  ]), [invited, checkedIn, surplus])

  const onPredict = () => {
    const expectedToBeServed = servingRate * timeLeft
    setPredicted(Math.max(0, invited - (checkedIn + expectedToBeServed)))
  }

  const performNotify = async () => {
    const predictedSurplus = Math.max(0, Math.round(surplus))

    // ── DEMO MODE: no Firestore writes ──
    if (DEMO_MODE) {
      toast('NGOs near you have been notified successfully!')
      setConfirmOpen(false)
      return
    }

    // ── LIVE MODE ──
    try {
      const donorName = profile?.name || user?.email || 'Anonymous Donor'
      let existingId = null
      let previousPredicted = 0
      if (user?.uid) {
        const q = query(collection(db, 'surplus'), where('status', '==', 'Active'), where('donorId', '==', user.uid))
        const snap = await getDocs(q)
        const match = snap.docs.map(d => ({ id: d.id, ...d.data() })).find(d => d.location === location && d.foodType === foodType)
        existingId = match?.id || null
        previousPredicted = match?.predictedSurplus || 0
      } else {
        const q = query(collection(db, 'surplus'), where('status', '==', 'Active'), where('donor', '==', donorName))
        const snap = await getDocs(q)
        const match = snap.docs.map(d => ({ id: d.id, ...d.data() })).find(d => d.location === location && d.foodType === foodType)
        existingId = match?.id || null
        previousPredicted = match?.predictedSurplus || 0
      }

      if (existingId) {
        await updateDoc(doc(db, 'surplus', existingId), { quantity: predictedSurplus, predictedSurplus, updatedAt: serverTimestamp() })
      } else {
        await addDoc(collection(db, 'surplus'), {
          donor: donorName, donorId: user?.uid || null, location, foodType,
          quantity: predictedSurplus, predictedSurplus, status: 'Active', createdAt: serverTimestamp(),
        })
      }
      if (user?.uid) {
        const ref = doc(db, 'csr_stats', user.uid)
        const delta = existingId ? Math.max(0, predictedSurplus - previousPredicted) : predictedSurplus
        if (delta > 0) {
          await updateDoc(ref, { mealsDonated: increment(delta), co2Saved: increment(delta * 0.42) }).catch(async () => {
            await setDoc(ref, { mealsDonated: delta, co2Saved: delta * 0.42 }, { merge: true })
          })
        }
      }
      toast('NGOs near you have been notified successfully!')
    } catch (e) {
      toast('Failed to notify NGOs. Please try again.', 'error')
    } finally {
      setConfirmOpen(false)
    }
  }

  const onNotify = () => {
    const predictedSurplus = Math.max(0, Math.round(surplus))
    if (!location || !foodType) { toast('Please enter location and select food type', 'warning'); return }
    if (predictedSurplus <= 0) { toast('Predicted surplus is 0 — nothing to notify', 'info'); return }
    setConfirmOpen(true)
  }

  return (
    <section className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-primary-800">Event Prediction</h2>
        <p className="text-gray-600 text-sm mt-1">Enter event details and predict surplus before the event ends.</p>

        <div className="grid md:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Total Guests Invited</label>
            <input type="number" value={invited} placeholder="00" onChange={e=>setInvited(parseInt(e.target.value||0))} className="w-full rounded-xl border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Guests Checked In</label>
            <input type="number" value={checkedIn} placeholder="00" onChange={e=>setCheckedIn(parseInt(e.target.value||0))} className="w-full rounded-xl border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Serving Rate (meals/min)</label>
            <input type="number" value={servingRate} placeholder="00" onChange={e=>setServingRate(parseFloat(e.target.value||0))} className="w-full rounded-xl border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time Left (minutes)</label>
            <input type="number" value={timeLeft} placeholder="00" onChange={e=>setTimeLeft(parseInt(e.target.value||0))} className="w-full rounded-xl border border-gray-300 px-3 py-2" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Event Location</label>
            <input type="text" value={location} onChange={e=>setLocation(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="Area / Venue" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Food Type</label>
            <select value={foodType} onChange={e=>setFoodType(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2">
              <option value="" disabled>Select Food Type</option>
              <option>Cooked Meals</option>
              <option>Dry Rations</option>
              <option>Bakery</option>
              <option>Fruits &amp; Veg</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button className="btn btn-primary" onClick={onPredict}>Predict Surplus</button>
          <button className="btn btn-outline" onClick={onNotify}>Notify NGOs</button>
        </div>

        <div className="mt-5 card p-5 bg-primary-50 border border-primary-100">
          <p className="text-primary-800 font-medium">Predicted Surplus: <span className="text-2xl ml-2">{Math.max(0, Math.round(surplus))}</span> meals</p>
          {Math.round(surplus) === 0 ? (
            <p className="text-sm text-primary-700 mt-1">No surplus expected — food likely to be fully utilized ✅</p>
          ) : Math.round(surplus) > 50 ? (
            <p className="text-sm text-yellow-700 mt-1">High surplus risk ⚠️</p>
          ) : (
            <p className="text-sm text-primary-700 mt-1">Moderate surplus expected 🍛</p>
          )}
        </div>

        <div className="mt-6 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={() => setConfirmOpen(false)}>
          <div className="card w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-primary-800">Confirm Notification</h3>
            <p className="text-sm text-gray-700 mt-2">Do you want to notify nearby NGOs about {Math.max(0, Math.round(surplus))} surplus meals?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn btn-outline" onClick={() => setConfirmOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={performNotify}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
