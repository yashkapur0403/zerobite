import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext.jsx'
import { toast } from '../components/Toast.jsx'
import { DEMO_MODE } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../firebase'
import { doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore'

const USER_TYPES = ['Donor', 'NGO', 'Admin']

export default function Login() {
  const navigate = useNavigate()
  const { demoLogin, demoRegister } = useAuth()
  const [mode, setMode]         = useState('login')
  const [selectedRoleTab, setSelectedRoleTab] = useState('Donor')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [type, setType]         = useState('Donor')
  const [address, setAddress]   = useState('')
  const [contact, setContact]   = useState('')
  const [loading, setLoading]   = useState(false)

  const fillDemo = (account) => {
    setEmail(account.email)
    setPassword(account.password)
    setSelectedRoleTab(account.profile.type)
  }

  const navigateToDashboard = (roleType) => {
    if (roleType === 'Admin') navigate('/admin')
    else if (roleType === 'NGO') navigate('/ngo-dashboard')
    else navigate('/donor-dashboard')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast('Please enter email and password.', 'error')
      return
    }
    setLoading(true)

    try {
      if (DEMO_MODE) {
        if (mode === 'login') {
          await demoLogin(email, password)
          // Find logged in account to know role
          const matched = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.trim().toLowerCase())
          const role = matched ? matched.profile.type : selectedRoleTab
          toast('Logged in successfully!', 'success')
          navigateToDashboard(role)
        } else {
          await demoRegister({ name, type, address, contact, email, password })
          toast('Account created and logged in!', 'success')
          navigateToDashboard(type)
        }
      } else {
        // Live Firebase
        if (mode === 'login') {
          const cred = await signInWithEmailAndPassword(auth, email, password)
          const snap = await getDoc(doc(db, 'users', cred.user.uid))
          const userProfile = snap.exists() ? snap.data() : { type: 'Donor' }
          if (!snap.exists()) {
            await setDoc(doc(db, 'users', cred.user.uid), { email, type: 'Donor', createdAt: serverTimestamp() }, { merge: true })
          }
          toast('Logged in successfully!', 'success')
          navigateToDashboard(userProfile.type || 'Donor')
        } else {
          const cred = await createUserWithEmailAndPassword(auth, email, password)
          const profile = { name, type, address, contact, email, createdAt: serverTimestamp() }
          await setDoc(doc(db, 'users', cred.user.uid), profile, { merge: true })
          toast('Account created successfully!', 'success')
          navigateToDashboard(type)
        }
      }
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Filter demo accounts by role for quick display
  const demoAccountsByRole = {
    Donor: DEMO_ACCOUNTS.filter(a => a.profile.type === 'Donor'),
    NGO: DEMO_ACCOUNTS.filter(a => a.profile.type === 'NGO'),
    Admin: DEMO_ACCOUNTS.filter(a => a.profile.type === 'Admin'),
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg space-y-6">

        {/* Logo + heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-primary-600 text-white items-center justify-center text-2xl font-bold shadow-lg shadow-primary-200">
            ZB
          </div>
          <h1 className="text-2xl font-bold text-primary-800">
            {mode === 'login' ? 'Role-Based Portal Access' : 'Join ZeroBite'}
          </h1>
          <p className="text-sm text-gray-500">
            {mode === 'login'
              ? 'Select your user role and log in to your dashboard'
              : 'Create a new account as a Donor or NGO partner'}
          </p>
        </div>

        {/* Tab toggle: Login vs Register */}
        <div className="flex rounded-2xl border border-primary-200 overflow-hidden shadow-sm bg-white p-1">
          <button
            id="tab-login"
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-primary-600 text-white shadow'
                : 'text-gray-600 hover:text-primary-700'
            }`}
            onClick={() => setMode('login')}
          >
            Sign In
          </button>
          <button
            id="tab-signup"
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-primary-600 text-white shadow'
                : 'text-gray-600 hover:text-primary-700'
            }`}
            onClick={() => setMode('signup')}
          >
            Register
          </button>
        </div>

        {/* Role Quick-Select in Demo Mode */}
        {DEMO_MODE && mode === 'login' && (
          <div className="card p-4 space-y-3 border border-primary-100 bg-primary-50/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary-800 tracking-wide uppercase">
                Demo Accounts Quick-Fill
              </span>
              <span className="text-[11px] bg-primary-200/80 text-primary-900 font-semibold px-2 py-0.5 rounded-full">
                Phase 2 Ready
              </span>
            </div>

            {/* Role filter pills */}
            <div className="flex gap-2">
              {['Donor', 'NGO', 'Admin'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRoleTab(r)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                    selectedRoleTab === r
                      ? 'bg-white border-primary-400 text-primary-800 shadow-xs'
                      : 'border-transparent text-gray-600 hover:bg-white/60'
                  }`}
                >
                  {r === 'Donor' ? '🍽 Donor' : r === 'NGO' ? '🤝 NGO' : '👑 Admin'}
                </button>
              ))}
            </div>

            {/* List of demo accounts for the selected role */}
            <div className="grid grid-cols-1 gap-2 pt-1">
              {(demoAccountsByRole[selectedRoleTab] || []).map((a) => (
                <button
                  key={a.uid}
                  type="button"
                  id={`demo-fill-${a.uid}`}
                  onClick={() => fillDemo(a)}
                  className="flex flex-col items-start rounded-xl border border-primary-200/90 bg-white p-2.5 text-left hover:border-primary-500 hover:shadow-xs transition-all group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-primary-900 text-xs group-hover:text-primary-600">
                      {a.profile.name}
                    </span>
                    <span className="text-[10px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded font-medium">
                      Fill
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1">{a.email}</span>
                  <span className="text-[10px] text-gray-400">pw: {a.password}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form card */}
        <div className="card p-6 shadow-md border border-gray-100 bg-white">
          <form id="auth-form" onSubmit={handleSubmit} className="space-y-4">

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Full Name / Organization</label>
                  <input
                    id="input-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. Royal Caterers or Feeding Hands"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Register As</label>
                  <select
                    id="input-type"
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white"
                  >
                    {USER_TYPES.filter(t => t !== 'Admin').map(t => (
                      <option key={t} value={t}>{t === 'Donor' ? '🍽 Food Donor (Event / Restaurant)' : '🤝 NGO (Redistribution Partner)'}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email Address</label>
              <input
                id="input-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
              <input
                id="input-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="••••••••"
              />
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Address / City</label>
                  <input
                    id="input-address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. C-Scheme, Jaipur"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Contact Phone Number</label>
                  <input
                    id="input-contact"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </>
            )}

            <button
              id="btn-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-2.5 text-base shadow font-semibold disabled:opacity-60"
            >
              {loading
                ? 'Processing…'
                : mode === 'login'
                ? `Sign In as ${selectedRoleTab}`
                : 'Create Account & Continue'}
            </button>
          </form>

          <p className="mt-4 text-xs text-center text-gray-500">
            {mode === 'login' ? (
              <>
                <span>Don't have an account? </span>
                <button
                  type="button"
                  className="text-primary-700 font-semibold hover:underline"
                  onClick={() => setMode('signup')}
                >
                  Register here
                </button>
              </>
            ) : (
              <>
                <span>Already registered? </span>
                <button
                  type="button"
                  className="text-primary-700 font-semibold hover:underline"
                  onClick={() => setMode('login')}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        <p className="text-center text-xs text-gray-400">
          <Link to="/" className="hover:text-primary-600 transition-colors">
            ← Return to Homepage
          </Link>
        </p>
      </div>
    </div>
  )
}
