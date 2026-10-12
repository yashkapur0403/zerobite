import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Home() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const type = useMemo(() => profile?.type, [profile?.type])
  const isGuest = !type
  return (
    <section className="space-y-8">
      <div className={`card ${isGuest ? 'bg-gradient-to-r from-primary-50 to-white border border-primary-100' : ''} ${isGuest ? 'p-7 md:p-8' : 'p-6'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <h1 className={`font-semibold text-primary-800 ${isGuest ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'}`}>{isGuest ? 'Welcome to ZeroBite' : 'ZeroBite: Smart Food Waste Management'}</h1>
          </div>
          {isGuest && <span className="ml-3 text-xs px-2 py-1 rounded-lg bg-primary-100 text-primary-800">Guest Mode</span>}
        </div>
        <p className="mt-3 text-gray-700 max-w-3xl">
          {isGuest
            ? 'Join our mission to reduce food waste. Log in to predict surplus, connect with NGOs, and track your impact.'
            : 'ZeroBite helps prevent food waste by predicting surplus before events end, prioritizing fair redistribution to NGOs, and rewarding donors for their impact.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {(type === 'Donor') && (
            <>
              <a href="/event-prediction" className="btn btn-primary">Try Event Prediction</a>
              <a href="/ngo-matching" className="btn btn-outline">Find NGOs</a>
            </>
          )}
          {type === 'NGO' && (
            <>
              <a href="/surplus-alerts" className="btn btn-primary">View Surplus Alerts</a>
              <a href="/donation-history" className="btn btn-outline">Donation History</a>
            </>
          )}
          {type === 'Admin' && (
            <>
              <a href="/admin" className="btn btn-primary">Admin Dashboard</a>
              <a href="/surplus-alerts" className="btn btn-outline">Surplus Alerts</a>
            </>
          )}
          {!type && (
            <>
              <button className="btn btn-primary" onClick={() => navigate('/login')}>Login to Get Started</button>
              <a href="#learn-more" className="btn btn-outline">Learn More About ZeroBite</a>
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className={`card p-5 relative ${isGuest ? 'opacity-70' : ''}`}>
          {isGuest && <span className="absolute top-2 right-2 text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg">🔒 Locked</span>}
          <h3 className="font-semibold text-primary-700">Predict Surplus</h3>
          <p className="text-gray-600 mt-1 text-sm">Estimate surplus before events end so logistics can be planned early.</p>
        </div>
        <div className={`card p-5 relative ${isGuest ? 'opacity-70' : ''}`}>
          {isGuest && <span className="absolute top-2 right-2 text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg">🔒 Locked</span>}
          <h3 className="font-semibold text-primary-700">Match with NGOs</h3>
          <p className="text-gray-600 mt-1 text-sm">Smartly route food to nearby NGOs based on capacity and need.</p>
        </div>
        <div className={`card p-5 relative ${isGuest ? 'opacity-70' : ''}`}>
          {isGuest && <span className="absolute top-2 right-2 text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg">🔒 Locked</span>}
          <h3 className="font-semibold text-primary-700">Reward Impact</h3>
          <p className="text-gray-600 mt-1 text-sm">Track donation impact for CSR and provide badges to donors.</p>
        </div>
      </div>

      <div id="learn-more" className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-primary-800">How it works</h3>
          <ol className="mt-3 space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>Predict surplus during the event.</li>
            <li>Automatically rank NGOs by distance and capacity.</li>
            <li>Notify NGOs and schedule pickup.</li>
            <li>Track donor impact in the CSR dashboard.</li>
          </ol>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-primary-800">Why ZeroBite</h3>
          <p className="mt-3 text-sm text-gray-700">Reduce waste, feed more people, and get credit for your impact. ZeroBite makes redistribution simple and fast with smart predictions and priority matching.</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="card p-3">
              <p className="text-xs text-gray-500">Avg. Surplus Saved</p>
              <p className="text-lg font-semibold text-primary-800">65 meals</p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-gray-500">Avg. Response</p>
              <p className="text-lg font-semibold text-primary-800">18 min</p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-gray-500">NGOs Nearby</p>
              <p className="text-lg font-semibold text-primary-800">12+</p>
            </div>
          </div>
        </div>
      </div>

      {!type && (
        <div className="card p-6">
          <h3 className="font-semibold text-primary-800">Join the Mission</h3>
          <p className="text-sm text-gray-700 mt-2">Get started in 3 steps:</p>
          <ul className="mt-3 grid md:grid-cols-3 gap-3 text-sm">
            <li className="card p-4">🍽 Predict food surplus at events.</li>
            <li className="card p-4">🤝 Connect with NGOs in real-time.</li>
            <li className="card p-4">🌍 Track your impact and reduce waste.</li>
          </ul>
          <div className="mt-4 grid md:grid-cols-3 gap-3 text-center">
            <div className="card p-3"><p className="text-xs text-gray-500">Meals Saved</p><p className="text-lg font-semibold text-primary-800">1,200+</p></div>
            <div className="card p-3"><p className="text-xs text-gray-500">NGOs Connected</p><p className="text-lg font-semibold text-primary-800">25</p></div>
            <div className="card p-3"><p className="text-xs text-gray-500">CO₂ Prevented</p><p className="text-lg font-semibold text-primary-800">540 kg</p></div>
          </div>
        </div>
      )}
    </section>
  )
}
