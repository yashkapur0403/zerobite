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
  const { demoLogin } = useAuth()
  const [mode, setMode]         = useState('login')
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { toast('Please enter email and password.', 'error'); return }
    setLoading(true)
    try {
      if (DEMO_MODE) {
        await demoLogin(email, password)
        toast('Logged in successfully')
        navigate('/')
      } else {
        if (mode === 'login') {
          const cred = await signInWithEmailAndPassword(auth, email, password)
          const snap = await getDoc(doc(db, 'users', cred.user.uid))
          if (!snap.exists()) {
            await setDoc(doc(db, 'users', cred.user.uid), { email, type: 'Donor', createdAt: serverTimestamp() }, { merge: true })
          }
          toast('Logged in successfully')
          navigate('/')
        } else {
          const cred = await createUserWithEmailAndPassword(auth, email, password)
          await setDoc(doc(db, 'users', cred.user.uid), { name, type, address, contact, email, createdAt: serverTimestamp() }, { merge: true })
          toast('Account created successfully')
          navigate('/')
        }
      }
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-6">

        {/* Logo + heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-primary-600 text-white items-center justify-center text-2xl font-bold shadow-lg">ZB</div>
          <h1 className="text-2xl font-bold text-primary-800">
            {mode === 'login' ? 'Welcome back' : 'Join ZeroBite'}
          </h1>
          <p className="text-sm text-gray-500">
            {mode === 'login' ? 'Log in to your ZeroBite account' : 'Create your ZeroBite account'}
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex rounded-2xl border border-primary-200 overflow-hidden shadow-sm">
          <button
            id="tab-login"
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mode === 'login' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-primary-50'}`}
            onClick={() => setMode('login')}
          >Login</button>
          <button
            id="tab-signup"
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mode === 'signup' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-primary-50'}`}
            onClick={() => setMode('signup')}
          >Register</button>
        </div>

        {/* Demo quick-fill (only in DEMO_MODE, only on login tab) */}
        {DEMO_MODE && mode === 'login' && (
          <div className="card p-4 space-y-3 border border-primary-100 bg-primary-50/60">
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Demo accounts — click to fill</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.uid}
                  id={`demo-fill-${a.profile.type.toLowerCase()}`}
                  onClick={() => fillDemo(a)}
                  className="flex flex-col items-start rounded-xl border border-primary-200 bg-white px-3 py-2.5 text-left hover:bg-primary-50 transition-colors"
                >
                  <span className="font-semibold text-primary-800 text-sm">{a.profile.name}</span>
                  <span className="text-[11px] text-gray-500">{a.profile.type} • {a.email}</span>
                  <span className="text-[11px] text-gray-400 mt-0.5">pw: {a.password}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form card */}
        <div className="card p-6 shadow-md">
          <form id="auth-form" onSubmit={handleSubmit} className="space-y-4">

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input id="input-name" value={name} onChange={e => setName(e.target.value)} required
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">User Type</label>
                  <select id="input-type" value={type} onChange={e => setType(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2">
                    {USER_TYPES.filter(t => t !== 'Admin').map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input id="input-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input id="input-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="••••••••" />
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Address / Locality</label>
                  <input id="input-address" value={address} onChange={e => setAddress(e.target.value)} required
                    className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    placeholder="Area, City" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Number</label>
                  <input id="input-contact" value={contact} onChange={e => setContact(e.target.value)} required
                    className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    placeholder="e.g., 9876543210" />
                </div>
              </>
            )}

            <button
              id="btn-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-2.5 text-base disabled:opacity-60"
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-xs text-center text-gray-500">
            {mode === 'login'
              ? <><span>No account? </span><button className="text-primary-700 hover:underline" onClick={() => setMode('signup')}>Register</button></>
              : <><span>Have an account? </span><button className="text-primary-700 hover:underline" onClick={() => setMode('login')}>Login</button></>
            }
          </p>
        </div>

        <p className="text-center text-xs text-gray-400">
          <Link to="/" className="hover:text-primary-600">← Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
