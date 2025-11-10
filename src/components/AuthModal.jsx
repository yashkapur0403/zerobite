import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from './Toast.jsx'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../firebase'
import { doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore'

const signupTypes = ['Donor', 'NGO']
const loginTypes = ['Donor', 'NGO', 'Admin']

export default function AuthModal({ open, onClose, onAuthed, initialMode = 'login' }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [type, setType] = useState('Donor')
  const [address, setAddress] = useState('')
  const [contact, setContact] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  

  useEffect(() => {
    if (!open) {
      setMode('login')
      setName('')
      setType('Donor')
      setAddress('')
      setContact('')
      setEmail('')
      setPassword('')
      
    }
    if (open) {
      setMode(initialMode || 'login')
    }
  }, [open, initialMode])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  if (!open) return null

  const handleRegister = (e) => {
    e.preventDefault()
    if (!email || !password) { alert('Please enter email and password.'); return }
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (cred) => {
        const uid = cred.user.uid
        const profile = { name, type, address, contact, email, createdAt: serverTimestamp() }
        await setDoc(doc(db, 'users', uid), profile, { merge: true })
        toast('Account created successfully')
        onAuthed?.({ uid, ...profile }, 'register')
        onClose?.()
        navigate('/')
      })
      .catch((err) => {
        alert(err.message)
      })
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (!email || !password) { alert('Please enter email and password.'); return }
    signInWithEmailAndPassword(auth, email, password)
      .then(async (cred) => {
        const uid = cred.user.uid
        const snap = await getDoc(doc(db, 'users', uid))
        const profile = snap.exists() ? snap.data() : null
        if (!profile) {
          // create minimal profile if missing
          await setDoc(doc(db, 'users', uid), { email, type: 'Donor', createdAt: serverTimestamp() }, { merge: true })
        }
        toast('Logged in successfully')
        onAuthed?.({ uid, ...(profile || { email, type: 'Donor' }) }, 'login')
        onClose?.()
        navigate('/')
      })
      .catch((err) => alert(err.message))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center min-h-screen p-4" onClick={() => { onClose?.(); navigate('/') }}>
      <div
        role="dialog"
        aria-modal="true"
        className="card w-full max-w-md sm:max-w-lg p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-xs text-gray-500">{mode === 'login' ? 'Welcome to ZeroBite' : 'Create Your ZeroBite Account'}</div>
            <h3 className="text-lg font-semibold mt-1">{mode === 'login' ? 'Login' : 'Register'}</h3>
          </div>
          <button aria-label="Close" onClick={() => { onClose?.(); navigate('/') }} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        <div className="flex gap-2 mb-4">
          <button className={`btn flex-1 ${mode === 'login' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setMode('login')}>Login</button>
          <button className={`btn flex-1 ${mode === 'signup' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setMode('signup')}>Register</button>
        </div>

        {mode === 'signup' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">User Type</label>
              <select value={type} onChange={e=>setType(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2">
                {signupTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address / Locality</label>
              <input value={address} onChange={e => setAddress(e.target.value)} required className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="Area, City" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Number</label>
              <input value={contact} onChange={e => setContact(e.target.value)} required className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="e.g., 9876543210" />
            </div>
            <button type="submit" className="btn btn-primary w-full">Register</button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">User Type</label>
              <select value={type} onChange={e=>setType(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2">
                {loginTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="••••••••" />
            </div>

            <button type="submit" className="btn btn-primary w-full">Login</button>
          </form>
        )}

        {mode === 'login' ? (
          <p className="mt-3 text-xs text-gray-600">No account? <button className="text-primary-700 underline-offset-2 hover:underline" onClick={() => setMode('signup')}>Register</button></p>
        ) : (
          <p className="mt-3 text-xs text-gray-600">Already have an account? <button className="text-primary-700 underline-offset-2 hover:underline" onClick={() => setMode('login')}>Login</button></p>
        )}

        <p className="text-xs text-gray-500 mt-3">Authentication powered by Firebase.</p>
      </div>
    </div>
  )
}
