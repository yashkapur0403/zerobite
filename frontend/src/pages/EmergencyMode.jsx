import { useData } from '../context/DataContext.jsx'
import { toast } from '../components/Toast.jsx'
import { Link } from 'react-router-dom'

export default function EmergencyMode() {
  const { emergencyActive, toggleEmergency } = useData()

  const handleToggle = () => {
    toggleEmergency()
    if (!emergencyActive) {
      toast('🚨 Emergency broadcast activated! All partner NGOs alerted.', 'warning')
    } else {
      toast('Emergency broadcast deactivated. Standard operations resumed.', 'info')
    }
  }

  return (
    <section className="space-y-6 max-w-4xl mx-auto">
      <div className={`card p-6 border transition-all ${
        emergencyActive
          ? 'bg-red-50/80 border-red-300 shadow-md shadow-red-100'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                emergencyActive ? 'bg-red-200 text-red-900' : 'bg-gray-100 text-gray-700'
              }`}>
                Rapid Response Protocol
              </span>
              <span className="text-xs text-gray-500">• Priority Food Waste Salvage</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mt-2 flex items-center gap-2">
              <span>Emergency Surplus Mode</span>
              {emergencyActive && <span className="animate-pulse">🚨</span>}
            </h2>
            <p className="text-gray-600 text-sm mt-1 max-w-xl">
              Initiates rapid dispatch protocols across all registered regional NGOs when high-volume perishables must be collected within a narrow time window.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleToggle}
              aria-pressed={emergencyActive}
              className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors focus:outline-none shadow-md ${
                emergencyActive ? 'bg-red-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-9 w-9 transform rounded-full bg-white shadow transition-transform ${
                  emergencyActive ? 'translate-x-13' : 'translate-x-2'
                }`}
              />
            </button>
            <span className={`text-xs font-bold uppercase tracking-wide ${
              emergencyActive ? 'text-red-700' : 'text-gray-500'
            }`}>
              {emergencyActive ? 'BROADCAST ACTIVE' : 'SYSTEM STANDBY'}
            </span>
          </div>
        </div>

        {emergencyActive ? (
          <div className="mt-6 p-4 rounded-xl bg-red-100/70 border border-red-300 space-y-2 text-xs text-red-900 animate-fade">
            <p className="font-bold text-sm flex items-center gap-1.5">
              <span>⚠️</span> High-Priority Distress Signals Dispatched
            </p>
            <p>
              Automated push alerts have been issued to the nearest 10 NGO fleets. Pickups designated as emergency will appear with high priority tags on all partner terminals.
            </p>
            <div className="pt-2 flex gap-3">
              <Link to="/surplus-alerts" className="btn btn-primary text-xs py-1.5 px-3 bg-red-700 hover:bg-red-800">
                View Emergency Feed →
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600">
            <p className="font-semibold text-gray-800 mb-1">When to trigger Emergency Mode?</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Sudden banquet/event cancellations with over 100+ perishable cooked meals.</li>
              <li>Cold-chain power interruptions requiring meals to be distributed under 90 minutes.</li>
              <li>Natural disaster relief or urgent localized hunger relief requests.</li>
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
