import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db, DEMO_MODE } from '../firebase'

// ── Demo credentials ──────────────────────────────────────────────────────────
export const DEMO_ACCOUNTS = [
  {
    uid: 'demo-uid-001',
    email: 'demo@zerobite.app',
    password: 'demo1234',
    profile: {
      id: 'demo-uid-001',
      name: 'Arjun Mehta',
      type: 'Donor',
      email: 'demo@zerobite.app',
      contact: '9876543210',
      address: 'Jaipur, Rajasthan',
      avatar: 'AM',
    },
  },
  {
    uid: 'admin-uid-001',
    email: 'admin@zerobite.app',
    password: 'admin1234',
    profile: {
      id: 'admin-uid-001',
      name: 'Priya Sharma',
      type: 'Admin',
      email: 'admin@zerobite.app',
      contact: '9000000001',
      address: 'Mumbai, Maharashtra',
      avatar: 'PS',
    },
  },
]

const AuthCtx = createContext({ user: null, profile: null, loading: true, signOut: async () => {}, demoLogin: async () => {} })

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const unsubProfileRef       = useRef(null)

  useEffect(() => {
    if (DEMO_MODE) {
      // Start as guest — user must log in explicitly
      setUser(null)
      setProfile(null)
      setLoading(false)
      return
    }

    // ── LIVE MODE: real Firebase Auth + Firestore listener ──
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(true)
      if (unsubProfileRef.current) {
        unsubProfileRef.current()
        unsubProfileRef.current = null
      }
      setProfile(null)
      if (u?.uid) {
        const ref = doc(db, 'users', u.uid)
        unsubProfileRef.current = onSnapshot(ref, (snap) => {
          setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null)
          setLoading(false)
        }, () => setLoading(false))
      } else {
        setLoading(false)
      }
    })
    return () => {
      if (unsubProfileRef.current) unsubProfileRef.current()
      unsubAuth()
    }
  }, [])

  /** DEMO_MODE login — match by email + password */
  const demoLogin = async (email, password) => {
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email === email.trim().toLowerCase() && a.password === password
    )
    if (!account) throw new Error('Invalid email or password.')
    setUser({ uid: account.uid, email: account.email })
    setProfile(account.profile)
  }

  const signOut = async () => {
    if (DEMO_MODE) {
      setUser(null)
      setProfile(null)
      return
    }
    await fbSignOut(auth)
  }

  const value = useMemo(() => ({ user, profile, loading, signOut, demoLogin }), [user, profile, loading])

  return (
    <AuthCtx.Provider value={value}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  return useContext(AuthCtx)
}
