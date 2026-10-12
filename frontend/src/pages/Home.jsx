import { useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'

export default function Home() {
  const { user, profile } = useAuth()
  const { surplusItems, acceptedItems, ngos, emergencyActive } = useData()
  const navigate = useNavigate()

  const type = profile?.type || null
  const isGuest = !type

  // Live dynamic telemetry
  const totalMeals = useMemo(() => {
    return surplusItems.reduce(
      (acc, it) => acc + Number(it.quantity || it.predictedSurplus || 0),
      0
    )
  }, [surplusItems])

  const activeAlertsCount = useMemo(() => {
    return surplusItems.filter((i) => i.status === 'Active').length
  }, [surplusItems])

  const totalAcceptedCount = acceptedItems.length
  const co2Prevented = Math.round(totalMeals * 0.42)

  return (
    <section className="space-y-8 animate-fade">
      {/* ── EMERGENCY BANNER (If Active) ── */}
      {emergencyActive && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-900 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">🚨</span>
            <div>
              <p className="text-sm font-bold">RAPID SURPLUS RESPONSE ACTIVE</p>
              <p className="text-xs text-red-700">
                High-priority food broadcast is engaged across regional NGO networks.
              </p>
            </div>
          </div>
          {type === 'NGO' && (
            <Link to="/surplus-alerts" className="btn btn-primary text-xs bg-red-700 hover:bg-red-800 py-1.5 px-3">
              View Emergency Feed →
            </Link>
          )}
          {type === 'Admin' && (
            <Link to="/admin" className="btn btn-outline text-xs border-red-300 text-red-800 hover:bg-red-100 py-1.5 px-3">
              Manage in Admin Console →
            </Link>
          )}
        </div>
      )}

      {/* ── ROLE-TAILORED HERO BANNER ── */}
      <div
        className={`card p-6 md:p-8 border ${
          isGuest
            ? 'bg-gradient-to-br from-primary-50 via-white to-emerald-50 border-primary-100'
            : type === 'Donor'
            ? 'bg-gradient-to-br from-emerald-50/60 via-white to-blue-50/40 border-emerald-100'
            : type === 'NGO'
            ? 'bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/40 border-blue-100'
            : 'bg-gradient-to-br from-purple-50/60 via-white to-slate-50 border-purple-100'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isGuest
                    ? 'bg-primary-100 text-primary-800 border-primary-200'
                    : type === 'Donor'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : type === 'NGO'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-purple-100 text-purple-800 border-purple-200'
                }`}
              >
                {isGuest
                  ? '🌐 Public Portal'
                  : type === 'Donor'
                  ? '🍲 Food Donor Portal'
                  : type === 'NGO'
                  ? '🤝 NGO Rescue Terminal'
                  : '🛡️ Platform Admin Console'}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              {isGuest && 'ZeroBite: Smart Food Waste Management'}
              {type === 'Donor' && `Welcome back, ${profile?.name || 'Food Donor'}`}
              {type === 'NGO' && `Welcome back, ${profile?.name || 'Partner NGO'}`}
              {type === 'Admin' && `Operations Console — Welcome, ${profile?.name || 'Admin'}`}
            </h1>

            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              {isGuest &&
                'Connecting commercial food donors—restaurants, hotels, and banquet halls—with verified NGOs to eliminate food waste through predictive forecasting and real-time logistics.'}
              {type === 'Donor' &&
                'Report surplus meals from banquets and catering in seconds, forecast event leftovers before services conclude, and earn verified CSR and ESG sustainability credits.'}
              {type === 'NGO' &&
                'Monitor real-time surplus meal feeds from catering venues in your sector, claim donations matching your fleet capacity, and coordinate rapid distribution to community beneficiaries.'}
              {type === 'Admin' &&
                'Supervise city-wide food redistribution, monitor active donor broadcasts, verify NGO partner fleet capacities, and audit platform environmental impact telemetry.'}
            </p>
          </div>
        </div>

        {/* ── ROLE-SPECIFIC ACTION BUTTONS ── */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center gap-3">
          {/* Guest CTAs */}
          {isGuest && (
            <>
              <button onClick={() => navigate('/login')} className="btn btn-primary text-sm shadow-sm">
                Login to Get Started
              </button>
              <a href="#how-it-works" className="btn btn-outline text-sm">
                Explore How It Works ↓
              </a>
            </>
          )}

          {/* Donor CTAs */}
          {type === 'Donor' && (
            <>
              <Link to="/donor-dashboard" className="btn btn-primary text-sm shadow-sm">
                🍲 Open Donor Dashboard
              </Link>
              <Link to="/event-prediction" className="btn btn-outline text-sm">
                ⚡ Forecast Event Surplus
              </Link>
              <Link to="/csr-dashboard" className="btn btn-outline text-sm">
                🏅 View CSR Impact
              </Link>
            </>
          )}

          {/* NGO CTAs */}
          {type === 'NGO' && (
            <>
              <Link to="/surplus-alerts" className="btn btn-primary text-sm shadow-sm flex items-center gap-2">
                <span>🔔 Live Surplus Alerts</span>
                {activeAlertsCount > 0 && (
                  <span className="bg-white text-primary-700 font-bold text-xs px-2 py-0.5 rounded-full">
                    {activeAlertsCount}
                  </span>
                )}
              </Link>
              <Link to="/ngo-dashboard" className="btn btn-outline text-sm">
                🤝 NGO Fleet Dashboard
              </Link>
              <Link to="/emergency" className="btn btn-outline text-sm text-red-600 border-red-200 hover:bg-red-50">
                🚨 Emergency Protocol
              </Link>
            </>
          )}

          {/* Admin CTAs */}
          {type === 'Admin' && (
            <>
              <Link to="/admin" className="btn btn-primary text-sm shadow-sm">
                🛡️ Open Admin Console
              </Link>
              <Link
                to="/admin"
                onClick={() => {}}
                className="btn btn-outline text-sm"
              >
                📊 Platform Analytics &amp; KPIs
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── LIVE TELEMETRY STRIP ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 border border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Total Surplus Rescued</span>
            <span className="text-base">🍲</span>
          </div>
          <p className="text-2xl font-bold text-primary-800 mt-1">{totalMeals}+</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Portions diverted from landfills</p>
        </div>

        <div className="card p-4 border border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Active Surplus Broadcasts</span>
            <span className="text-base">📡</span>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-1">{activeAlertsCount}</p>
          <p className="text-[11px] text-amber-600 font-medium mt-0.5">Live awaiting NGO claim</p>
        </div>

        <div className="card p-4 border border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Completed Pickups</span>
            <span className="text-base">✅</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{totalAcceptedCount}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Delivered to beneficiaries</p>
        </div>

        <div className="card p-4 border border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>CO₂ Emissions Prevented</span>
            <span className="text-base">🌱</span>
          </div>
          <p className="text-2xl font-bold text-green-700 mt-1">{co2Prevented} kg</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Direct greenhouse gas mitigation</p>
        </div>
      </div>

      {/* ── ROLE-SPECIFIC CORE PILLARS ── */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {isGuest && 'Platform Capabilities'}
            {type === 'Donor' && 'Donor Tools & Features'}
            {type === 'NGO' && 'NGO Rescue Operations'}
            {type === 'Admin' && 'Platform Oversight Systems'}
          </h2>
          <p className="text-xs text-gray-500">
            {isGuest && 'How ZeroBite powers smart food redirection across commercial sectors'}
            {type === 'Donor' && 'Key instruments available to manage food surplus and track CSR'}
            {type === 'NGO' && 'Tools designed to optimize your organization’s distribution logistics'}
            {type === 'Admin' && 'Central governance, security auditing, and telemetry controls'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* GUEST PILLARS */}
          {isGuest && (
            <>
              <div className="card p-5 border border-gray-100 space-y-2 hover:shadow-md transition">
                <span className="text-2xl">⚡</span>
                <h3 className="font-bold text-gray-900 text-sm">Surplus Forecasting</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Predict banquet and catering leftovers before events conclude, giving transport logistics time to coordinate.
                </p>
              </div>
              <div className="card p-5 border border-gray-100 space-y-2 hover:shadow-md transition">
                <span className="text-2xl">🤝</span>
                <h3 className="font-bold text-gray-900 text-sm">Smart Priority Matching</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Algorithmic routing matching food quantity and dietary specialization with verified nearby NGOs.
                </p>
              </div>
              <div className="card p-5 border border-gray-100 space-y-2 hover:shadow-md transition">
                <span className="text-2xl">🌱</span>
                <h3 className="font-bold text-gray-900 text-sm">Verified CSR Impact</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Track authenticated food donations, emission offsets, and ESG performance metrics on donor profiles.
                </p>
              </div>
            </>
          )}

          {/* DONOR PILLARS */}
          {type === 'Donor' && (
            <>
              <div className="card p-5 border border-gray-100 space-y-2 hover:shadow-md transition">
                <span className="text-2xl">⚡</span>
                <h3 className="font-bold text-gray-900 text-sm">Event Surplus Predictor</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Input invited guests, checked-in numbers, and serving rate to calculate and broadcast food surplus ahead of closing.
                </p>
                <Link to="/event-prediction" className="text-xs font-semibold text-primary-700 hover:underline block pt-1">
                  Launch Predictor →
                </Link>
              </div>
              <div className="card p-5 border border-gray-100 space-y-2 hover:shadow-md transition">
                <span className="text-2xl">🍲</span>
                <h3 className="font-bold text-gray-900 text-sm">Real-Time Surplus Logging</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Post cooked meals, dry rations, or bakery surplus in under a minute with instant proximity matching to Jaipur NGOs.
                </p>
                <Link to="/donor-dashboard" className="text-xs font-semibold text-primary-700 hover:underline block pt-1">
                  Report Food →
                </Link>
              </div>
              <div className="card p-5 border border-gray-100 space-y-2 hover:shadow-md transition">
                <span className="text-2xl">🏅</span>
                <h3 className="font-bold text-gray-900 text-sm">CSR Impact &amp; Badges</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Earn Bronze, Silver, and Gold CSR badges as your cumulative donations rise, along with certified CO₂ offset telemetry.
                </p>
                <Link to="/csr-dashboard" className="text-xs font-semibold text-primary-700 hover:underline block pt-1">
                  View Badges &amp; Goals →
                </Link>
              </div>
            </>
          )}

          {/* NGO PILLARS */}
          {type === 'NGO' && (
            <>
              <div className="card p-5 border border-gray-100 space-y-2 hover:shadow-md transition">
                <span className="text-2xl">🔔</span>
                <h3 className="font-bold text-gray-900 text-sm">Live Surplus Broadcasts</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Receive instant alerts when nearby banquet halls, caterers, or hotels report edible surplus ready for pickup.
                </p>
                <Link to="/surplus-alerts" className="text-xs font-semibold text-primary-700 hover:underline block pt-1">
                  Inspect Live Feed →
                </Link>
              </div>
              <div className="card p-5 border border-gray-100 space-y-2 hover:shadow-md transition">
                <span className="text-2xl">🚐</span>
                <h3 className="font-bold text-gray-900 text-sm">One-Click Claim &amp; Dispatch</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Claim food parcels according to your transport capacity and volunteer availability to avoid logistical bottlenecks.
                </p>
                <Link to="/ngo-dashboard" className="text-xs font-semibold text-primary-700 hover:underline block pt-1">
                  Manage Fleet &amp; Pickups →
                </Link>
              </div>
              <div className="card p-5 border border-gray-100 space-y-2 hover:shadow-md transition">
                <span className="text-2xl">🚨</span>
                <h3 className="font-bold text-gray-900 text-sm">Urgent Emergency Response</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Rapid collection alerts for perishable cooked dishes needing immediate redistribution within safe shelf-life windows.
                </p>
                <Link to="/emergency" className="text-xs font-semibold text-primary-700 hover:underline block pt-1">
                  Emergency Terminal →
                </Link>
              </div>
            </>
          )}

          {/* ADMIN PILLARS */}
          {type === 'Admin' && (
            <>
              <div className="card p-5 border border-gray-100 space-y-2 hover:shadow-md transition">
                <span className="text-2xl">📊</span>
                <h3 className="font-bold text-gray-900 text-sm">Live Platform Analytics</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Monitor platform-wide meal flow, fulfillment velocity, and active broadcasts between commercial donors and partner NGOs.
                </p>
                <Link to="/admin" className="text-xs font-semibold text-purple-700 hover:underline block pt-1">
                  Open Overview →
                </Link>
              </div>
              <div className="card p-5 border border-gray-100 space-y-2 hover:shadow-md transition">
                <span className="text-2xl">👥</span>
                <h3 className="font-bold text-gray-900 text-sm">User &amp; Organization Directory</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Oversee verified NGO accounts, manage donor profiles, audit registration credentials, and update system permissions.
                </p>
                <Link to="/admin" className="text-xs font-semibold text-purple-700 hover:underline block pt-1">
                  Manage Accounts →
                </Link>
              </div>
              <div className="card p-5 border border-gray-100 space-y-2 hover:shadow-md transition">
                <span className="text-2xl">📡</span>
                <h3 className="font-bold text-gray-900 text-sm">Surplus Inventory Monitor</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Read-only audit stream tracking all reported food parcels, claims, and delivery timestamps across the metropolitan network.
                </p>
                <Link to="/admin" className="text-xs font-semibold text-purple-700 hover:underline block pt-1">
                  Surplus Telemetry →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── ROLE-TAILORED "HOW IT WORKS" WORKFLOW ── */}
      <div id="how-it-works" className="grid md:grid-cols-2 gap-6">
        <div className="card p-6 border border-gray-100 space-y-4">
          <div>
            <h3 className="font-bold text-base text-gray-900">
              {isGuest && 'How ZeroBite Works'}
              {type === 'Donor' && 'Your Donor Workflow'}
              {type === 'NGO' && 'Your NGO Rescue Workflow'}
              {type === 'Admin' && 'Platform Governance Protocols'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isGuest && 'Simple 4-step coordination between food sources and redistribution fleets'}
              {type === 'Donor' && 'From post-event excess to verified community impact'}
              {type === 'NGO' && 'From incoming broadcast to hot meal delivery for beneficiaries'}
              {type === 'Admin' && 'Ensuring security, transparency, and operational velocity'}
            </p>
          </div>

          <ol className="space-y-3 text-xs text-gray-700">
            {isGuest && (
              <>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-primary-100 text-primary-800 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                  <span><strong>Food Logging:</strong> Banquet halls and caterers enter surplus quantities or run event forecasts.</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-primary-100 text-primary-800 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                  <span><strong>Algorithmic Ranking:</strong> ZeroBite matches food with nearby NGOs based on distance and meal capacity.</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-primary-100 text-primary-800 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                  <span><strong>Rapid Collection:</strong> Verified NGOs claim the batch and dispatch volunteers to collect.</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-primary-100 text-primary-800 font-bold flex items-center justify-center shrink-0 text-xs">4</span>
                  <span><strong>Impact Logging:</strong> Meals served and CO₂ emissions saved are credited to donor CSR records.</span>
                </li>
              </>
            )}

            {type === 'Donor' && (
              <>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                  <span><strong>Log or Predict:</strong> Enter meal portion counts or forecast surplus before your banquet concludes.</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                  <span><strong>Automated NGO Alert:</strong> Nearby verified organizations are ranked and notified by distance and capacity.</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                  <span><strong>Smooth Handover:</strong> The claiming NGO arrives with proper transport containers for collection.</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">4</span>
                  <span><strong>CSR Accreditation:</strong> Receive live progress towards Bronze, Silver, and Gold corporate impact awards.</span>
                </li>
              </>
            )}

            {type === 'NGO' && (
              <>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                  <span><strong>Live Alert:</strong> Terminal alerts you when an event venue publishes fresh surplus food.</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                  <span><strong>Check Specifications:</strong> Verify food type (Cooked Meals, Bakery, Dry Rations), portions, and pickup deadline.</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                  <span><strong>Claim &amp; Dispatch:</strong> Claim the allocation with one click to lock the pickup for your team.</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-xs">4</span>
                  <span><strong>Feed Beneficiaries:</strong> Distribute meals to community kitchens and log completed distributions.</span>
                </li>
              </>
            )}

            {type === 'Admin' && (
              <>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                  <span><strong>Organization Verification:</strong> Review and verify NGO credentials, storage types, and meal capacities.</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                  <span><strong>Live Stream Telemetry:</strong> Monitor incoming food broadcasts and track algorithmic match health.</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                  <span><strong>Emergency Broadcast Oversight:</strong> Manage platform rapid response switches for crisis situations.</span>
                </li>
                <li className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center shrink-0 text-xs">4</span>
                  <span><strong>Audit Logs &amp; Analytics:</strong> Track platform activity records and city-wide environmental sustainability metrics.</span>
                </li>
              </>
            )}
          </ol>
        </div>

        {/* ── REGIONAL REDISTRIBUTION STATUS ── */}
        <div className="card p-6 border border-gray-100 space-y-4">
          <div>
            <h3 className="font-bold text-base text-gray-900">Regional Network Status</h3>
            <p className="text-xs text-gray-500 mt-0.5">Jaipur Urban Operations &amp; Partner Capacity</p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] uppercase font-bold text-gray-400">Partner NGOs</p>
              <p className="text-lg font-bold text-primary-800 mt-0.5">{ngos.length}</p>
              <p className="text-[10px] text-gray-400">Verified fleets</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] uppercase font-bold text-gray-400">Avg. Claim Time</p>
              <p className="text-lg font-bold text-primary-800 mt-0.5">14 min</p>
              <p className="text-[10px] text-gray-400">Pickup response</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] uppercase font-bold text-gray-400">Active Nodes</p>
              <p className="text-lg font-bold text-emerald-600 mt-0.5">100%</p>
              <p className="text-[10px] text-emerald-600 font-medium">System Online</p>
            </div>
          </div>

          <div className="pt-2 text-xs text-gray-600 space-y-2">
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Redistribution Algorithm:</span>
              <span className="font-semibold text-gray-800">Capacity ÷ Proximity Matrix</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Primary Coverage:</span>
              <span className="font-semibold text-gray-800">C-Scheme, Mansarovar, Malviya Nagar</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-gray-500">Supported Categories:</span>
              <span className="font-semibold text-gray-800">Cooked Meals, Bakery, Dry Rations</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
