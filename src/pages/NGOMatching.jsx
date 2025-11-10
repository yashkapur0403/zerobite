import { useEffect, useMemo, useState } from 'react'
import { toast } from '../components/Toast.jsx'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export default function NGOMatching() {
  const [ngos, setNgos] = useState([])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'ngos'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setNgos(list)
    })
    return () => unsub()
  }, [])

  const rows = useMemo(() => {
    return ngos
      .map(n => ({
        ...n,
        priority: n.distanceKm > 0 ? n.capacity / n.distanceKm : n.capacity,
      }))
      .sort((a, b) => b.priority - a.priority)
  }, [ngos])

  const onSelect = () => {
    toast('NGO notified successfully')
  }

  return (
    <section className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-primary-800">NGO Matching</h2>
        <p className="text-gray-600 text-sm mt-1">Sorted by highest priority (capacity ÷ distance).</p>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-4">NGO Name</th>
                <th className="py-2 pr-4">Location</th>
                <th className="py-2 pr-4">Distance (km)</th>
                <th className="py-2 pr-4">Capacity</th>
                <th className="py-2 pr-4">Food Type</th>
                <th className="py-2 pr-4">Priority Score</th>
                <th className="py-2 pr-0">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(n => (
                <tr key={n.id} className="border-t">
                  <td className="py-3 pr-4 font-medium text-primary-800">{n.name}</td>
                  <td className="py-3 pr-4">{n.location}</td>
                  <td className="py-3 pr-4">{n.distanceKm}</td>
                  <td className="py-3 pr-4">{n.capacity}</td>
                  <td className="py-3 pr-4">{n.foodType}</td>
                  <td className="py-3 pr-4">{(n.priority).toFixed(1)}</td>
                  <td className="py-3 pr-0">
                    <button onClick={onSelect} className="btn btn-primary h-9">Select NGO</button>
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
