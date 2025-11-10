import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export default function DonationHistory() {
  const [accepted, setAccepted] = useState([])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'accepted'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setAccepted(list)
    })
    return () => unsub()
  }, [])

  const rows = useMemo(() => {
    const toDate = (it) => {
      if (it.acceptedAt?.toDate) return it.acceptedAt.toDate()
      if (it.createdAt?.toDate) return it.createdAt.toDate()
      if (it.createdAt) return new Date(it.createdAt)
      return new Date()
    }
    return [...accepted]
      .sort((a,b) => toDate(b) - toDate(a))
      .map(it => ({
        id: it.id,
        date: it.acceptedAt?.toDate ? it.acceptedAt.toDate().toLocaleString() : (it.createdAt?.toDate ? it.createdAt.toDate().toLocaleString() : (it.createdAt ? new Date(it.createdAt).toLocaleString() : '—')),
        location: it.location,
        meals: it.quantity ?? it.predictedSurplus ?? 0,
        donor: it.donor,
        foodType: it.foodType,
      }))
  }, [accepted])

  return (
    <section className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-primary-800">Donation History</h2>
        <p className="text-gray-600 text-sm mt-1">Completed pickups you accepted.</p>

        {rows.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">No donations yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Donor</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">Food Type</th>
                  <th className="py-2 pr-4">Meals</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2 pr-4">{r.date}</td>
                    <td className="py-2 pr-4">{r.donor}</td>
                    <td className="py-2 pr-4">{r.location}</td>
                    <td className="py-2 pr-4">{r.foodType}</td>
                    <td className="py-2 pr-4">{r.meals}</td>
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
