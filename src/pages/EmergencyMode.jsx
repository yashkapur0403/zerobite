import { useState } from 'react'

export default function EmergencyMode() {
  const [active, setActive] = useState(false)

  const toggle = () => {
    setActive(prev => {
      const next = !prev
      if (next) {
        window.alert('All nearby NGOs have been alerted for urgent collection.')
      } else {
        window.alert('Emergency mode deactivated.')
      }
      return next
    })
  }

  return (
    <section className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-primary-800">Emergency Mode</h2>
        <p className="text-gray-600 text-sm mt-1">Activate an urgent donation drive and alert nearby NGOs.</p>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Activate Emergency Donation Drive</span>
          </div>
          <button
            onClick={toggle}
            aria-pressed={active}
            className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors focus:outline-none shadow-soft ${active ? 'bg-red-600' : 'bg-gray-300'}`}
          >
            <span
              className={`inline-block h-9 w-9 transform rounded-full bg-white shadow transition-transform ${active ? 'translate-x-12' : 'translate-x-3'}`}
            />
          </button>
          <span className={`text-sm ${active ? 'text-red-700 font-medium' : 'text-gray-500'}`}>{active ? 'Emergency Active' : 'Inactive'}</span>
        </div>
      </div>
    </section>
  )
}
